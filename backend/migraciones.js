// Actualiza la base de datos si le faltan columnas nuevas (postulaciones con datos,
// respuesta de la empresa, etc.). Se ejecuta solo al arrancar el backend y es seguro
// correrlo muchas veces: solo agrega lo que falta.

import { pool } from "./db.js";

async function agregarColumna(tabla, columna, definicion) {
  const [existe] = await pool.query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tabla, columna]
  );
  if (existe.length === 0) {
    await pool.query(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
    console.log(`  + columna ${tabla}.${columna}`);
  }
}

export async function asegurarEsquema() {
  try {
    // Datos que el candidato llena al postularse
    await agregarColumna("postulacion", "nombre_completo", "VARCHAR(120) NULL");
    await agregarColumna("postulacion", "nivel_estudio", "VARCHAR(40) NULL");
    await agregarColumna("postulacion", "titulo_estudio", "VARCHAR(100) NULL");
    await agregarColumna("postulacion", "anios_experiencia", "INT NULL");
    await agregarColumna("postulacion", "telefono_contacto", "VARCHAR(20) NULL");
    await agregarColumna("postulacion", "mensaje", "VARCHAR(500) NULL");
    // Notificacion y respuesta de la empresa
    await agregarColumna("postulacion", "visto_empresa", "BOOLEAN NOT NULL DEFAULT FALSE");
    await agregarColumna("postulacion", "mensaje_empresa", "VARCHAR(300) NULL");
    await agregarColumna("postulacion", "contacto_empresa", "VARCHAR(20) NULL");
    await agregarColumna("postulacion", "fecha_respuesta", "DATETIME NULL");
    await pool.query(
      `ALTER TABLE postulacion MODIFY estado
       ENUM('enviada','en_revision','preseleccionado','aceptada','rechazado','contratado')
       NOT NULL DEFAULT 'enviada'`
    );
    console.log("Esquema de la base de datos al dia");
  } catch (error) {
    console.error("No se pudo actualizar el esquema de la base de datos:", error.message);
  }
}
