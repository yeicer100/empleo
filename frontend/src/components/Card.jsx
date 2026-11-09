import { Link } from "react-router-dom";

function formatearSalario(min, max) {
  if (!min && !max) return "Salario a convenir";
  const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;
  return `${fmt(min)} - ${fmt(max)}`;
}

function tiempoDesde(fecha) {
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000);
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Hace 1d";
  return `Hace ${dias}d`;
}

export default function Card({ oferta }) {
  return (
    <article className="card job">
      <div className="job__head">
        <span className="brand__mark">{oferta.empresa.slice(0, 2).toUpperCase()}</span>
        <div className="job__id">
          <p className="job__title">{oferta.titulo}</p>
          <p className="job__company">{oferta.empresa}</p>
        </div>
        {oferta.destacada ? <span className="badge badge--amber">TOP</span> : null}
      </div>

      <p className="job__meta-loc">📍 {oferta.ciudad}</p>

      <div className="job__meta">
        <span className="chip chip--green">{formatearSalario(oferta.salario_min, oferta.salario_max)}</span>
        <span className="chip">{oferta.tipo_contrato.replace("_", " ")}</span>
        <span className="chip">{oferta.categoria}</span>
      </div>

      <div className="job__foot">
        <span className="job__time">{tiempoDesde(oferta.fecha_publicacion)}</span>
        <Link to={`/empleos/${oferta.id_oferta}`} className="btn btn--primary btn--sm">
          Ver oferta →
        </Link>
      </div>
    </article>
  );
}
