export default function About() {
  return (
    <div className="container about">
      <div className="about__head">
        <span className="eyebrow">Nosotros</span>
        <h1>Sobre Empleo Quibdó</h1>
        <p>
          La plataforma de empleo más avanzada del Chocó, comprometida con el desarrollo
          económico y social de la región.
        </p>
      </div>

      <div className="about__grid">
        <div className="card about__card about__card--violet">
          <div className="about__icon">🎯</div>
          <h2>Nuestra misión</h2>
          <p>
            Conectar el talento chocoano con las mejores oportunidades laborales,
            contribuyendo al desarrollo económico del Chocó.
          </p>
        </div>

        <div className="card about__card about__card--green">
          <div className="about__icon">🔭</div>
          <h2>Nuestra visión</h2>
          <p>
            Ser la plataforma de empleo de referencia para el Pacífico colombiano,
            reconocida por su impacto social e innovación.
          </p>
        </div>
      </div>
    </div>
  );
}
