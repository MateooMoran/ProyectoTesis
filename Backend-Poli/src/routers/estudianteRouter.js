import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esEstudiante } from "../middlewares/roles.js";
import { crearCarrito, crearQuejasSugerencias, eliminarProductoCarrito, procesarPago, verCategorias, verProductos, visualizarCarrito, visualizarHistorialPagos, visualizarQuejasSugerencias } from "../controllers/estudianteController.js";
const router = Router()

router.get('/estudiante/categoria',verifyTokenJWT,esEstudiante,verCategorias)
router.get('/estudiante/productos',verifyTokenJWT,esEstudiante,verProductos)
router.post('/estudiante/carrito', verifyTokenJWT, esEstudiante, crearCarrito);
router.get('/estudiante/carrito', verifyTokenJWT, esEstudiante, visualizarCarrito);
router.delete('/estudiante/carrito/:id', verifyTokenJWT, esEstudiante, eliminarProductoCarrito);
router.post('/estudiante/pago', verifyTokenJWT, esEstudiante, procesarPago);
router.get('/estudiante/historial-pagos', verifyTokenJWT, esEstudiante, visualizarHistorialPagos);
router.get('/estudiante/visualizar/quejas-sugerencias', verifyTokenJWT, esEstudiante, visualizarQuejasSugerencias);
export default router
