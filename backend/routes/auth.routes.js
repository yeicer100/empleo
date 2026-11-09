import { Router } from "express";
import { registrarCandidato, registrarEmpresa, login } from "../controllers/auth.controller.js";

const router = Router();

router.post("/registro-candidato", registrarCandidato);
router.post("/registro-empresa", registrarEmpresa);
router.post("/login", login);

export default router;
