import { pool } from "../db.js";
import { esCampoRequerido } from "../middleware/validar.js";

export const NIVELES_ESTUDIO = [
  "Sin estudios formales",
  "Bachiller",
  "Tecnico",
  "Tecnologo",
  "Profesional",
  "Especializacion",
  "Maestria",
];

function soloDigitos(v) {
  return String(v ?? "").replace(/\D/g, "");
}
function telefonoValido(v) {
  const d = soloDigitos(v);
  return d.length >= 7 && d.length <= 15;
}

async function buscarCandidato(idUsuario) {
  const [[c]] = await pool.query(
    "SELECT id_candidato, nombres, apellidos, telefono FROM candidato WHERE id_usuario = ?",
    [idUsuario]
  );
  return c;
}

// GET /api/candidato/perfil  (para rellenar el formulario de postulacion)
export async function perfil(req, res) {
  try {
    const c = await buscarCandidato(req.usuario.id_usuario);
    if (!c) return res.status(403).json({ errores: ["Tu cuenta no es de candidato"] });
    res.json({ nombre_completo: `${c.nombres} ${c.apellidos}`, telefono: c.telefono || "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al leer el perfil"] });
  }
}

// POST /api/ofertas/:id/postular
export async function postular(req, res) {
  const idOferta = Number(req.params.id);
  const { nombre_completo, nivel_estudio, titulo_estudio, anios_experiencia, telefono_contacto, mensaje } = req.body;

  const errores = [];
  if (!esCampoRequerido(nombre_completo)) errores.push("Escribe tu nombre completo");
  if (!NIVELES_ESTUDIO.includes(nivel_estudio)) errores.push("Selecciona tu nivel de estudio");
  const anios = Number(anios_experiencia);
  if (anios_experiencia === "" || anios_experiencia == null || !Number.isInteger(anios) || anios < 0 || anios > 60) {
    errores.push("Los anos de experiencia deben ser un numero entre 0 y 60");
  }
  if (!telefonoValido(telefono_contacto)) errores.push("Escribe un WhatsApp o telefono valido (solo numeros)");
  if (mensaje && String(mensaje).length > 500) errores.push("El mensaje no puede pasar de 500 caracteres");

  if (errores.length > 0) return res.status(400).json({ errores });

  try {
    const candidato = await buscarCandidato(req.usuario.id_usuario);
    if (!candidato) return res.status(403).json({ errores: ["Solo un candidato puede postularse"] });

    const [[oferta]] = await pool.query("SELECT id_oferta, estado FROM oferta WHERE id_oferta = ?", [idOferta]);
    if (!oferta) return res.status(404).json({ errores: ["La oferta no existe"] });
    if (oferta.estado !== "activa") {
      return res.status(400).json({ errores: ["Esta oferta ya no recibe postulaciones"] });
    }

    try {
      await pool.query(
        `INSERT INTO postulacion
         (id_oferta, id_candidato, nombre_completo, nivel_estudio, titulo_estudio,
          anios_experiencia, telefono_contacto, mensaje, visto_empresa)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
        [
          idOferta,
          candidato.id_candidato,
          String(nombre_completo).trim(),
          nivel_estudio,
          titulo_estudio ? String(titulo_estudio).trim().slice(0, 100) : null,
          anios,
          soloDigitos(telefono_contacto),
          mensaje ? String(mensaje).trim() : null,
        ]
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ errores: ["Ya te postulaste a esta oferta"] });
      }
      throw error;
    }

    res.status(201).json({ mensaje: "Postulacion enviada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al postularte"] });
  }
}

// POST /api/ofertas/:id/guardar  (si ya estaba guardada, la quita)
export async function guardarOferta(req, res) {
  const idOferta = Number(req.params.id);
  try {
    const candidato = await buscarCandidato(req.usuario.id_usuario);
    if (!candidato) return res.status(403).json({ errores: ["Solo un candidato puede guardar ofertas"] });

    const [borrado] = await pool.query(
      "DELETE FROM oferta_guardada WHERE id_candidato = ? AND id_oferta = ?",
      [candidato.id_candidato, idOferta]
    );
    if (borrado.affectedRows > 0) return res.json({ guardada: false });

    const [[oferta]] = await pool.query("SELECT id_oferta FROM oferta WHERE id_oferta = ?", [idOferta]);
    if (!oferta) return res.status(404).json({ errores: ["La oferta no existe"] });

    await pool.query("INSERT INTO oferta_guardada (id_candidato, id_oferta) VALUES (?, ?)", [
      candidato.id_candidato,
      idOferta,
    ]);
    res.json({ guardada: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al guardar la oferta"] });
  }
}

// GET /api/ofertas/:id/mi-estado  -> { postulado, estado, guardada }
export async function miEstado(req, res) {
  const idOferta = Number(req.params.id);
  try {
    const candidato = await buscarCandidato(req.usuario.id_usuario);
    if (!candidato) return res.status(403).json({ errores: ["Tu cuenta no es de candidato"] });

    const [[post]] = await pool.query(
      "SELECT estado FROM postulacion WHERE id_oferta = ? AND id_candidato = ?",
      [idOferta, candidato.id_candidato]
    );
    const [guardada] = await pool.query(
      "SELECT 1 FROM oferta_guardada WHERE id_oferta = ? AND id_candidato = ?",
      [idOferta, candidato.id_candidato]
    );
    res.json({ postulado: !!post, estado: post?.estado ?? null, guardada: guardada.length > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor"] });
  }
}

// GET /api/candidato/postulaciones
// El contacto de la empresa SOLO se entrega cuando la empresa acepto la postulacion.
export async function misPostulaciones(req, res) {
  try {
    const candidato = await buscarCandidato(req.usuario.id_usuario);
    if (!candidato) return res.status(403).json({ errores: ["Tu cuenta no es de candidato"] });

    const [filas] = await pool.query(
      `SELECT p.id_postulacion, p.estado, p.fecha_postulacion, p.fecha_respuesta, p.mensaje_empresa,
              IF(p.estado = 'aceptada', p.contacto_empresa, NULL) AS contacto_empresa,
              o.id_oferta, o.titulo, e.nombre AS empresa
       FROM postulacion p
       JOIN oferta o ON o.id_oferta = p.id_oferta
       JOIN empresa e ON e.id_empresa = o.id_empresa
       WHERE p.id_candidato = ?
       ORDER BY p.fecha_postulacion DESC`,
      [candidato.id_candidato]
    );
    res.json(filas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al listar tus postulaciones"] });
  }
}

// GET /api/candidato/guardadas
export async function misGuardadas(req, res) {
  try {
    const candidato = await buscarCandidato(req.usuario.id_usuario);
    if (!candidato) return res.status(403).json({ errores: ["Tu cuenta no es de candidato"] });

    const [filas] = await pool.query(
      `SELECT o.id_oferta, o.titulo, o.ciudad, o.modalidad, o.tipo_contrato, o.salario_min, o.salario_max,
              o.destacada, o.fecha_publicacion, o.estado, e.nombre AS empresa, c.nombre AS categoria
       FROM oferta_guardada g
       JOIN oferta o ON o.id_oferta = g.id_oferta
       JOIN empresa e ON e.id_empresa = o.id_empresa
       JOIN categoria c ON c.id_categoria = o.id_categoria
       WHERE g.id_candidato = ?
       ORDER BY g.fecha_guardada DESC`,
      [candidato.id_candidato]
    );
    res.json(filas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al listar tus ofertas guardadas"] });
  }
}
