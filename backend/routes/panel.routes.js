import { Router } from "express";
import { requiereLogin, requiereRol } from "../middleware/validar.js";
import { perfil as perfilCandidato, misPostulaciones, misGuardadas } from "../controllers/candidato.controller.js";
import {
  perfil as perfilEmpresa,
  misOfertas,
  cambiarEstadoOferta,
  postulacionesRecibidas,
  contarNuevas,
  marcarVista,
  responderPostulacion,
} from "../controllers/empresa.controller.js";

const router = Router();

const soloCandidato = [requiereLogin, requiereRol("candidato")];
const soloEmpresa = [requiereLogin, requiereRol("empresa")];

// --- Candidato ---
router.get("/candidato/perfil", ...soloCandidato, perfilCandidato);
router.get("/candidato/postulaciones", ...soloCandidato, misPostulaciones);
router.get("/candidato/guardadas", ...soloCandidato, misGuardadas);

// --- Empresa ---
router.get("/empresa/perfil", ...soloEmpresa, perfilEmpresa);
router.get("/empresa/ofertas", ...soloEmpresa, misOfertas);
router.patch("/empresa/ofertas/:id/estado", ...soloEmpresa, cambiarEstadoOferta);
router.get("/empresa/postulaciones", ...soloEmpresa, postulacionesRecibidas);
router.get("/empresa/notificaciones", ...soloEmpresa, contarNuevas);
router.post("/empresa/postulaciones/:id/visto", ...soloEmpresa, marcarVista);
router.patch("/empresa/postulaciones/:id", ...soloEmpresa, responderPostulacion);

export default router;
