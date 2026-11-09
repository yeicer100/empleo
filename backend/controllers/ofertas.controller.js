import { pool } from "../db.js";
import { esCampoRequerido } from "../middleware/validar.js";

// GET /api/ofertas?categoria=3&buscar=enfermera
export async function listarOfertas(req, res) {
  const { categoria, buscar } = req.query;

  let sql = `
    SELECT o.id_oferta, o.titulo, o.ciudad, o.modalidad, o.tipo_contrato,
           o.salario_min, o.salario_max, o.destacada, o.fecha_publicacion,
           e.nombre AS empresa, c.nombre AS categoria
    FROM oferta o
    JOIN empresa e ON e.id_empresa = o.id_empresa
    JOIN categoria c ON c.id_categoria = o.id_categoria
    WHERE o.estado = 'activa'
  `;
  const parametros = [];

  if (categoria) {
    sql += " AND o.id_categoria = ?";
    parametros.push(categoria);
  }

  if (buscar) {
    sql += " AND (o.titulo LIKE ? OR e.nombre LIKE ? OR c.nombre LIKE ?)";
    parametros.push(`%${buscar}%`, `%${buscar}%`, `%${buscar}%`);
  }

  sql += " ORDER BY o.fecha_publicacion DESC";

  try {
    const [ofertas] = await pool.query(sql, parametros);
    res.json(ofertas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor al listar las ofertas" });
  }
}

// GET /api/ofertas/:id
export async function obtenerOferta(req, res) {
  const { id } = req.params;

  try {
    const [ofertas] = await pool.query(
      `SELECT o.*, e.nombre AS empresa, e.descripcion AS empresa_descripcion, c.nombre AS categoria
       FROM oferta o
       JOIN empresa e ON e.id_empresa = o.id_empresa
       JOIN categoria c ON c.id_categoria = o.id_categoria
       WHERE o.id_oferta = ?`,
      [id]
    );

    if (ofertas.length === 0) {
      return res.status(404).json({ error: "Oferta no encontrada" });
    }

    const [requisitos] = await pool.query(
      "SELECT descripcion FROM requisito_oferta WHERE id_oferta = ?",
      [id]
    );
    const [beneficios] = await pool.query(
      "SELECT descripcion FROM beneficio_oferta WHERE id_oferta = ?",
      [id]
    );
    const [[{ total_postulantes }]] = await pool.query(
      "SELECT COUNT(*) AS total_postulantes FROM postulacion WHERE id_oferta = ?",
      [id]
    );

    // Suma una vista cada vez que se abre el detalle
    await pool.query("UPDATE oferta SET vistas = vistas + 1 WHERE id_oferta = ?", [id]);

    res.json({
      ...ofertas[0],
      requisitos: requisitos.map((r) => r.descripcion),
      beneficios: beneficios.map((b) => b.descripcion),
      total_postulantes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor al obtener la oferta" });
  }
}

// POST /api/ofertas  (requiere login de empresa, ver routes)
export async function crearOferta(req, res) {
  const { id_categoria, titulo, descripcion, ciudad, modalidad, tipo_contrato, salario_min, salario_max, requisitos, beneficios } = req.body;

  const errores = [];
  if (!id_categoria) errores.push("Selecciona una categoria");
  if (!esCampoRequerido(titulo)) errores.push("El titulo es obligatorio");
  if (!esCampoRequerido(descripcion)) errores.push("La descripcion es obligatoria");
  if (!esCampoRequerido(ciudad)) errores.push("La ciudad es obligatoria");
  if (!esCampoRequerido(tipo_contrato)) errores.push("Selecciona el tipo de contrato");

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  try {
    // req.usuario.id_usuario viene del token (ver middleware requiereLogin)
    const [[empresa]] = await pool.query(
      "SELECT id_empresa FROM empresa WHERE id_usuario = ?",
      [req.usuario.id_usuario]
    );

    if (!empresa) {
      return res.status(403).json({ errores: ["Solo una cuenta de empresa puede publicar ofertas"] });
    }

    const [resultado] = await pool.query(
      `INSERT INTO oferta
       (id_empresa, id_categoria, titulo, descripcion, ciudad, modalidad, tipo_contrato, salario_min, salario_max)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empresa.id_empresa,
        id_categoria,
        titulo,
        descripcion,
        ciudad,
        modalidad || "presencial",
        tipo_contrato,
        salario_min || null,
        salario_max || null,
      ]
    );

    // Requisitos y beneficios (opcionales): una lista de textos
    const limpiar = (lista) =>
      (Array.isArray(lista) ? lista : [])
        .map((t) => String(t).trim().slice(0, 200))
        .filter(Boolean)
        .slice(0, 15);
    for (const texto of limpiar(requisitos)) {
      await pool.query("INSERT INTO requisito_oferta (id_oferta, descripcion) VALUES (?, ?)", [resultado.insertId, texto]);
    }
    for (const texto of limpiar(beneficios)) {
      await pool.query("INSERT INTO beneficio_oferta (id_oferta, descripcion) VALUES (?, ?)", [resultado.insertId, texto]);
    }

    res.status(201).json({ mensaje: "Oferta publicada correctamente", id_oferta: resultado.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errores: ["Error del servidor al crear la oferta"] });
  }
}
