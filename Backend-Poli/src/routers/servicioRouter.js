import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";
import { buscarEstudiantePorNombre, procesarPago } from "../controllers/servicioController.js";
const router = Router()

router.get('/chat/buscar', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), buscarEstudiantePorNombre)
router.post('/pago', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), procesarPago)
export default router
