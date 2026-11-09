import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";

const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function telefonoOk(valor) {
  const digitos = String(valor || "").replace(/\D/g, "");
  return digitos.length >= 7 && digitos.length <= 15;
}

export default function Login({ modo = "login", tipoInicial = "candidato" }) {
  // "tipo" solo aplica cuando modo = "register": candidato o empresa
  const [tipo, setTipo] = useState(tipoInicial);
  const [categorias, setCategorias] = useState([]);
  const [errorCategorias, setErrorCategorias] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState([]);
  const navigate = useNavigate();
  const { state } = useLocation();

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    documento: "",
    telefono: "",
    nombreEmpresa: "",
    nit: "",
    idCategoria: "",
    correo: "",
    password: "",
    confirmarPassword: "",
    aceptaTerminos: false,
  });

  function cargarCategorias() {
    setErrorCategorias("");
    api
      .listarCategorias()
      .then((datos) => {
        setCategorias(datos);
        if (datos.length === 0) setErrorCategorias("No hay sectores registrados en la base de datos.");
      })
      .catch((error) => {
        setCategorias([]);
        setErrorCategorias(error.message);
      });
  }

  useEffect(() => {
    if (modo === "register" && tipo === "empresa") {
      cargarCategorias();
    }
  }, [modo, tipo]);

  function actualizarCampo(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  // --- Validacion en el navegador, antes de llamar a la API ---
  function validar() {
    const nuevosErrores = [];

    if (!CORREO_REGEX.test(form.correo)) {
      nuevosErrores.push("Ingresa un correo valido");
    }

    if (form.password.length < 8) {
      nuevosErrores.push("La contrasena debe tener minimo 8 caracteres");
    }

    if (modo === "register") {
      if (form.password !== form.confirmarPassword) {
        nuevosErrores.push("Las contrasenas no coinciden");
      }
      if (!form.aceptaTerminos) {
        nuevosErrores.push("Debes aceptar los terminos y la privacidad");
      }

      if (tipo === "candidato") {
        if (!form.nombres.trim()) nuevosErrores.push("El nombre es obligatorio");
        if (!form.apellidos.trim()) nuevosErrores.push("El apellido es obligatorio");
        if (!form.documento.trim()) nuevosErrores.push("El documento es obligatorio");
        if (form.telefono && !telefonoOk(form.telefono)) nuevosErrores.push("El telefono no es valido (solo numeros)");
      } else {
        if (!form.nombreEmpresa.trim()) nuevosErrores.push("El nombre de la empresa es obligatorio");
        if (!form.nit.trim()) nuevosErrores.push("El NIT es obligatorio");
        if (!form.idCategoria) nuevosErrores.push("Selecciona un sector");
        if (!telefonoOk(form.telefono)) nuevosErrores.push("Escribe el WhatsApp de la empresa (solo numeros)");
      }
    }

    setErrores(nuevosErrores);
    return nuevosErrores.length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validar()) return;

    setCargando(true);
    setErrores([]);

    try {
      if (modo === "login") {
        const datos = await api.login(form.correo, form.password);
        localStorage.setItem("token", datos.token);
        localStorage.setItem("usuario", JSON.stringify(datos.usuario));
        window.dispatchEvent(new Event("auth"));
        // Cada rol entra a su propia pantalla
        navigate(datos.usuario.rol === "empresa" ? "/panel-empresa" : "/");
      } else if (tipo === "candidato") {
        await api.registrarCandidato({
          correo: form.correo,
          password: form.password,
          documento: form.documento,
          nombres: form.nombres,
          apellidos: form.apellidos,
          telefono: form.telefono,
        });
        navigate("/login", { state: { ok: "Cuenta creada. Ya puedes iniciar sesion." } });
      } else {
        await api.registrarEmpresa({
          correo: form.correo,
          password: form.password,
          nit: form.nit,
          nombre: form.nombreEmpresa,
          id_categoria: form.idCategoria,
          telefono: form.telefono,
          ciudad: "Quibdo, Choco",
        });
        navigate("/login", { state: { ok: "Cuenta creada. Ya puedes iniciar sesion." } });
      }
    } catch (error) {
      setErrores([error.message]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth">
      <div className="card auth__card">
        <h1>{modo === "login" ? "Inicia sesion" : "Crea tu cuenta"}</h1>
        <p className="auth__sub">
          {modo === "login" ? "Entra a tu cuenta de Empleo Quibdo" : "Unete a Empleo Quibdo"}
        </p>

        {modo === "register" && (
          <div className="seg">
            <button type="button" className={tipo === "candidato" ? "is-active" : ""} onClick={() => setTipo("candidato")}>
              Soy candidato
            </button>
            <button type="button" className={tipo === "empresa" ? "is-active" : ""} onClick={() => setTipo("empresa")}>
              Soy empresa
            </button>
          </div>
        )}

        {modo === "login" && state?.ok && <p className="auth__sub">{state.ok}</p>}

        <form onSubmit={handleSubmit}>
          {modo === "register" && tipo === "candidato" && (
            <>
              <div className="field">
                <label>Nombres</label>
                <input value={form.nombres} onChange={(e) => actualizarCampo("nombres", e.target.value)} />
              </div>
              <div className="field">
                <label>Apellidos</label>
                <input value={form.apellidos} onChange={(e) => actualizarCampo("apellidos", e.target.value)} />
              </div>
              <div className="field">
                <label>Documento</label>
                <input value={form.documento} onChange={(e) => actualizarCampo("documento", e.target.value)} />
              </div>
              <div className="field">
                <label>WhatsApp / teléfono (opcional)</label>
                <input
                  value={form.telefono}
                  onChange={(e) => actualizarCampo("telefono", e.target.value)}
                  placeholder="3001234567"
                  inputMode="tel"
                />
              </div>
            </>
          )}

          {modo === "register" && tipo === "empresa" && (
            <>
              <div className="field">
                <label>Nombre de la empresa</label>
                <input value={form.nombreEmpresa} onChange={(e) => actualizarCampo("nombreEmpresa", e.target.value)} />
              </div>
              <div className="field">
                <label>NIT</label>
                <input value={form.nit} onChange={(e) => actualizarCampo("nit", e.target.value)} />
              </div>
              <div className="field">
                <label>Sector</label>
                <select value={form.idCategoria} onChange={(e) => actualizarCampo("idCategoria", e.target.value)}>
                  <option value="">Selecciona un sector</option>
                  {categorias.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {errorCategorias && (
                  <p className="auth__status">
                    No se pudieron cargar los sectores: {errorCategorias}{" "}
                    <button type="button" className="btn" onClick={cargarCategorias}>
                      Reintentar
                    </button>
                  </p>
                )}
              </div>
              <div className="field">
                <label>WhatsApp de la empresa</label>
                <input
                  value={form.telefono}
                  onChange={(e) => actualizarCampo("telefono", e.target.value)}
                  placeholder="3001234567"
                  inputMode="tel"
                />
              </div>
            </>
          )}

          <div className="field">
            <label>Correo {modo === "register" && tipo === "empresa" ? "corporativo" : "electronico"}</label>
            <input
              type="email"
              value={form.correo}
              onChange={(e) => actualizarCampo("correo", e.target.value)}
              placeholder="tu@correo.com"
            />
          </div>

          <div className="field">
            <label>Contrasena</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => actualizarCampo("password", e.target.value)}
              placeholder="Minimo 8 caracteres"
            />
          </div>

          {modo === "register" && (
            <div className="field">
              <label>Confirmar contrasena</label>
              <input
                type="password"
                value={form.confirmarPassword}
                onChange={(e) => actualizarCampo("confirmarPassword", e.target.value)}
              />
            </div>
          )}

          {modo === "register" && (
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.aceptaTerminos}
                onChange={(e) => actualizarCampo("aceptaTerminos", e.target.checked)}
              />
              Acepto los Terminos y la Privacidad
            </label>
          )}

          {errores.length > 0 && (
            <ul className="auth__status">
              {errores.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}

          <button type="submit" className="btn btn--primary btn--block" disabled={cargando}>
            {cargando ? "Procesando..." : modo === "login" ? "Iniciar sesion" : "Crear cuenta →"}
          </button>
        </form>

        <p className="auth__switch">
          {modo === "login" ? (
            <>
              ¿No tienes cuenta? <Link to="/registro">Registrate aqui</Link>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
