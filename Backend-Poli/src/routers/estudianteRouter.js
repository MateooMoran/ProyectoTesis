import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esEstudiante, esEstudianteOrVendedor } from "../middlewares/roles.js";
import { buscarProductos, verProductoPorId, verProductosPorCategoria, verCategorias, verProductos } from "../controllers/estudiante/categoriaProductoController.js";
import { eliminarFavorito, eliminarTodosFavoritos, seleccionarFavorito, verFavoritos } from "../controllers/estudiante/favoritosController.js";
import { crearOrden, subirComprobante, procesarPagoTarjeta,confirmarEntrega, verOrdenes, cancelarOrden } from "../controllers/estudiante/ordenesController.js";
import { crearQuejasSugerencias, eliminarQuejaSugerencia, visualizarQuejasSugerencias } from "../controllers/estudiante/quejasController.js";
import handleValidationErrors from "../middlewares/handleValidationErrors.js";
import { quejasValidations } from "../validations/validatorQuejas.js";
import { crearActualizarResena, visualizarMisResenas, visualizarResenasProducto,obtenerMiResena,verificarPuedeResenar} from "../controllers/estudiante/resenaController.js";

const router = Router()
// PRODUCTOS
router.get('/estudiante/productos/buscar', buscarProductos)
router.get('/estudiante/productos/categoria/:id', verProductosPorCategoria)
router.get('/estudiante/productos/:id', verProductoPorId)
router.get('/estudiante/categoria', verCategorias)
router.get('/estudiante/productos', verProductos)

// FAVORITOS
router.patch("/estudiante/favorito/:id", verifyTokenJWT, esEstudiante, seleccionarFavorito);
router.get("/estudiante/favoritos", verifyTokenJWT, esEstudiante, verFavoritos);
router.delete("/estudiante/favorito/:id", verifyTokenJWT, esEstudiante, eliminarFavorito);
router.delete("/estudiante/favoritos",verifyTokenJWT,esEstudiante,eliminarTodosFavoritos)

// ÓRDENES Y PAGOS
router.post('/estudiante/orden', verifyTokenJWT, esEstudiante, crearOrden);
router.post('/estudiante/orden/:id/comprobante', verifyTokenJWT, esEstudiante, subirComprobante);
router.post('/estudiante/orden/pago-tarjeta', verifyTokenJWT, esEstudiante, procesarPagoTarjeta);
router.put('/estudiante/orden/:id/confirmar-entrega', verifyTokenJWT, esEstudiante, confirmarEntrega);
router.get('/estudiante/historial-pagos', verifyTokenJWT,esEstudiante,verOrdenes)
router.put('/estudiante/orden/:id/cancelar', verifyTokenJWT, esEstudiante, cancelarOrden);

// QUEJAS - SUGERENCIAS
router.post('/estudiante/quejas-sugerencias', verifyTokenJWT, esEstudianteOrVendedor, quejasValidations, handleValidationErrors, crearQuejasSugerencias)
router.get('/estudiante/quejas-sugerencias', verifyTokenJWT, esEstudianteOrVendedor, visualizarQuejasSugerencias)
router.delete('/estudiante/quejas-sugerencias/:id', verifyTokenJWT, esEstudianteOrVendedor, eliminarQuejaSugerencia);

// RESEÑAS
router.post('/estudiante/resena', verifyTokenJWT, esEstudiante, crearActualizarResena);
router.get('/estudiante/resenas/producto/:productoId', visualizarResenasProducto);
router.get('/estudiante/mis-resenas', verifyTokenJWT, esEstudiante, visualizarMisResenas);
router.get('/estudiante/mi-resena/:productoId', verifyTokenJWT, esEstudiante, obtenerMiResena);
router.get('/estudiante/puede-resenar/:productoId', verifyTokenJWT, esEstudiante, verificarPuedeResenar);
export default router

