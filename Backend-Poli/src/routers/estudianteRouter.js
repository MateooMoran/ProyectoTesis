import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esEstudiante } from "../middlewares/roles.js";
import { crearCarrito,eliminarQuejaSugerencia, cearOrdenPendiente,crearQuejasSugerencias, disminuirCantidadProducto, eliminarNotificacionEstudiante, eliminarProductoCarrito, listarNotificacionesEstudiante, marcarNotificacionLeidaEstudiante, procesarPago, vaciarCarrito, verCategorias, verProductos, visualizarCarrito, visualizarHistorialPagos, visualizarQuejasSugerencias, cancelarOrden, cancelarOrdenesVencidas, verProductoPorId, buscarProductos, verProductosPorCategoria } from "../controllers/estudianteController.js";
const router = Router()

// PRODUCTOS
router.get('/estudiante/productos/buscar',buscarProductos)
// BUSCAR PRODUCTOS POR CATEGORÍA 
router.get('/estudiante/productos/categoria/:id',verProductosPorCategoria)
// VER PRODUCTO POR ID
router.get('/estudiante/productos/:id',verProductoPorId)
// VER CATEGORÍAS
router.get('/estudiante/categoria',verCategorias)
// VER PRODUCTOS
router.get('/estudiante/productos',verProductos)



// CARRITO
router.post('/estudiante/carrito', verifyTokenJWT, esEstudiante, crearCarrito);
router.get('/estudiante/carrito', verifyTokenJWT, esEstudiante, visualizarCarrito);
router.delete('/estudiante/carrito/:id', verifyTokenJWT, esEstudiante, eliminarProductoCarrito);
router.put('/estudiante/carrito/disminuir/:id', verifyTokenJWT, esEstudiante, disminuirCantidadProducto);
router.delete('/estudiante/carrito', verifyTokenJWT, esEstudiante, vaciarCarrito);

// PAGO
router.post('/estudiante/orden', verifyTokenJWT, esEstudiante, cearOrdenPendiente );
router.post('/estudiante/pago', verifyTokenJWT, esEstudiante, procesarPago);
router.put('/estudiante/orden/cancelar/:id', verifyTokenJWT, esEstudiante, cancelarOrden);
router.post('/estudiante/orden/cancelar-vencidas', verifyTokenJWT, esEstudiante, cancelarOrdenesVencidas);
router.get('/estudiante/historial-pagos', verifyTokenJWT, esEstudiante, visualizarHistorialPagos);

// QUEJAS - SUGERENCIAS
router.post('/estudiante/quejas-sugerencias', verifyTokenJWT, esEstudiante, crearQuejasSugerencias)
router.get('/estudiante/quejas-sugerencias', verifyTokenJWT, esEstudiante, visualizarQuejasSugerencias)
router.delete('/estudiante/quejas-sugerencias/:id', verifyTokenJWT, esEstudiante, eliminarQuejaSugerencia);
// NOTIFICACIONES
router.get("/estudiante/notificaciones",verifyTokenJWT, esEstudiante, listarNotificacionesEstudiante);
router.put("/estudiante/notificaciones/leida/:id",verifyTokenJWT, esEstudiante, marcarNotificacionLeidaEstudiante);
router.delete("/estudiante/notificaciones/:id", verifyTokenJWT, esEstudiante,eliminarNotificacionEstudiante);

export default router

