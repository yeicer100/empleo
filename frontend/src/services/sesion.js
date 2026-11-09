// Datos de la sesion guardada en el navegador y utilidades pequenas.

export function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch {
    return null;
  }
}

// Arma el link de WhatsApp. Si el numero tiene 10 digitos (celular de Colombia)
// le agrega el 57 del pais.
export function linkWhatsApp(telefono, texto) {
  const digitos = String(telefono || "").replace(/\D/g, "");
  const numero = digitos.length === 10 ? `57${digitos}` : digitos;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export const ESTADOS = {
  enviada: { texto: "Enviada", clase: "" },
  en_revision: { texto: "En revisión", clase: "state--amber" },
  preseleccionado: { texto: "Preseleccionado", clase: "state--amber" },
  aceptada: { texto: "Aceptada", clase: "state--green" },
  rechazado: { texto: "No seleccionado", clase: "state--red" },
  contratado: { texto: "Contratado", clase: "state--green" },
};
