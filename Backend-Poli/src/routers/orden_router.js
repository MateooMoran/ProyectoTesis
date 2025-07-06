import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esEstudiante } from "../middlewares/roles.js";
import { crearOrden, listarMisOrdenes } from "../controllers/orden_controller.js";

const router = Router()

router.post('/estudiante/orden',verifyTokenJWT,esEstudiante,crearOrden)
router.get('/estudiante/visualizar/orden',verifyTokenJWT,esEstudiante,listarMisOrdenes)



export default router