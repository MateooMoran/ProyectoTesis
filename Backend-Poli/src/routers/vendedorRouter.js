import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esAdmin, esEstudianteOrVendedor, esVendedor, esVendedorOrAdmin } from "../middlewares/roles.js";

import { crearCategoria, listarCategorias, eliminarCategoria } from "../controllers/vendedor/categoriaController.js";
import { crearProducto, listarProducto, actualizarProducto, eliminarProducto, visualizarProductoCategoria, reactivarProducto, verProductosEliminados } from "../controllers/vendedor/productoController.js";
import { generarModelo3DParaProducto } from "../controllers/vendedor/modelo3DController.js";
import { confirmarPagoVenta, visualizarHistorialVentasVendedor } from "../controllers/vendedor/ventasController.js";
import {crearActualizarLugarRetiro, crearActualizarQR, crearActualizarTransferencia, eliminarMetodoPago, visualizarMetodosPago } from "../controllers/vendedor/metodoPagoController.js";
import { validarArchivoImagen, validarLugarRetiro, validarTransferencia } from "../validations/validadorPagos.js";
import handleValidationErrors from "../middlewares/handleValidationErrors.js";
import { validarProducto } from "../validations/validadorProducto.js";
import { validarCategoria } from "../validations/validatorCategoria.js";

const router = Router();

//  CATEGORÍAS 
router.post('/vendedor/crear/categoria', verifyTokenJWT, esAdmin,validarCategoria,handleValidationErrors, crearCategoria);
router.get('/vendedor/visualizar/categoria', verifyTokenJWT, esVendedorOrAdmin, listarCategorias);
router.delete('/vendedor/eliminar/categoria/:id', verifyTokenJWT, esAdmin, eliminarCategoria);

//  PRODUCTOS 
router.post('/vendedor/crear/producto', verifyTokenJWT, esVendedor,validarProducto, handleValidationErrors, crearProducto);
router.get('/vendedor/visualizar/producto', verifyTokenJWT, esVendedor, listarProducto);
router.get('/vendedor/categoria/:id/productos', verifyTokenJWT, esVendedor, visualizarProductoCategoria);
handleValidationErrors,
router.put('/vendedor/actualizar/producto/:id', verifyTokenJWT, esVendedor,validarProducto, handleValidationErrors,actualizarProducto);
router.delete('/vendedor/eliminar/producto/:id', verifyTokenJWT, esVendedor, eliminarProducto);
router.post("/vendedor/generar/producto/:id", verifyTokenJWT, esVendedor, generarModelo3DParaProducto);

// OPCIONALES
router.get('/vendedor/producto/eliminados', verifyTokenJWT, esVendedor, verProductosEliminados);
router.patch('/vendedor/activar/producto/:id', verifyTokenJWT, esVendedor, reactivarProducto);


// MÉTODOS DE PAGO
router.post("/vendedor/pago/transferencia", verifyTokenJWT, esVendedor, validarTransferencia, handleValidationErrors, crearActualizarTransferencia);
router.post("/vendedor/pago/qr", verifyTokenJWT, esVendedor, validarArchivoImagen, crearActualizarQR);
router.post("/vendedor/pago/retiro", verifyTokenJWT, esVendedor, validarLugarRetiro, handleValidationErrors, crearActualizarLugarRetiro);
router.get("/vendedor/pago/:tipo", verifyTokenJWT, esEstudianteOrVendedor, visualizarMetodosPago);
router.get("/vendedor/pago", verifyTokenJWT, esEstudianteOrVendedor, visualizarMetodosPago);
router.delete("/vendedor/pago/:id", verifyTokenJWT, esVendedor, eliminarMetodoPago);


// PAGOS Y VENTAS
router.put('/vendedor/ventas/:id/pagar', verifyTokenJWT, esVendedor, confirmarPagoVenta);
router.get('/vendedor/historial-pagos', verifyTokenJWT, esVendedor, visualizarHistorialVentasVendedor);

export default router;
