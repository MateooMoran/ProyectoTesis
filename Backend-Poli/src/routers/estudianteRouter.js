import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esEstudiante } from "../middlewares/roles.js";
import { crearCarrito, crearQuejasSugerencias, eliminarNotificacionEstudiante, eliminarProductoCarrito, listarNotificacionesEstudiante, marcarNotificacionLeidaEstudiante, procesarPago, verCategorias, verProductos, visualizarCarrito, visualizarHistorialPagos, visualizarQuejasSugerencias } from "../controllers/estudianteController.js";
const router = Router()

// VER CATEGORIAS
router.get('/estudiante/categoria',verifyTokenJWT,esEstudiante,verCategorias)

// VER PRODUCTOS
router.get('/estudiante/productos',verifyTokenJWT,esEstudiante,verProductos)

// CARRITO
router.post('/estudiante/carrito', verifyTokenJWT, esEstudiante, crearCarrito);
router.get('/estudiante/carrito', verifyTokenJWT, esEstudiante, visualizarCarrito);
router.delete('/estudiante/carrito/:id', verifyTokenJWT, esEstudiante, eliminarProductoCarrito);

// PAGO
router.post('/estudiante/pago', verifyTokenJWT, esEstudiante, procesarPago);
router.get('/estudiante/historial-pagos', verifyTokenJWT, esEstudiante, visualizarHistorialPagos);

// QUEJAS - SUGERENCIAS
router.post('/estudiante/quejas-sugerencias', verifyTokenJWT, esEstudiante, crearQuejasSugerencias)
router.get('/estudiante/quejas-sugerencias', verifyTokenJWT, esEstudiante, visualizarQuejasSugerencias)

// NOTIFICACIONES
router.get("/estudiante/notificaciones", listarNotificacionesEstudiante);
router.put("/estudiante/notificaciones/leida/:id", marcarNotificacionLeidaEstudiante);
router.delete("/estudiante/notificaciones/:id", eliminarNotificacionEstudiante);

export default router

