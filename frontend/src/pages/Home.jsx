import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Categories from "../components/Categories";
import Card from "../components/Card";
import SectionHead from "../components/SectionHead";
import CtaBanner from "../components/CtaBanner";
import { api } from "../services/api";

export default function Home() {
  const [ofertas, setOfertas] = useState([]);

  useEffect(() => {
    api
      .listarOfertas()
      .then((todas) => setOfertas(todas.slice(0, 6)))
      .catch(() => setOfertas([]));
  }, []);

  return (
    <>
      <Hero />
      <Stats />

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Destacadas" titulo="Ofertas de empleo" verTodasLink="/empleos" />

          {ofertas.length === 0 ? (
            <p className="muted">Aún no hay ofertas publicadas. Cuando una empresa publique una, aparecerá aquí.</p>
          ) : (
            <div className="cards-grid">
              {ofertas.map((oferta) => (
                <Card key={oferta.id_oferta} oferta={oferta} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Categories />

      <section className="section section--tight">
        <div className="container">
          <CtaBanner
            titulo="¿Tienes una empresa en Quibdó?"
            texto="Publica tus vacantes y conecta con el talento chocoano. Registro gratuito."
            botonTexto="Registrar empresa"
            botonLink="/registro-empresa"
            botonSecundarioTexto="Soy candidato"
            botonSecundarioLink="/registro"
          />
        </div>
      </section>
    </>
  );
}
