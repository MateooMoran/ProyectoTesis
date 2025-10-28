import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esAdmin, esVendedor, esVendedorOrAdmin } from "../middlewares/roles.js";

import { crearCategoria, listarCategorias, eliminarCategoria } from "../controllers/vendedor/categoriaController.js";
import { crearProducto, listarProducto, actualizarProducto, eliminarProducto, visualizarProductoCategoria, reactivarProducto, verProductosEliminados } from "../controllers/vendedor/productoController.js";
import { generarModelo3DParaProducto } from "../controllers/vendedor/modelo3DController.js";
import { visualizarHistorialVentasVendedor, actualizarEstadoVenta } from "../controllers/vendedor/ventasController.js";
import { crearActualizarEfectivo, crearActualizarQR, crearActualizarTransferencia, visualizarMetodosPago } from "../controllers/vendedor/metodoPagoController.js";
import { validarArchivoImagen, validarEfectivo, validarTipo, validarTransferencia } from "../validations/validadorPagos.js";
import handleValidationErrors from "../middlewares/handleValidationErrors.js";
import { validarProducto } from "../validations/validadorProducto.js";
const router = Router();

//  CATEGORÍAS 
router.post('/vendedor/crear/categoria', verifyTokenJWT, esAdmin, crearCategoria);
router.get('/vendedor/visualizar/categoria', verifyTokenJWT, esVendedorOrAdmin, listarCategorias);
router.delete('/vendedor/eliminar/categoria/:id', verifyTokenJWT, esAdmin, eliminarCategoria);

//  PRODUCTOS 
router.post('/vendedor/crear/producto', verifyTokenJWT, esVendedor,validarProducto, handleValidationErrors, crearProducto);
router.get('/vendedor/visualizar/producto', verifyTokenJWT, esVendedor, listarProducto);
router.get('/vendedor/categoria/:id/productos', verifyTokenJWT, esVendedor, visualizarProductoCategoria);
handleValidationErrors,
router.put('/vendedor/actualizar/producto/:id', verifyTokenJWT, esVendedor,validarProducto, handleValidationErrors,actualizarProducto);
router.delete('/vendedor/eliminar/producto/:id', verifyTokenJWT, esVendedor, eliminarProducto);

// OPCIONALES
router.get('/vendedor/producto/eliminados', verifyTokenJWT, esVendedor, verProductosEliminados);
router.patch('/vendedor/activar/producto/:id', verifyTokenJWT, esVendedor, reactivarProducto);

// MÉTODOS DE PAGO
router.post("/vendedor/pago/transferencia", verifyTokenJWT, esVendedor, validarTransferencia, handleValidationErrors, crearActualizarTransferencia);
router.post("/vendedor/pago/qr", verifyTokenJWT, esVendedor, validarArchivoImagen, crearActualizarQR);
router.post("/vendedor/pago/efectivo", verifyTokenJWT, esVendedor, validarEfectivo, handleValidationErrors, crearActualizarEfectivo);
router.get("/vendedor/pago/:tipo", verifyTokenJWT, esVendedor, validarTipo, handleValidationErrors, visualizarMetodosPago);

// Generar modelo 3D
router.post("/vendedor/generar/producto/:id", verifyTokenJWT, esVendedor, generarModelo3DParaProducto);

// HISTORIAL DE VENTAS
router.get('/vendedor/historial-ventas', verifyTokenJWT, esVendedor, visualizarHistorialVentasVendedor);
router.put('/ventas/:id/pagar', verifyTokenJWT, esVendedor, actualizarEstadoVenta);

export default router;
