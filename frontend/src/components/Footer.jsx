import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link to="/" className="brand">
            <span className="brand__mark">EQ</span>
            <span className="brand__text">
              <strong>Empleo</strong>
              <small>QUIBDO</small>
            </span>
          </Link>
          <p>Conectando el talento chocoano con las mejores oportunidades laborales.</p>
        </div>

        <div>
          <p className="footer__title">Candidatos</p>
          <ul>
            <li><Link to="/empleos">Buscar empleo</Link></li>
            <li><Link to="/registro">Crear perfil</Link></li>
          </ul>
        </div>

        <div>
          <p className="footer__title">Empresas</p>
          <ul>
            <li><Link to="/registro-empresa">Publicar vacante</Link></li>
            <li><Link to="/empresas">Candidatos</Link></li>
          </ul>
        </div>

        <div>
          <p className="footer__title">Plataforma</p>
          <ul>
            <li><Link to="/nosotros">Sobre nosotros</Link></li>
            <li><Link to="/nosotros">Contacto</Link></li>
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Empleo Quibdo - Quibdo, Choco, Colombia</span>
        <span>Hecho con orgullo en el Pacifico colombiano</span>
      </div>
    </footer>
  );
}
