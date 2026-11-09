import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import { api } from "../services/api";

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  const buscar = searchParams.get("buscar") || "";
  const categoria = searchParams.get("categoria") || "";

  useEffect(() => {
    api.listarCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    setCargando(true);
    const params = {};
    if (buscar) params.buscar = buscar;
    if (categoria) params.categoria = categoria;

    api
      .listarOfertas(params)
      .then(setOfertas)
      .catch(() => setOfertas([]))
      .finally(() => setCargando(false));
  }, [buscar, categoria]);

  function cambiarCategoria(idCategoria) {
    const nuevos = new URLSearchParams(searchParams);
    if (idCategoria) nuevos.set("categoria", idCategoria);
    else nuevos.delete("categoria");
    setSearchParams(nuevos);
  }

  return (
    <div className="container jobs-layout">
      <aside className="filters card">
        <p className="filters__heading">Filtros</p>

        <div className="filters__group">
          <p className="filters__label">Categoría</p>
          <button className={`opt ${!categoria ? "is-active" : ""}`} onClick={() => cambiarCategoria("")}>
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id_categoria}
              className={`opt ${String(categoria) === String(cat.id_categoria) ? "is-active" : ""}`}
              onClick={() => cambiarCategoria(cat.id_categoria)}
            >
              <span>{cat.nombre}</span>
              <span className="opt__count">{cat.vacantes}</span>
            </button>
          ))}
        </div>
      </aside>

      <div>
        <div className="results__bar">
          <p className="results__count">
            <b>{ofertas.length}</b> empleos encontrados
          </p>
        </div>

        {cargando ? (
          <p className="muted">Cargando ofertas...</p>
        ) : ofertas.length === 0 ? (
          <p className="muted">No se encontraron ofertas con esos filtros.</p>
        ) : (
          <div className="cards-grid">
            {ofertas.map((oferta) => (
              <Card key={oferta.id_oferta} oferta={oferta} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
