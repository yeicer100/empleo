import { useEffect, useState } from "react";
import { api } from "../services/api";

const NIVELES = [
  "Sin estudios formales",
  "Bachiller",
  "Tecnico",
  "Tecnologo",
  "Profesional",
  "Especializacion",
  "Maestria",
];

// Ventana que le pide al candidato sus datos antes de enviar la postulacion.
export default function PostularModal({ oferta, onCerrar, onEnviada }) {
  const [form, setForm] = useState({
    nombre_completo: "",
    nivel_estudio: "",
    titulo_estudio: "",
    anios_experiencia: "",
    telefono_contacto: "",
    mensaje: "",
  });
  const [errores, setErrores] = useState([]);
  const [enviando, setEnviando] = useState(false);

  // Rellena nombre y telefono con los datos de la cuenta
  useEffect(() => {
    api
      .perfilCandidato()
      .then((p) =>
        setForm((f) => ({ ...f, nombre_completo: p.nombre_completo || "", telefono_contacto: p.telefono || "" }))
      )
      .catch(() => {});
  }, []);

  function cambiar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();

    const nuevos = [];
    if (!form.nombre_completo.trim()) nuevos.push("Escribe tu nombre completo");
    if (!form.nivel_estudio) nuevos.push("Selecciona tu nivel de estudio");
    if (form.anios_experiencia === "" || Number(form.anios_experiencia) < 0) {
      nuevos.push("Escribe tus años de experiencia (0 si no tienes)");
    }
    const digitos = form.telefono_contacto.replace(/\D/g, "");
    if (digitos.length < 7 || digitos.length > 15) nuevos.push("Escribe un WhatsApp válido (solo números)");
    setErrores(nuevos);
    if (nuevos.length > 0) return;

    setEnviando(true);
    try {
      await api.postular(oferta.id_oferta, { ...form, anios_experiencia: Number(form.anios_experiencia) });
      onEnviada();
    } catch (error) {
      setErrores([error.message]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal" onClick={onCerrar}>
      <div className="card modal__card" onClick={(e) => e.stopPropagation()}>
        <h2>Postularme a {oferta.titulo}</h2>
        <p className="muted">
          Estos datos le llegarán a {oferta.empresa}. Si te aceptan, recibirás su contacto en “Mis postulaciones”.
        </p>

        <form onSubmit={enviar}>
          <div className="field">
            <label>Nombre completo</label>
            <input value={form.nombre_completo} onChange={(e) => cambiar("nombre_completo", e.target.value)} />
          </div>

          <div className="field">
            <label>Nivel de estudio</label>
            <select value={form.nivel_estudio} onChange={(e) => cambiar("nivel_estudio", e.target.value)}>
              <option value="">Selecciona...</option>
              {NIVELES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Título o carrera (opcional)</label>
            <input
              value={form.titulo_estudio}
              onChange={(e) => cambiar("titulo_estudio", e.target.value)}
              placeholder="Ej: Técnico en sistemas"
            />
          </div>

          <div className="field">
            <label>Años de experiencia</label>
            <input
              type="number"
              min="0"
              max="60"
              value={form.anios_experiencia}
              onChange={(e) => cambiar("anios_experiencia", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Tu WhatsApp o teléfono</label>
            <input
              value={form.telefono_contacto}
              onChange={(e) => cambiar("telefono_contacto", e.target.value)}
              placeholder="3001234567"
              inputMode="tel"
            />
          </div>

          <div className="field">
            <label>Cuéntale a la empresa por qué eres la persona indicada (opcional)</label>
            <textarea
              rows="4"
              maxLength="500"
              value={form.mensaje}
              onChange={(e) => cambiar("mensaje", e.target.value)}
            />
          </div>

          {errores.length > 0 && (
            <ul className="auth__status">
              {errores.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar postulación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
