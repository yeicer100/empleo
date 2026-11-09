import { Router } from "express";
import { listarOfertas, obtenerOferta, crearOferta } from "../controllers/ofertas.controller.js";
import { postular, guardarOferta, miEstado } from "../controllers/candidato.controller.js";
import { requiereLogin, requiereRol } from "../middleware/validar.js";

const router = Router();

router.get("/", listarOfertas);
router.get("/:id", obtenerOferta);

// Solo empresas publican ofertas
router.post("/", requiereLogin, requiereRol("empresa"), crearOferta);

// Solo candidatos se postulan / guardan
router.post("/:id/postular", requiereLogin, requiereRol("candidato"), postular);
router.post("/:id/guardar", requiereLogin, requiereRol("candidato"), guardarOferta);
router.get("/:id/mi-estado", requiereLogin, requiereRol("candidato"), miEstado);

export default router;
