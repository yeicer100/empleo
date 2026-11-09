import { pool } from "../db.js";

// GET /api/empresas
export async function listarEmpresas(req, res) {
  try {
    const [empresas] = await pool.query(`
      SELECT e.id_empresa, e.nombre, e.descripcion, e.ciudad, c.nombre AS categoria,
             (SELECT COUNT(*) FROM oferta o WHERE o.id_empresa = e.id_empresa AND o.estado = 'activa') AS vacantes
      FROM empresa e
      JOIN categoria c ON c.id_categoria = e.id_categoria
      ORDER BY e.nombre
    `);
    res.json(empresas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor al listar las empresas" });
  }
}

// GET /api/categorias  (con el numero de vacantes activas de cada una)
export async function listarCategorias(req, res) {
  try {
    const [categorias] = await pool.query(`
      SELECT c.id_categoria, c.nombre, c.icono,
             (SELECT COUNT(*) FROM oferta o WHERE o.id_categoria = c.id_categoria AND o.estado = 'activa') AS vacantes
      FROM categoria c
      ORDER BY c.nombre
    `);
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor al listar las categorias" });
  }
}

// GET /api/estadisticas  (para la barra de "347+ vacantes, 89 empresas...")
export async function obtenerEstadisticas(req, res) {
  try {
    const [[{ vacantes }]] = await pool.query(
      "SELECT COUNT(*) AS vacantes FROM oferta WHERE estado = 'activa'"
    );
    const [[{ empresas }]] = await pool.query("SELECT COUNT(*) AS empresas FROM empresa");
    const [[{ candidatos }]] = await pool.query("SELECT COUNT(*) AS candidatos FROM candidato");
    const [[{ postulaciones }]] = await pool.query("SELECT COUNT(*) AS postulaciones FROM postulacion");

    res.json({ vacantes, empresas, candidatos, postulaciones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor al obtener estadisticas" });
  }
}
