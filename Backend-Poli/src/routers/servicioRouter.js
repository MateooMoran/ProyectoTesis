import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";
import { buscarEstudiantePorNombre } from "../controllers/servicios/estudiantesController.js";
import { 
    conversacionLectura, 
    crearObtenerConversacion, 
    eliminarConversacion, 
    obtenerConversacionesRecientes, 
    obtenerContadorMensajesNoLeidos 
} from "../controllers/servicios/conversacionController.js";
import { 
    eliminarMensaje, 
    enviarMensajeImagen, 
    enviarMensajeTexto, 
    marcarMensajesLeidos, 
    obtenerMensajes 
} from "../controllers/servicios/mensajesController.js";
import { eliminarNotificacion, listarNotificaciones, marcarNotificacionLeida } from "../controllers/servicios/notificacionesController.js";
import { callbackGoogle, loginGoogle, logout, obtenerUsuario } from "../controllers/servicios/authController.js";

const router = Router();

// RUTAS DE CHAT - Búsqueda de usuarios
router.get('/servicios/chat/buscar', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), buscarEstudiantePorNombre);

// RUTAS DE CONVERSACIONES
router.get('/servicios/chat/conversaciones', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), obtenerConversacionesRecientes);
router.post('/servicios/chat/conversacion', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), crearObtenerConversacion);
router.post("/servicios/chat/conversacion/:id/leer", verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), conversacionLectura);
router.delete('/servicios/chat/conversacion/:id', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), eliminarConversacion);
router.get('/servicios/chat/contador-no-leidos', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), obtenerContadorMensajesNoLeidos);

// RUTAS DE MENSAJES
router.get('/servicios/chat/mensajes/:conversacionId', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), obtenerMensajes);
router.post('/servicios/chat/mensaje/texto', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), enviarMensajeTexto);
router.post('/servicios/chat/mensaje/imagen', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), enviarMensajeImagen);
router.delete('/servicios/chat/mensaje/:mensajeId', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), eliminarMensaje);
router.put('/servicios/chat/mensajes/:conversacionId/leer', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), marcarMensajesLeidos);

// RUTA PARA NOTIFICACIONES
router.get('/notificaciones', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), listarNotificaciones);
router.put('/notificaciones/leida/:id', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), marcarNotificacionLeida);
router.delete('/notificaciones/:id', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), eliminarNotificacion);

// RUTA PARA LOGIN/REGISTRO CON GOOGLE
router.get('/auth/google', loginGoogle);
router.get('/auth/google/callback', callbackGoogle);
router.get('/auth/usuario', verifyTokenJWT, obtenerUsuario);
router.get('/auth/logout', logout);

export default router;
