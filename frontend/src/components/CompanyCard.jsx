export default function CompanyCard({ empresa }) {
  return (
    <article className="card company">
      <div className="company__head">
        <span className="brand__mark">{empresa.nombre.slice(0, 2).toUpperCase()}</span>
        <div>
          <p className="company__name">{empresa.nombre}</p>
          <p className="company__cat">{empresa.categoria}</p>
        </div>
      </div>

      <p className="company__desc">{empresa.descripcion}</p>

      <div className="company__foot">
        <span className="company__loc">📍 {empresa.ciudad}</span>
        <span className="chip chip--green">{empresa.vacantes} vacantes</span>
      </div>
    </article>
  );
}
