import { Router } from "express";
import { esAdmin } from "../middlewares/roles.js";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { cambioRol, listarNotificacionesAdmin, listarTodasLasQuejasSugerencias, marcarNotificacionLeida, obtenerUsuarios, responderQuejaSugerencia } from "../controllers/adminController.js";

const router = Router()

// USUARIOS
router.get('/admin/usuario',verifyTokenJWT,esAdmin,obtenerUsuarios)
router.put('/admin/rol/:id',verifyTokenJWT,esAdmin,cambioRol)

// QUEJAS Y SUGERENCIAS
router.get('/admin/quejas-sugerencias', verifyTokenJWT, esAdmin, listarTodasLasQuejasSugerencias);
router.put('/admin/quejas-sugerencias/:id', verifyTokenJWT, esAdmin, responderQuejaSugerencia);

// NOTIFICACIONES
router.get("/admin/notificaciones", verifyTokenJWT, esAdmin, listarNotificacionesAdmin);
router.put("/admin/notificaciones/leida/:id", verifyTokenJWT, esAdmin, marcarNotificacionLeida);

export default router