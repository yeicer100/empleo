// Funciones pequenas de validacion, reutilizadas en varios controladores.
// Son simples a proposito: si necesitas reglas mas estrictas, este es
// el lugar donde agregarlas.

export function esCorreoValido(correo) {
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof correo === "string" && patron.test(correo);
}

export function esPasswordValido(password) {
  return typeof password === "string" && password.length >= 8;
}

export function esCampoRequerido(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

// Middleware de Express: verifica el token JWT que viene en el header
// "Authorization: Bearer <token>" y agrega los datos del usuario a req.usuario
import jwt from "jsonwebtoken";

export function requiereLogin(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No hay token de autenticacion" });
  }

  const token = header.replace("Bearer ", "");

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = datos;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalido o vencido" });
  }
}

// Middleware: deja pasar solo a ciertos roles ("candidato", "empresa", "admin").
// Se usa DESPUES de requiereLogin.
export function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ errores: ["No tienes permiso para esta accion"] });
    }
    next();
  };
}
