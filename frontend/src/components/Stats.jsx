import { useEffect, useState } from "react";
import { api } from "../services/api";

// Si la API falla se muestra "-" (no numeros inventados), asi se nota
// de inmediato cuando el frontend no esta conectado al backend.
const VACIO = { vacantes: "-", empresas: "-", candidatos: "-", postulaciones: "-" };

export default function Stats() {
  const [datos, setDatos] = useState(VACIO);

  useEffect(() => {
    api
      .obtenerEstadisticas()
      .then(setDatos)
      .catch(() => setDatos(VACIO));
  }, []);

  return (
    <section className="stats">
      <div className="container stats__grid">
        <div>
          <p className="stat__value stat__value--violet">{datos.vacantes}{datos.vacantes !== "-" && "+"}</p>
          <p className="stat__label">Vacantes activas</p>
        </div>
        <div>
          <p className="stat__value stat__value--green">{datos.empresas}</p>
          <p className="stat__label">Empresas registradas</p>
        </div>
        <div>
          <p className="stat__value stat__value--purple">{datos.candidatos}{datos.candidatos !== "-" && "+"}</p>
          <p className="stat__label">Candidatos</p>
        </div>
        <div>
          <p className="stat__value stat__value--amber">{datos.postulaciones}{datos.postulaciones !== "-" && "+"}</p>
          <p className="stat__label">Postulaciones</p>
        </div>
      </div>
    </section>
  );
}
