import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const COLORES = ["violet", "green", "amber"];

export default function Categories() {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.listarCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  if (categorias.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
          <div>
            <span className="eyebrow">Explorar</span>
            <h2>Categorías Laborales</h2>
          </div>
        </div>

        <div className="cat-grid">
          {categorias.map((cat, i) => (
            <button
              key={cat.id_categoria}
              className={`cat cat--${COLORES[i % COLORES.length]}`}
              onClick={() => navigate(`/empleos?categoria=${cat.id_categoria}`)}
            >
              <span className="cat__icon">💼</span>
              <span>{cat.nombre}</span>
              <span className="cat__count">{cat.vacantes}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
