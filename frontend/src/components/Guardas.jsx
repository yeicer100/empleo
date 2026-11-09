import { Navigate } from "react-router-dom";
import { getUsuario } from "../services/sesion";

// Las empresas NO ven el sitio publico de ofertas: van directo a su panel.
export function NoEmpresa({ children }) {
  if (getUsuario()?.rol === "empresa") return <Navigate to="/panel-empresa" replace />;
  return children;
}

// Solo deja entrar a un rol (candidato o empresa); si no, redirige.
export function SoloRol({ rol, children }) {
  const usuario = getUsuario();
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== rol) {
    return <Navigate to={usuario.rol === "empresa" ? "/panel-empresa" : "/"} replace />;
  }
  return children;
}
