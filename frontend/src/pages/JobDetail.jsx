import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import { CheckIcon } from "../components/Icons";
import PostularModal from "../components/PostularModal";
import { getUsuario, ESTADOS } from "../services/sesion";

function formatearSalario(min, max) {
  if (!min && !max) return "Salario a convenir";
  const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;
  return `${fmt(min)} - ${fmt(max)}`;
}

export default function JobDetail() {
  const { id } = useParams();
  const [oferta, setOferta] = useState(null);
  const [error, setError] = useState(null);
  const [miEstado, setMiEstado] = useState({ postulado: false, estado: null, guardada: false });
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aviso, setAviso] = useState("");

  const usuario = getUsuario();
  const esCandidato = usuario?.rol === "candidato";

  useEffect(() => {
    api
      .obtenerOferta(id)
      .then(setOferta)
      .catch((err) => setError(err.message));
  }, [id]);

  // Si es candidato, mira si ya se postulo o guardo esta oferta
  useEffect(() => {
    if (esCandidato) {
      api.miEstadoOferta(id).then(setMiEstado).catch(() => {});
    }
  }, [id, esCandidato]);

  async function alternarGuardada() {
    setAviso("");
    try {
      const r = await api.guardarOferta(id);
      setMiEstado((m) => ({ ...m, guardada: r.guardada }));
    } catch (err) {
      setAviso(err.message);
    }
  }

  function postulacionEnviada() {
    setModalAbierto(false);
    setMiEstado((m) => ({ ...m, postulado: true, estado: "enviada" }));
    setAviso("¡Listo! Tu postulación fue enviada a la empresa. Si te aceptan, verás su contacto en “Mis postulaciones”.");
  }

  if (error) {
    return (
      <div className="container detail">
        <p className="muted">No se pudo cargar la oferta: {error}</p>
        <Link to="/empleos" className="detail__back">← Volver a empleos</Link>
      </div>
    );
  }

  if (!oferta) {
    return <div className="container detail"><p className="muted">Cargando...</p></div>;
  }

  return (
    <div className="container detail">
      <Link to="/empleos" className="detail__back">← Volver a empleos</Link>

      <div className="card detail__card">
        <div className="job__head">
          <span className="brand__mark">{oferta.empresa.slice(0, 2).toUpperCase()}</span>
          <div className="job__id">
            <h1 className="detail__title">{oferta.titulo}</h1>
            <p className="job__company">{oferta.empresa}</p>
          </div>
          {oferta.destacada ? <span className="badge badge--amber">TOP</span> : null}
        </div>

        <div className="job__meta">
          <span className="chip">📍 {oferta.ciudad}</span>
          <span className="chip chip--green">{formatearSalario(oferta.salario_min, oferta.salario_max)}</span>
          <span className="chip">{oferta.tipo_contrato.replace("_", " ")}</span>
          <span className="chip">{oferta.categoria}</span>
        </div>

        <p className="detail__text">{oferta.descripcion}</p>

        {oferta.requisitos?.length > 0 && (
          <div>
            <h2>Requisitos</h2>
            <ul className="detail__list">
              {oferta.requisitos.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {oferta.beneficios?.length > 0 && (
          <div>
            <h2>Beneficios</h2>
            <ul className="detail__list">
              {oferta.beneficios.map((b) => (
                <li key={b}><CheckIcon /> {b}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="detail__actions">
          {!usuario ? (
            <>
              <Link to="/login" className="btn btn--primary">
                Inicia sesión para postularte
              </Link>
              <Link to="/registro" className="btn btn--ghost">
                Crear cuenta de candidato
              </Link>
            </>
          ) : esCandidato ? (
            <>
              {miEstado.postulado ? (
                <button className="btn btn--primary" disabled>
                  Ya te postulaste · {ESTADOS[miEstado.estado]?.texto || miEstado.estado}
                </button>
              ) : (
                <button className="btn btn--primary" onClick={() => setModalAbierto(true)}>
                  Postularme ahora
                </button>
              )}
              <button className="btn btn--ghost" onClick={alternarGuardada}>
                {miEstado.guardada ? "★ Oferta guardada (quitar)" : "☆ Guardar oferta"}
              </button>
            </>
          ) : null}
          <span className="muted">{oferta.total_postulantes} postulantes</span>
        </div>

        {aviso && <p className="notice">{aviso}</p>}
      </div>

      {modalAbierto && (
        <PostularModal
          oferta={{ ...oferta, id_oferta: oferta.id_oferta }}
          onCerrar={() => setModalAbierto(false)}
          onEnviada={postulacionEnviada}
        />
      )}
    </div>
  );
}
