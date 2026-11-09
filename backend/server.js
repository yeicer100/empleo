import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { pool, probarConexion } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import ofertasRoutes from "./routes/ofertas.routes.js";
import empresasRoutes from "./routes/empresas.routes.js";
import panelRoutes from "./routes/panel.routes.js";
import { asegurarEsquema } from "./migraciones.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("Falta JWT_SECRET en las variables de entorno. Abortando.");
  process.exit(1);
}

const app = express();

app.use(cors()); // permite que el frontend (otro puerto) llame a esta API
app.use(express.json()); // permite leer JSON en req.body

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/ofertas", ofertasRoutes);
app.use("/api", panelRoutes); // /api/empresa/... y /api/candidato/... (cada ruta pide login)
app.use("/api", empresasRoutes); // /api/empresas, /api/categorias, /api/estadisticas

// Ruta de prueba
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ api: "ok", db: "ok" });
  } catch (error) {
    res.status(503).json({ api: "ok", db: "error", detalle: error.message });
  }
});

app.get("/api/ping", (req, res) => {
  res.json({ mensaje: "El backend esta funcionando" });
});

// Una ruta /api que no existe responde JSON (no la pagina web)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// En produccion, este mismo servidor entrega el sitio (frontend/dist).
// Asi se publica TODO como un solo servicio y no hace falta configurar CORS.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const carpetaFrontend = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(carpetaFrontend)) {
  app.use(express.static(carpetaFrontend));
  // Cualquier otra ruta (/empleos, /login, ...) la resuelve React
  app.get("*", (req, res) => {
    res.sendFile(path.join(carpetaFrontend, "index.html"));
  });
}

// Cualquier error no atrapado en un controlador responde 500 en vez de tumbar el servidor
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  await probarConexion();
  await asegurarEsquema();
});
