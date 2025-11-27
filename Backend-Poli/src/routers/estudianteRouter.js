import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esEstudiante, esEstudianteOrVendedor, puedeComprar } from "../middlewares/roles.js";
import { buscarProductos, verProductoPorId, verProductosPorCategoria, verCategorias, verProductos } from "../controllers/estudiante/categoriaProductoController.js";
import { eliminarFavorito, eliminarTodosFavoritos, seleccionarFavorito, verFavoritos } from "../controllers/estudiante/favoritosController.js";
import { crearOrden, subirComprobante, procesarPagoTarjeta,confirmarEntrega, verOrdenes, cancelarOrden } from "../controllers/estudiante/ordenesController.js";
import { crearQuejasSugerencias, eliminarQuejaSugerencia, visualizarQuejasSugerencias } from "../controllers/estudiante/quejasController.js";
import handleValidationErrors from "../middlewares/handleValidationErrors.js";
import { quejasValidations } from "../validations/validatorQuejas.js";
import { crearActualizarResena, visualizarMisResenas, visualizarResenasProducto,obtenerMiResena,verificarPuedeResenar} from "../controllers/estudiante/resenaController.js";
import { resenaValidations } from "../validations/validadorResenas.js";

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
router.post('/estudiante/orden', verifyTokenJWT, puedeComprar, crearOrden);
router.post('/estudiante/orden/:id/comprobante', verifyTokenJWT, puedeComprar, subirComprobante);
router.post('/estudiante/orden/pago-tarjeta', verifyTokenJWT, puedeComprar, procesarPagoTarjeta);
router.put('/estudiante/orden/:id/confirmar-entrega', verifyTokenJWT, puedeComprar, confirmarEntrega);
router.get('/estudiante/historial-pagos', verifyTokenJWT, puedeComprar, verOrdenes)
router.put('/estudiante/orden/:id/cancelar', verifyTokenJWT, puedeComprar, cancelarOrden);

// QUEJAS - SUGERENCIAS
router.post('/estudiante/quejas-sugerencias', verifyTokenJWT, esEstudianteOrVendedor, quejasValidations, handleValidationErrors, crearQuejasSugerencias)
router.get('/estudiante/quejas-sugerencias', verifyTokenJWT, esEstudianteOrVendedor, visualizarQuejasSugerencias)
router.delete('/estudiante/quejas-sugerencias/:id', verifyTokenJWT, esEstudianteOrVendedor, eliminarQuejaSugerencia);

// RESEÑAS
router.post('/estudiante/resena', verifyTokenJWT, puedeComprar, resenaValidations,handleValidationErrors,crearActualizarResena);
router.get('/estudiante/puede-resenar/:productoId', verifyTokenJWT, puedeComprar, verificarPuedeResenar);
router.get('/estudiante/resenas/producto/:productoId', visualizarResenasProducto);
router.get('/estudiante/mis-resenas', verifyTokenJWT, puedeComprar, visualizarMisResenas);
router.get('/estudiante/mi-resena/:productoId', verifyTokenJWT, puedeComprar, obtenerMiResena);
export default router

