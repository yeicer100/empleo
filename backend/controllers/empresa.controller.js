import { pool } from "../db.js";

function soloDigitos(v) {
  return String(v ?? "").replace(/\D/g, "");
}
function telefonoValido(v) {
  const d = soloDigitos(v);
  return d.length >= 7 && d.length <= 15;
}

async function buscarEmpresa(idUsuario) {
  const [[e]] = await pool.query(
    "SELECT id_empresa, nombre, telefono FROM empresa WHERE id_usuario = ?",
    [idUsuario]
  );
  return e;
}

// GET /api/empresa/perfil
export async function perfil(req, res) {
  try {
    const e = await buscarEmpresa(req.usuario.id_usuario);
    if (!e) return res.status(403).json({ errores: ["Tu cuenta no es de empresa"] });
    res.json({ nombre: e.nombre, telefono: e.telefono || "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al leer el perfil"] });
  }
}

// GET /api/empresa/ofertas  (SOLO las ofertas de esta empresa)
export async function misOfertas(req, res) {
  try {
    const e = await buscarEmpresa(req.usuario.id_usuario);
    if (!e) return res.status(403).json({ errores: ["Tu cuenta no es de empresa"] });

    const [filas] = await pool.query(
      `SELECT o.id_oferta, o.titulo, o.ciudad, o.estado, o.fecha_publicacion, o.vistas,
              c.nombre AS categoria,
              (SELECT COUNT(*) FROM postulacion p WHERE p.id_oferta = o.id_oferta) AS total_postulaciones,
              (SELECT COUNT(*) FROM postulacion p WHERE p.id_oferta = o.id_oferta AND p.visto_empresa = FALSE) AS nuevas
       FROM oferta o
       JOIN categoria c ON c.id_categoria = o.id_categoria
       WHERE o.id_empresa = ?
       ORDER BY o.fecha_publicacion DESC`,
      [e.id_empresa]
    );
    res.json(filas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al listar tus ofertas"] });
  }
}

// PATCH /api/empresa/ofertas/:id/estado   { estado: "activa" | "pausada" | "cerrada" }
export async function cambiarEstadoOferta(req, res) {
  const { estado } = req.body;
  if (!["activa", "pausada", "cerrada"].includes(estado)) {
    return res.status(400).json({ errores: ["Estado no valido"] });
  }
  try {
    const e = await buscarEmpresa(req.usuario.id_usuario);
    if (!e) return res.status(403).json({ errores: ["Tu cuenta no es de empresa"] });

    const [r] = await pool.query(
      "UPDATE oferta SET estado = ? WHERE id_oferta = ? AND id_empresa = ?",
      [estado, Number(req.params.id), e.id_empresa]
    );
    if (r.affectedRows === 0) return res.status(404).json({ errores: ["Oferta no encontrada"] });
    res.json({ estado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al cambiar el estado"] });
  }
}

// GET /api/empresa/postulaciones  (la "bandeja": las nuevas primero)
export async function postulacionesRecibidas(req, res) {
  try {
    const e = await buscarEmpresa(req.usuario.id_usuario);
    if (!e) return res.status(403).json({ errores: ["Tu cuenta no es de empresa"] });

    const [filas] = await pool.query(
      `SELECT p.id_postulacion, p.estado, p.fecha_postulacion, p.visto_empresa,
              COALESCE(p.nombre_completo, CONCAT(c.nombres, ' ', c.apellidos)) AS nombre_completo,
              p.nivel_estudio, p.titulo_estudio, p.anios_experiencia,
              COALESCE(p.telefono_contacto, c.telefono) AS telefono_contacto,
              p.mensaje, p.mensaje_empresa, p.contacto_empresa, p.fecha_respuesta,
              u.correo AS correo_candidato,
              o.id_oferta, o.titulo AS oferta_titulo
       FROM postulacion p
       JOIN oferta o ON o.id_oferta = p.id_oferta
       JOIN candidato c ON c.id_candidato = p.id_candidato
       JOIN usuario u ON u.id_usuario = c.id_usuario
       WHERE o.id_empresa = ?
       ORDER BY p.visto_empresa ASC, p.fecha_postulacion DESC`,
      [e.id_empresa]
    );
    res.json(filas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al listar las postulaciones"] });
  }
}

// GET /api/empresa/notificaciones  -> { nuevas }
export async function contarNuevas(req, res) {
  try {
    const e = await buscarEmpresa(req.usuario.id_usuario);
    if (!e) return res.status(403).json({ errores: ["Tu cuenta no es de empresa"] });

    const [[{ nuevas }]] = await pool.query(
      `SELECT COUNT(*) AS nuevas
       FROM postulacion p JOIN oferta o ON o.id_oferta = p.id_oferta
       WHERE o.id_empresa = ? AND p.visto_empresa = FALSE`,
      [e.id_empresa]
    );
    res.json({ nuevas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor"] });
  }
}

// Verifica que la postulacion pertenezca a una oferta de esta empresa
async function postulacionDeLaEmpresa(idPostulacion, idEmpresa) {
  const [[p]] = await pool.query(
    `SELECT p.id_postulacion
     FROM postulacion p JOIN oferta o ON o.id_oferta = p.id_oferta
     WHERE p.id_postulacion = ? AND o.id_empresa = ?`,
    [idPostulacion, idEmpresa]
  );
  return p;
}

// POST /api/empresa/postulaciones/:id/visto
export async function marcarVista(req, res) {
  try {
    const e = await buscarEmpresa(req.usuario.id_usuario);
    if (!e) return res.status(403).json({ errores: ["Tu cuenta no es de empresa"] });
    const id = Number(req.params.id);
    if (!(await postulacionDeLaEmpresa(id, e.id_empresa))) {
      return res.status(404).json({ errores: ["Postulacion no encontrada"] });
    }
    await pool.query("UPDATE postulacion SET visto_empresa = TRUE WHERE id_postulacion = ?", [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor"] });
  }
}

// PATCH /api/empresa/postulaciones/:id
// { estado: "aceptada" | "rechazado" | "en_revision", contacto, mensaje }
// Al aceptar, la empresa indica el WhatsApp con el que el candidato la contactara.
export async function responderPostulacion(req, res) {
  const { estado, contacto, mensaje } = req.body;
  if (!["aceptada", "rechazado", "en_revision"].includes(estado)) {
    return res.status(400).json({ errores: ["Estado no valido"] });
  }
  if (estado === "aceptada" && !telefonoValido(contacto)) {
    return res.status(400).json({ errores: ["Escribe el WhatsApp o telefono con el que te contactara el candidato"] });
  }
  if (mensaje && String(mensaje).length > 300) {
    return res.status(400).json({ errores: ["El mensaje no puede pasar de 300 caracteres"] });
  }

  try {
    const e = await buscarEmpresa(req.usuario.id_usuario);
    if (!e) return res.status(403).json({ errores: ["Tu cuenta no es de empresa"] });
    const id = Number(req.params.id);
    if (!(await postulacionDeLaEmpresa(id, e.id_empresa))) {
      return res.status(404).json({ errores: ["Postulacion no encontrada"] });
    }

    await pool.query(
      `UPDATE postulacion
       SET estado = ?, visto_empresa = TRUE, fecha_respuesta = NOW(),
           mensaje_empresa = ?, contacto_empresa = ?
       WHERE id_postulacion = ?`,
      [
        estado,
        mensaje ? String(mensaje).trim() : null,
        estado === "aceptada" ? soloDigitos(contacto) : null,
        id,
      ]
    );
    res.json({ estado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al responder la postulacion"] });
  }
}
