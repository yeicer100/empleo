import { useEffect, useState } from "react";
import { api } from "../services/api";
import { getUsuario, linkWhatsApp, ESTADOS } from "../services/sesion";

const CONTRATOS = [
  ["indefinido", "Indefinido"],
  ["termino_fijo", "Término fijo"],
  ["temporal", "Temporal"],
  ["prestacion_servicios", "Prestación de servicios"],
];

function fechaCorta(fecha) {
  return new Date(fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

function avisarNotificaciones() {
  window.dispatchEvent(new Event("notificaciones"));
}

// ---------------- Una postulacion recibida ----------------
function TarjetaPostulacion({ p, telefonoEmpresa, onCambio }) {
  const [abierta, setAbierta] = useState(false);
  const [aceptando, setAceptando] = useState(false);
  const [contacto, setContacto] = useState(telefonoEmpresa || "");
  const [mensaje, setMensaje] = useState("¡Felicitaciones! Tu perfil nos interesa. Escríbenos por WhatsApp para coordinar.");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const pendiente = p.estado === "enviada" || p.estado === "en_revision";

  async function abrir() {
    const nueva = !abierta;
    setAbierta(nueva);
    if (nueva && !p.visto_empresa) {
      try {
        await api.marcarVista(p.id_postulacion);
        onCambio({ ...p, visto_empresa: 1 });
        avisarNotificaciones();
      } catch {
        /* no es grave */
      }
    }
  }

  async function responder(estado) {
    setError("");
    setGuardando(true);
    try {
      await api.responderPostulacion(p.id_postulacion, {
        estado,
        contacto: estado === "aceptada" ? contacto : undefined,
        mensaje: estado === "aceptada" ? mensaje : undefined,
      });
      onCambio({
        ...p,
        estado,
        visto_empresa: 1,
        contacto_empresa: estado === "aceptada" ? contacto : null,
        mensaje_empresa: estado === "aceptada" ? mensaje : null,
      });
      setAceptando(false);
      avisarNotificaciones();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <article className={`card item ${!p.visto_empresa ? "item--nueva" : ""}`}>
      <div className="item__head" onClick={abrir} style={{ cursor: "pointer" }}>
        <div>
          <p className="item__title">
            {p.nombre_completo} {!p.visto_empresa && <span className="badge badge--amber">NUEVA</span>}
          </p>
          <p className="muted">
            Se postuló a <b>{p.oferta_titulo}</b> · {fechaCorta(p.fecha_postulacion)}
          </p>
        </div>
        <span className={`state ${ESTADOS[p.estado]?.clase || ""}`}>{ESTADOS[p.estado]?.texto || p.estado}</span>
      </div>

      <div className="job__meta">
        {p.nivel_estudio && <span className="chip">🎓 {p.nivel_estudio}</span>}
        {p.anios_experiencia != null && (
          <span className="chip">
            💼 {p.anios_experiencia} {p.anios_experiencia === 1 ? "año" : "años"} de experiencia
          </span>
        )}
      </div>

      {abierta && (
        <div className="item__body">
          {p.titulo_estudio && (
            <p>
              <b>Título / carrera:</b> {p.titulo_estudio}
            </p>
          )}
          {p.mensaje && (
            <p>
              <b>Mensaje del candidato:</b> “{p.mensaje}”
            </p>
          )}
          <p>
            <b>Correo:</b> {p.correo_candidato}
          </p>
          {p.telefono_contacto && (
            <p>
              <b>WhatsApp:</b> {p.telefono_contacto}{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href={linkWhatsApp(
                  p.telefono_contacto,
                  `Hola ${p.nombre_completo}, te escribimos por tu postulación a "${p.oferta_titulo}" en Empleo Quibdó.`
                )}
              >
                Escribirle
              </a>
            </p>
          )}

          {p.estado === "aceptada" && (
            <p className="item__good">
              Aceptada. Contacto que le enviaste: <b>{p.contacto_empresa}</b>
            </p>
          )}

          {pendiente && !aceptando && (
            <div className="item__actions">
              <button className="btn btn--primary btn--sm" onClick={() => setAceptando(true)}>
                Aceptar
              </button>
              <button className="btn btn--ghost btn--sm" disabled={guardando} onClick={() => responder("rechazado")}>
                Rechazar
              </button>
            </div>
          )}

          {pendiente && aceptando && (
            <div className="item__form">
              <div className="field">
                <label>WhatsApp o teléfono con el que te contactará el candidato</label>
                <input value={contacto} onChange={(e) => setContacto(e.target.value)} inputMode="tel" />
              </div>
              <div className="field">
                <label>Mensaje para el candidato</label>
                <textarea rows="3" maxLength="300" value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
              </div>
              <div className="item__actions">
                <button className="btn btn--primary btn--sm" disabled={guardando} onClick={() => responder("aceptada")}>
                  {guardando ? "Enviando..." : "Confirmar y enviar contacto"}
                </button>
                <button className="btn btn--ghost btn--sm" onClick={() => setAceptando(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {error && <p className="notice notice--error">{error}</p>}
        </div>
      )}
    </article>
  );
}

// ---------------- Formulario para publicar una oferta ----------------
function FormularioOferta({ onPublicada }) {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    titulo: "",
    id_categoria: "",
    ciudad: "Quibdó, Chocó",
    modalidad: "presencial",
    tipo_contrato: "indefinido",
    salario_min: "",
    salario_max: "",
    descripcion: "",
    requisitos: "",
    beneficios: "",
  });
  const [errores, setErrores] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api.listarCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  function cambiar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  const lineas = (texto) =>
    texto
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

  async function publicar(e) {
    e.preventDefault();
    const nuevos = [];
    if (!form.titulo.trim()) nuevos.push("El título es obligatorio");
    if (!form.id_categoria) nuevos.push("Selecciona una categoría");
    if (!form.ciudad.trim()) nuevos.push("La ciudad es obligatoria");
    if (!form.descripcion.trim()) nuevos.push("La descripción es obligatoria");
    if (form.salario_min && form.salario_max && Number(form.salario_min) > Number(form.salario_max)) {
      nuevos.push("El salario mínimo no puede ser mayor al máximo");
    }
    setErrores(nuevos);
    if (nuevos.length > 0) return;

    setEnviando(true);
    try {
      await api.crearOferta({
        titulo: form.titulo,
        id_categoria: form.id_categoria,
        ciudad: form.ciudad,
        modalidad: form.modalidad,
        tipo_contrato: form.tipo_contrato,
        salario_min: form.salario_min ? Number(form.salario_min) : null,
        salario_max: form.salario_max ? Number(form.salario_max) : null,
        descripcion: form.descripcion,
        requisitos: lineas(form.requisitos),
        beneficios: lineas(form.beneficios),
      });
      onPublicada();
    } catch (error) {
      setErrores([error.message]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card item" onSubmit={publicar}>
      <h2>Publicar una oferta laboral</h2>

      <div className="field">
        <label>Título del cargo</label>
        <input value={form.titulo} onChange={(e) => cambiar("titulo", e.target.value)} placeholder="Ej: Auxiliar administrativo" />
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Categoría</label>
          <select value={form.id_categoria} onChange={(e) => cambiar("id_categoria", e.target.value)}>
            <option value="">Selecciona...</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Ciudad</label>
          <input value={form.ciudad} onChange={(e) => cambiar("ciudad", e.target.value)} />
        </div>
        <div className="field">
          <label>Modalidad</label>
          <select value={form.modalidad} onChange={(e) => cambiar("modalidad", e.target.value)}>
            <option value="presencial">Presencial</option>
            <option value="remoto">Remoto</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>
        <div className="field">
          <label>Tipo de contrato</label>
          <select value={form.tipo_contrato} onChange={(e) => cambiar("tipo_contrato", e.target.value)}>
            {CONTRATOS.map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Salario mínimo (opcional)</label>
          <input type="number" min="0" value={form.salario_min} onChange={(e) => cambiar("salario_min", e.target.value)} />
        </div>
        <div className="field">
          <label>Salario máximo (opcional)</label>
          <input type="number" min="0" value={form.salario_max} onChange={(e) => cambiar("salario_max", e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Descripción</label>
        <textarea rows="5" value={form.descripcion} onChange={(e) => cambiar("descripcion", e.target.value)} />
      </div>
      <div className="field">
        <label>Requisitos (uno por línea, opcional)</label>
        <textarea rows="3" value={form.requisitos} onChange={(e) => cambiar("requisitos", e.target.value)} />
      </div>
      <div className="field">
        <label>Beneficios (uno por línea, opcional)</label>
        <textarea rows="3" value={form.beneficios} onChange={(e) => cambiar("beneficios", e.target.value)} />
      </div>

      {errores.length > 0 && (
        <ul className="auth__status">
          {errores.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      <button type="submit" className="btn btn--primary" disabled={enviando}>
        {enviando ? "Publicando..." : "Publicar oferta"}
      </button>
    </form>
  );
}

// ---------------- Panel completo ----------------
export default function PanelEmpresa() {
  const usuario = getUsuario();
  const [tab, setTab] = useState("postulaciones");
  const [ofertas, setOfertas] = useState(null);
  const [postulaciones, setPostulaciones] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [filtro, setFiltro] = useState("todas");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  function cargar() {
    api.misOfertasEmpresa().then(setOfertas).catch((e) => setError(e.message));
    api.postulacionesEmpresa().then(setPostulaciones).catch((e) => setError(e.message));
  }

  useEffect(() => {
    cargar();
    api.perfilEmpresa().then(setPerfil).catch(() => {});
  }, []);

  function actualizarPostulacion(nueva) {
    setPostulaciones((lista) => lista.map((p) => (p.id_postulacion === nueva.id_postulacion ? nueva : p)));
  }

  async function cambiarEstado(oferta, estado) {
    try {
      await api.cambiarEstadoOferta(oferta.id_oferta, estado);
      setOfertas((lista) => lista.map((o) => (o.id_oferta === oferta.id_oferta ? { ...o, estado } : o)));
    } catch (e) {
      setError(e.message);
    }
  }

  const nuevas = postulaciones ? postulaciones.filter((p) => !p.visto_empresa).length : 0;

  const filtradas = (postulaciones || []).filter((p) => {
    if (filtro === "pendientes") return p.estado === "enviada" || p.estado === "en_revision";
    if (filtro === "aceptadas") return p.estado === "aceptada";
    if (filtro === "rechazadas") return p.estado === "rechazado";
    return true;
  });

  return (
    <div className="container panel">
      <div className="page-head">
        <span className="eyebrow">Panel de empresa</span>
        <h1>{usuario?.nombre}</h1>
        <p>Publica tus ofertas, revisa quién se postuló y responde a los candidatos.</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "postulaciones" ? "is-active" : ""}`} onClick={() => setTab("postulaciones")}>
          Postulaciones {nuevas > 0 && <span className="navbar__badge">{nuevas}</span>}
        </button>
        <button className={`tab ${tab === "ofertas" ? "is-active" : ""}`} onClick={() => setTab("ofertas")}>
          Mis ofertas {ofertas ? `(${ofertas.length})` : ""}
        </button>
        <button className={`tab ${tab === "publicar" ? "is-active" : ""}`} onClick={() => setTab("publicar")}>
          + Publicar oferta
        </button>
      </div>

      {error && <p className="notice notice--error">{error}</p>}
      {aviso && <p className="notice">{aviso}</p>}

      {tab === "postulaciones" && (
        <>
          <div className="filters-row">
            {[
              ["todas", "Todas"],
              ["pendientes", "Pendientes"],
              ["aceptadas", "Aceptadas"],
              ["rechazadas", "Rechazadas"],
            ].map(([valor, texto]) => (
              <button key={valor} className={`chip ${filtro === valor ? "chip--green" : ""}`} onClick={() => setFiltro(valor)}>
                {texto}
              </button>
            ))}
          </div>

          <div className="stack">
            {postulaciones === null ? (
              <p className="muted">Cargando...</p>
            ) : filtradas.length === 0 ? (
              <p className="muted">
                {postulaciones.length === 0
                  ? "Todavía no has recibido postulaciones. Cuando un candidato se postule a una de tus ofertas, te aparecerá aquí."
                  : "No hay postulaciones con este filtro."}
              </p>
            ) : (
              filtradas.map((p) => (
                <TarjetaPostulacion
                  key={p.id_postulacion}
                  p={p}
                  telefonoEmpresa={perfil?.telefono}
                  onCambio={actualizarPostulacion}
                />
              ))
            )}
          </div>
        </>
      )}

      {tab === "ofertas" && (
        <div className="stack">
          {ofertas === null ? (
            <p className="muted">Cargando...</p>
          ) : ofertas.length === 0 ? (
            <p className="muted">
              Aún no has publicado ofertas.{" "}
              <button className="linklike" onClick={() => setTab("publicar")}>
                Publica la primera
              </button>
            </p>
          ) : (
            ofertas.map((o) => (
              <article key={o.id_oferta} className="card item">
                <div className="item__head">
                  <div>
                    <p className="item__title">{o.titulo}</p>
                    <p className="muted">
                      {o.categoria} · {o.ciudad} · Publicada el {fechaCorta(o.fecha_publicacion)}
                    </p>
                  </div>
                  <span className={`state ${o.estado === "activa" ? "state--green" : o.estado === "pausada" ? "state--amber" : "state--red"}`}>
                    {o.estado}
                  </span>
                </div>
                <div className="job__meta">
                  <span className="chip">👁 {o.vistas} vistas</span>
                  <span className="chip">
                    📨 {o.total_postulaciones} postulaciones{o.nuevas > 0 ? ` (${o.nuevas} nuevas)` : ""}
                  </span>
                </div>
                <div className="item__actions">
                  {o.estado !== "activa" && (
                    <button className="btn btn--ghost btn--sm" onClick={() => cambiarEstado(o, "activa")}>
                      Activar
                    </button>
                  )}
                  {o.estado === "activa" && (
                    <button className="btn btn--ghost btn--sm" onClick={() => cambiarEstado(o, "pausada")}>
                      Pausar
                    </button>
                  )}
                  {o.estado !== "cerrada" && (
                    <button className="btn btn--ghost btn--sm" onClick={() => cambiarEstado(o, "cerrada")}>
                      Cerrar
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {tab === "publicar" && (
        <FormularioOferta
          onPublicada={() => {
            cargar();
            setAviso("¡Oferta publicada! Ya aparece para los candidatos.");
            setTab("ofertas");
          }}
        />
      )}
    </div>
  );
}
