import { Link } from "react-router-dom";

// Componente generico: le pasas el texto y los botones que necesites.
// Asi lo reusas tanto en Home como en la pagina de Empresas.
export default function CtaBanner({
  eyebrow = "Para empresas",
  titulo,
  texto,
  botonTexto,
  botonLink,
  botonSecundarioTexto,
  botonSecundarioLink,
}) {
  return (
    <div className="cta">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{titulo}</h2>
      <p className="cta__text">{texto}</p>
      <div className="cta__actions">
        <Link to={botonLink} className="btn btn--primary">
          {botonTexto}
        </Link>
        {botonSecundarioTexto && (
          <Link to={botonSecundarioLink} className="btn btn--ghost">
            {botonSecundarioTexto}
          </Link>
        )}
      </div>
    </div>
  );
}
