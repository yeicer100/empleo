// Conexion a la base de datos MySQL.
// Usamos un "pool" en vez de una sola conexion: Express puede atender
// varias peticiones al tiempo, y el pool reparte conexiones entre ellas.

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Las bases en la nube (TiDB, etc.) exigen conexion segura: DB_SSL=true
  ssl: process.env.DB_SSL === "true" ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
});

// Pequena funcion para probar la conexion al iniciar el servidor.
export async function probarConexion() {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    console.log("Conexion a MySQL exitosa:", rows[0]);
  } catch (error) {
    console.error("No se pudo conectar a MySQL:", error.message);
  }
}
