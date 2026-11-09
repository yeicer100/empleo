import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { MenuIcon } from "./Icons";
import { api } from "../services/api";

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [nuevas, setNuevas] = useState(0);
  const navigate = useNavigate();

  // Lee el usuario guardado en el navegador (si inicio sesion antes)
  useEffect(() => {
    const leer = () => {
      try {
        setUsuario(JSON.parse(localStorage.getItem("usuario")));
      } catch {
        setUsuario(null);
      }
    };
    leer();
    // Login.jsx avisa con este evento cuando se inicia sesion
    window.addEventListener("auth", leer);
    return () => window.removeEventListener("auth", leer);
  }, []);

  // Notificacion para empresas: cuantas postulaciones nuevas tiene sin ver
  useEffect(() => {
    if (usuario?.rol !== "empresa") {
      setNuevas(0);
      return;
    }
    const cargar = () =>
      api
        .notificacionesEmpresa()
        .then((d) => setNuevas(d.nuevas))
        .catch(() => {});
    cargar();
    const intervalo = setInterval(cargar, 30000);
    window.addEventListener("notificaciones", cargar);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("notificaciones", cargar);
    };
  }, [usuario]);

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    setAbierto(false);
    navigate("/");
  }

  const rol = usuario?.rol;
  const clase = ({ isActive }) => `navbar__link ${isActive ? "active" : ""}`;

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="brand">
          <span className="brand__mark">EQ</span>
          <span className="brand__text">
            <strong>Empleo</strong>
            <small>QUIBDO</small>
          </span>
        </Link>

        <nav className={`navbar__links ${abierto ? "is-open" : ""}`} onClick={() => setAbierto(false)}>
          {rol === "empresa" ? (
            <NavLink to="/panel-empresa" className={clase}>
              Mi panel
              {nuevas > 0 && <span className="navbar__badge">{nuevas}</span>}
            </NavLink>
          ) : (
            <>
              <NavLink to="/" className={clase} end>
                Inicio
              </NavLink>
              <NavLink to="/empleos" className={clase}>
                Empleos
              </NavLink>
              <NavLink to="/empresas" className={clase}>
                Empresas
              </NavLink>
            </>
          )}
          {rol === "candidato" && (
            <NavLink to="/mis-postulaciones" className={clase}>
              Mis postulaciones
            </NavLink>
          )}
          <NavLink to="/nosotros" className={clase}>
            Nosotros
          </NavLink>

          <div className="only-mobile">
            {usuario ? (
              <button className="navbar__link" onClick={cerrarSesion}>
                Cerrar sesion
              </button>
            ) : (
              <Link to="/login" className="navbar__link">
                Iniciar sesion
              </Link>
            )}
          </div>
        </nav>

        <div className="navbar__actions">
          {usuario ? (
            <>
              <span className="navbar__user">
                {usuario.nombre || usuario.correo}
                <small>{rol === "empresa" ? "Empresa" : rol === "candidato" ? "Candidato" : rol}</small>
              </span>
              <button className="navbar__login" onClick={cerrarSesion}>
                Cerrar sesion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__login">
                Iniciar sesion
              </Link>
              <Link to="/registro" className="btn btn--primary">
                Registrarse
              </Link>
            </>
          )}

          <button className="navbar__toggle" onClick={() => setAbierto(!abierto)} aria-label="Abrir menu">
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
