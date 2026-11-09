import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, PinIcon } from "./Icons";
import { api } from "../services/api";

const CATEGORIAS_RAPIDAS = ["Salud", "Tecnologia", "Educacion", "Ingenieria", "Administracion"];

export default function Hero() {
  const [buscar, setBuscar] = useState("");
  const [vacantes, setVacantes] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.obtenerEstadisticas().then((d) => setVacantes(d.vacantes)).catch(() => setVacantes(null));
  }, []);

  function handleBuscar(e) {
    e.preventDefault();
    // Lleva a /empleos con el texto buscado en la URL, para que
    // la pagina Jobs lo lea y filtre.
    navigate(`/empleos?buscar=${encodeURIComponent(buscar)}`);
  }

  return (
    <section className="hero">
      <div className="container">
        <div className="hero__live">
          <span className="dot" />
          {vacantes !== null ? (
            <>
              <b>{vacantes}</b> empleos disponibles ahora mismo
            </>
          ) : (
            "Empleos disponibles en Quibdó"
          )}
        </div>

        <h1 className="hero__title">
          Tu próxima <span className="grad">oportunidad</span> laboral
          <br />
          te espera en Quibdó
        </h1>

        <p className="hero__lead">
          La plataforma de empleo más avanzada del Chocó. Conectamos talento real
          con empresas que transforman la región.
        </p>

        <form className="searchbar" onSubmit={handleBuscar}>
          <div className="searchbar__field">
            <SearchIcon />
            <input
              type="text"
              placeholder="Cargo, empresa, categoría..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
          <div className="searchbar__field searchbar__field--loc">
            <PinIcon />
            <select defaultValue="Toda Colombia">
              <option>Toda Colombia</option>
              <option>Quibdó, Chocó</option>
            </select>
          </div>
          <button type="submit" className="btn btn--primary">
            Buscar
          </button>
        </form>

        <div className="hero__chips">
          {CATEGORIAS_RAPIDAS.map((cat) => (
            <button key={cat} className="chip" onClick={() => navigate(`/empleos?buscar=${cat}`)}>
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
