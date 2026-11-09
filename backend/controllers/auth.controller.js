import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { esCorreoValido, esPasswordValido, esCampoRequerido } from "../middleware/validar.js";

function soloDigitos(v) {
  return String(v ?? "").replace(/\D/g, "");
}
function telefonoValido(v) {
  const d = soloDigitos(v);
  return d.length >= 7 && d.length <= 15;
}

// POST /api/auth/registro-candidato
export async function registrarCandidato(req, res) {
  const { correo, password, documento, nombres, apellidos, telefono, ciudad } = req.body;

  // --- Validaciones ---
  const errores = [];
  if (!esCorreoValido(correo)) errores.push("El correo no es valido");
  if (!esPasswordValido(password)) errores.push("La contrasena debe tener minimo 8 caracteres");
  if (!esCampoRequerido(documento)) errores.push("El documento es obligatorio");
  if (!esCampoRequerido(nombres)) errores.push("El nombre es obligatorio");
  if (!esCampoRequerido(apellidos)) errores.push("El apellido es obligatorio");
  if (telefono && !telefonoValido(telefono)) errores.push("El telefono no es valido (solo numeros)");

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  let conexion;

  try {
    conexion = await pool.getConnection();
    await conexion.beginTransaction();

    // Revisa que el correo no este usado
    const [existe] = await conexion.query("SELECT id_usuario FROM usuario WHERE correo = ?", [correo]);
    if (existe.length > 0) {
      await conexion.rollback();
      return res.status(409).json({ errores: ["Ese correo ya esta registrado"] });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [resultadoUsuario] = await conexion.query(
      "INSERT INTO usuario (correo, password_hash, rol) VALUES (?, ?, 'candidato')",
      [correo, passwordHash]
    );

    await conexion.query(
      `INSERT INTO candidato (id_usuario, documento, nombres, apellidos, telefono, ciudad)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [resultadoUsuario.insertId, documento, nombres, apellidos, telefono ? soloDigitos(telefono) : null, ciudad || null]
    );

    await conexion.commit();
    res.status(201).json({ mensaje: "Candidato registrado correctamente" });
  } catch (error) {
    await conexion?.rollback();
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al registrar el candidato"] });
  } finally {
    conexion?.release();
  }
}

// POST /api/auth/registro-empresa
export async function registrarEmpresa(req, res) {
  const { correo, password, nit, nombre, id_categoria, ciudad, telefono } = req.body;

  const errores = [];
  if (!esCorreoValido(correo)) errores.push("El correo no es valido");
  if (!esPasswordValido(password)) errores.push("La contrasena debe tener minimo 8 caracteres");
  if (!esCampoRequerido(nit)) errores.push("El NIT es obligatorio");
  if (!esCampoRequerido(nombre)) errores.push("El nombre de la empresa es obligatorio");
  if (!id_categoria) errores.push("Selecciona un sector");
  if (!esCampoRequerido(ciudad)) errores.push("La ciudad es obligatoria");
  if (!telefonoValido(telefono)) errores.push("El WhatsApp / telefono de la empresa es obligatorio (solo numeros)");

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  let conexion;

  try {
    conexion = await pool.getConnection();
    await conexion.beginTransaction();

    const [existe] = await conexion.query("SELECT id_usuario FROM usuario WHERE correo = ?", [correo]);
    if (existe.length > 0) {
      await conexion.rollback();
      return res.status(409).json({ errores: ["Ese correo ya esta registrado"] });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [resultadoUsuario] = await conexion.query(
      "INSERT INTO usuario (correo, password_hash, rol) VALUES (?, ?, 'empresa')",
      [correo, passwordHash]
    );

    await conexion.query(
      `INSERT INTO empresa (id_usuario, id_categoria, nit, nombre, ciudad, telefono)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [resultadoUsuario.insertId, id_categoria, nit, nombre, ciudad, soloDigitos(telefono)]
    );

    await conexion.commit();
    res.status(201).json({ mensaje: "Empresa registrada correctamente" });
  } catch (error) {
    await conexion?.rollback();
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al registrar la empresa"] });
  } finally {
    conexion?.release();
  }
}

// POST /api/auth/login
export async function login(req, res) {
  const { correo, password } = req.body;

  if (!esCorreoValido(correo) || !esCampoRequerido(password)) {
    return res.status(400).json({ errores: ["Correo o contrasena invalidos"] });
  }

  try {
    const [usuarios] = await pool.query("SELECT * FROM usuario WHERE correo = ?", [correo]);

    if (usuarios.length === 0) {
      return res.status(401).json({ errores: ["Correo o contrasena incorrectos"] });
    }

    const usuario = usuarios[0];

    if (usuario.estado !== "activo") {
      return res.status(403).json({ errores: ["Esta cuenta no esta activa"] });
    }
    const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordCorrecta) {
      return res.status(401).json({ errores: ["Correo o contrasena incorrectos"] });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Nombre para mostrar en la barra (nombre de la persona o de la empresa)
    let nombre = usuario.correo;
    if (usuario.rol === "candidato") {
      const [[c]] = await pool.query("SELECT nombres, apellidos FROM candidato WHERE id_usuario = ?", [usuario.id_usuario]);
      if (c) nombre = `${c.nombres} ${c.apellidos}`;
    } else if (usuario.rol === "empresa") {
      const [[e]] = await pool.query("SELECT nombre FROM empresa WHERE id_usuario = ?", [usuario.id_usuario]);
      if (e) nombre = e.nombre;
    }

    res.json({
      token,
      usuario: { id_usuario: usuario.id_usuario, correo: usuario.correo, rol: usuario.rol, nombre },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al iniciar sesion"] });
  }
}
