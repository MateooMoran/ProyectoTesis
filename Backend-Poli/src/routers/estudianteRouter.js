import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esEstudiante, esEstudianteOrVendedor } from "../middlewares/roles.js";
import { buscarProductos, verProductoPorId, verProductosPorCategoria,verCategorias,verProductos} from "../controllers/estudiante/categoriaProductoController.js";
import { seleccionarFavorito } from "../controllers/estudiante/favoritosController.js";
import { crearCarrito, disminuirCantidadProducto, eliminarProductoCarrito, vaciarCarrito, visualizarCarrito } from "../controllers/estudiante/carritoController.js";
import { cancelarOrden, cancelarOrdenesVencidas, crearOrdenPendiente, procesarPago, visualizarHistorialPagos } from "../controllers/estudiante/ordenesController.js";
import { crearQuejasSugerencias, eliminarQuejaSugerencia, visualizarQuejasSugerencias } from "../controllers/estudiante/quejasController.js";

const router = Router()
// PRODUCTOS

// BUSCAR PRODUCTOS
router.get('/estudiante/productos/buscar',buscarProductos)
// BUSCAR PRODUCTOS POR CATEGORÍA 
router.get('/estudiante/productos/categoria/:id',verProductosPorCategoria)
// VER PRODUCTO POR ID
router.get('/estudiante/productos/:id',verProductoPorId)
// VER CATEGORÍAS
router.get('/estudiante/categoria',verCategorias)
// VER PRODUCTOS
router.get('/estudiante/productos',verProductos)
// FAVORITOS
router.patch("/estudiante/favorito/:id", verifyTokenJWT,esEstudiante,seleccionarFavorito);


// CARRITO
router.post('/estudiante/carrito', verifyTokenJWT, esEstudiante, crearCarrito);
router.get('/estudiante/carrito', verifyTokenJWT, esEstudiante, visualizarCarrito);
router.delete('/estudiante/carrito/:id', verifyTokenJWT, esEstudiante, eliminarProductoCarrito);
router.put('/estudiante/carrito/disminuir/:id', verifyTokenJWT, esEstudiante, disminuirCantidadProducto);
router.delete('/estudiante/carrito', verifyTokenJWT, esEstudiante, vaciarCarrito);

// PAGO
router.post('/estudiante/orden', verifyTokenJWT, esEstudiante, crearOrdenPendiente );
router.post('/estudiante/pago', verifyTokenJWT, esEstudiante, procesarPago);
router.put('/estudiante/orden/cancelar/:id', verifyTokenJWT, esEstudiante, cancelarOrden);
router.post('/estudiante/orden/cancelar-vencidas', verifyTokenJWT, esEstudiante, cancelarOrdenesVencidas);
router.get('/estudiante/historial-pagos', verifyTokenJWT, esEstudiante, visualizarHistorialPagos);

// QUEJAS - SUGERENCIAS
router.post('/estudiante/quejas-sugerencias', verifyTokenJWT,esEstudianteOrVendedor, crearQuejasSugerencias)
router.get('/estudiante/quejas-sugerencias', verifyTokenJWT, esEstudianteOrVendedor, visualizarQuejasSugerencias)
router.delete('/estudiante/quejas-sugerencias/:id', verifyTokenJWT, esEstudianteOrVendedor,eliminarQuejaSugerencia);

export default router

