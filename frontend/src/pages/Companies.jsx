import { useEffect, useState } from "react";
import CompanyCard from "../components/CompanyCard";
import CtaBanner from "../components/CtaBanner";
import { api } from "../services/api";

export default function Companies() {
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    api.listarEmpresas().then(setEmpresas).catch(() => setEmpresas([]));
  }, []);

  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">Directorio</span>
        <h1>Empresas en Quibdó</h1>
        <p>{empresas.length} empresas registradas en la plataforma</p>
      </div>

      <div className="cards-grid companies-grid">
        {empresas.map((empresa) => (
          <CompanyCard key={empresa.id_empresa} empresa={empresa} />
        ))}
      </div>

      <section className="section section--tight">
        <CtaBanner
          eyebrow=""
          titulo="¿Tu empresa no está aquí?"
          texto="Regístrate gratis y conecta con candidatos en Quibdó"
          botonTexto="Registrar empresa →"
          botonLink="/registro-empresa"
        />
      </section>
    </div>
  );
}
