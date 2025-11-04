import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esEstudiante, esEstudianteOrVendedor } from "../middlewares/roles.js";
import { buscarProductos, verProductoPorId, verProductosPorCategoria, verCategorias, verProductos } from "../controllers/estudiante/categoriaProductoController.js";
import { eliminarFavorito, eliminarTodosFavoritos, seleccionarFavorito, verFavoritos } from "../controllers/estudiante/favoritosController.js";
import { crearOrden, subirComprobante, procesarPagoTarjeta,confirmarEntrega} from "../controllers/estudiante/ordenesController.js";
import { crearQuejasSugerencias, eliminarQuejaSugerencia, visualizarQuejasSugerencias } from "../controllers/estudiante/quejasController.js";
import handleValidationErrors from "../middlewares/handleValidationErrors.js";
import { quejasValidations } from "../validations/validatorQuejas.js";

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
router.delete("/estudiante/favoritas/id",verifyTokenJWT,esEstudiante,eliminarTodosFavoritos)

// ÓRDENES Y PAGOS
router.post('/estudiante/orden', verifyTokenJWT, esEstudiante, crearOrden);
router.post('/estudiante/orden/:id/comprobante', verifyTokenJWT, esEstudiante, subirComprobante);
router.post('/estudiante/orden/pago-tarjeta', verifyTokenJWT, esEstudiante, procesarPagoTarjeta);
router.put('/estudiante/orden/:id/confirmar-entrega', verifyTokenJWT, esEstudiante, confirmarEntrega);


// QUEJAS - SUGERENCIAS
router.post('/estudiante/quejas-sugerencias', verifyTokenJWT, esEstudianteOrVendedor, quejasValidations, handleValidationErrors, crearQuejasSugerencias)
router.get('/estudiante/quejas-sugerencias', verifyTokenJWT, esEstudianteOrVendedor, visualizarQuejasSugerencias)
router.delete('/estudiante/quejas-sugerencias/:id', verifyTokenJWT, esEstudianteOrVendedor, eliminarQuejaSugerencia);

export default router

