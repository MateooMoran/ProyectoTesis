import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";
import buscarEstudiantePorNombre from "../controllers/conversacion_controller.js";
import { procesarPago } from "../controllers/pago_controller.js";
const router = Router()

router.get('/chat/buscar', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), buscarEstudiantePorNombre)
router.post('/pago', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), procesarPago)
export default router
