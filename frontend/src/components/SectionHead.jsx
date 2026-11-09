import { Link } from "react-router-dom";

export default function SectionHead({ eyebrow, titulo, verTodasLink }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{titulo}</h2>
      </div>
      {verTodasLink && (
        <Link to={verTodasLink} className="section-head__link">
          Ver todas →
        </Link>
      )}
    </div>
  );
}
