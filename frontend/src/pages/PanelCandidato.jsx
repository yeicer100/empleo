import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import { api } from "../services/api";
import { getUsuario, linkWhatsApp, ESTADOS } from "../services/sesion";

function fechaCorta(fecha) {
  return new Date(fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function PanelCandidato() {
  const usuario = getUsuario();
  const [tab, setTab] = useState("postulaciones");
  const [postulaciones, setPostulaciones] = useState(null);
  const [guardadas, setGuardadas] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.misPostulaciones().then(setPostulaciones).catch((e) => setError(e.message));
    api.misGuardadas().then(setGuardadas).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="container panel">
      <div className="page-head">
        <span className="eyebrow">Mi cuenta</span>
        <h1>Hola, {usuario?.nombre}</h1>
        <p>Sigue el estado de tus postulaciones y revisa las ofertas que guardaste.</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "postulaciones" ? "is-active" : ""}`} onClick={() => setTab("postulaciones")}>
          Mis postulaciones {postulaciones ? `(${postulaciones.length})` : ""}
        </button>
        <button className={`tab ${tab === "guardadas" ? "is-active" : ""}`} onClick={() => setTab("guardadas")}>
          Ofertas guardadas {guardadas ? `(${guardadas.length})` : ""}
        </button>
      </div>

      {error && <p className="notice notice--error">{error}</p>}

      {tab === "postulaciones" && (
        <div className="stack">
          {postulaciones === null ? (
            <p className="muted">Cargando...</p>
          ) : postulaciones.length === 0 ? (
            <p className="muted">
              Aún no te has postulado a ninguna oferta. <Link to="/empleos">Ver empleos</Link>
            </p>
          ) : (
            postulaciones.map((p) => (
              <article key={p.id_postulacion} className="card item">
                <div className="item__head">
                  <div>
                    <Link to={`/empleos/${p.id_oferta}`} className="item__title">
                      {p.titulo}
                    </Link>
                    <p className="muted">
                      {p.empresa} · Enviada el {fechaCorta(p.fecha_postulacion)}
                    </p>
                  </div>
                  <span className={`state ${ESTADOS[p.estado]?.clase || ""}`}>{ESTADOS[p.estado]?.texto || p.estado}</span>
                </div>

                {p.estado === "aceptada" && (
                  <div className="item__good">
                    <p>
                      <b>¡{p.empresa} aceptó tu postulación!</b>
                    </p>
                    {p.mensaje_empresa && <p>“{p.mensaje_empresa}”</p>}
                    {p.contacto_empresa && (
                      <p>
                        Contacto de la empresa: <b>{p.contacto_empresa}</b>
                      </p>
                    )}
                    {p.contacto_empresa && (
                      <a
                        className="btn btn--primary btn--sm"
                        target="_blank"
                        rel="noreferrer"
                        href={linkWhatsApp(
                          p.contacto_empresa,
                          `Hola, soy ${usuario?.nombre}. Vi que aceptaron mi postulación a "${p.titulo}" en Empleo Quibdó y quiero coordinar los siguientes pasos.`
                        )}
                      >
                        Escribir por WhatsApp
                      </a>
                    )}
                  </div>
                )}

                {p.estado === "rechazado" && (
                  <p className="muted">
                    La empresa decidió no continuar con tu postulación.
                    {p.mensaje_empresa ? ` Mensaje: “${p.mensaje_empresa}”` : ""}
                  </p>
                )}
                {(p.estado === "enviada" || p.estado === "en_revision") && (
                  <p className="muted">Esperando respuesta de la empresa.</p>
                )}
              </article>
            ))
          )}
        </div>
      )}

      {tab === "guardadas" && (
        <>
          {guardadas === null ? (
            <p className="muted">Cargando...</p>
          ) : guardadas.length === 0 ? (
            <p className="muted">
              No has guardado ofertas todavía. <Link to="/empleos">Ver empleos</Link>
            </p>
          ) : (
            <div className="cards-grid">
              {guardadas.map((oferta) => (
                <Card key={oferta.id_oferta} oferta={oferta} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
