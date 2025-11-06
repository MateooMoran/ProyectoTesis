import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";
import { buscarEstudiantePorNombre } from "../controllers/servicios/estudiantesController.js";
import { conversacionLectura, eliminarConversacion, obtenerConversacionesRecientes } from "../controllers/servicios/conversacionController.js";
import { eliminarNotificacion, listarNotificaciones, marcarNotificacionLeida } from "../controllers/servicios/notificacionesController.js";
import { callbackGoogle, loginGoogle, logout, obtenerUsuario } from "../controllers/servicios/authController.js";

const router = Router();

router.get('/chat/buscar', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), buscarEstudiantePorNombre);
router.get('/chat/conversaciones', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'),obtenerConversacionesRecientes);
router.post("/conversacion/:id/leer", verifyTokenJWT,tieneRol('estudiante', 'admin', 'vendedor'), conversacionLectura);
router.delete('/chat/conversacion/:id', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), eliminarConversacion);

router.get('/notificaciones', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), listarNotificaciones);
router.put('/notificaciones/leida/:id', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), marcarNotificacionLeida);
router.delete('/notificaciones/:id', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), eliminarNotificacion);

router.get('/auth/google', loginGoogle);
router.get('/auth/google/callback', callbackGoogle);
router.get('/auth/usuario', verifyTokenJWT, obtenerUsuario);
router.get('/auth/logout', logout);
export default router;
