import { Router } from "express";
import { listarEmpresas, listarCategorias, obtenerEstadisticas } from "../controllers/empresas.controller.js";

const router = Router();

router.get("/empresas", listarEmpresas);
router.get("/categorias", listarCategorias);
router.get("/estadisticas", obtenerEstadisticas);

export default router;
