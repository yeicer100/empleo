// Todas las llamadas al backend pasan por aqui.
// Si cambias el puerto o dominio del backend, solo tocas esta linea.
const API_URL = import.meta.env.VITE_API_URL || "/api";

async function peticion(ruta, opciones = {}) {
  const token = localStorage.getItem("token");

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opciones.headers,
      },
    });
  } catch {
    throw new Error("No hay conexion con el servidor. Verifica que el backend este encendido.");
  }

  // Si la respuesta no es JSON (por ejemplo un 500 del proxy de Vite cuando el backend esta apagado),
  // "datos" queda en null y mostramos un mensaje que indique el problema real.
  const datos = await respuesta.json().catch(() => null);

  // Si el token vencio o es invalido, se cierra la sesion guardada
  if (respuesta.status === 401 && token) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.dispatchEvent(new Event("auth"));
  }

  if (!respuesta.ok) {
    // El backend manda { error: "...", } o { errores: ["...", "..."] }
    const mensaje =
      datos?.errores?.join(", ") ||
      datos?.error ||
      (datos === null
        ? `El servidor no respondio correctamente (codigo ${respuesta.status}). Revisa que el backend y la base de datos esten corriendo.`
        : "Ocurrio un error");
    throw new Error(mensaje);
  }

  return datos ?? {};
}

export const api = {
  // Ofertas
  listarOfertas: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return peticion(`/ofertas${query ? `?${query}` : ""}`);
  },
  obtenerOferta: (id) => peticion(`/ofertas/${id}`),
  crearOferta: (datos) => peticion("/ofertas", { method: "POST", body: JSON.stringify(datos) }),

  // Empresas / categorias / estadisticas
  listarEmpresas: () => peticion("/empresas"),
  listarCategorias: () => peticion("/categorias"),
  obtenerEstadisticas: () => peticion("/estadisticas"),

  // Candidato
  perfilCandidato: () => peticion("/candidato/perfil"),
  postular: (id, datos) => peticion(`/ofertas/${id}/postular`, { method: "POST", body: JSON.stringify(datos) }),
  guardarOferta: (id) => peticion(`/ofertas/${id}/guardar`, { method: "POST" }),
  miEstadoOferta: (id) => peticion(`/ofertas/${id}/mi-estado`),
  misPostulaciones: () => peticion("/candidato/postulaciones"),
  misGuardadas: () => peticion("/candidato/guardadas"),

  // Empresa
  perfilEmpresa: () => peticion("/empresa/perfil"),
  misOfertasEmpresa: () => peticion("/empresa/ofertas"),
  cambiarEstadoOferta: (id, estado) =>
    peticion(`/empresa/ofertas/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) }),
  postulacionesEmpresa: () => peticion("/empresa/postulaciones"),
  notificacionesEmpresa: () => peticion("/empresa/notificaciones"),
  marcarVista: (id) => peticion(`/empresa/postulaciones/${id}/visto`, { method: "POST" }),
  responderPostulacion: (id, datos) =>
    peticion(`/empresa/postulaciones/${id}`, { method: "PATCH", body: JSON.stringify(datos) }),

  // Autenticacion
  login: (correo, password) =>
    peticion("/auth/login", { method: "POST", body: JSON.stringify({ correo, password }) }),
  registrarCandidato: (datos) =>
    peticion("/auth/registro-candidato", { method: "POST", body: JSON.stringify(datos) }),
  registrarEmpresa: (datos) =>
    peticion("/auth/registro-empresa", { method: "POST", body: JSON.stringify(datos) }),
};
