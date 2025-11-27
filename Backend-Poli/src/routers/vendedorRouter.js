import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esVendedor, tieneRol } from "../middlewares/roles.js";

import { crearProducto, listarProducto, actualizarProducto, eliminarProducto } from "../controllers/vendedor/productoController.js";
import { generarModelo3DParaProducto, consultarEstadoModelo } from "../controllers/vendedor/modelo3DController.js";
import { confirmarPagoVenta, visualizarHistorialVentasVendedor } from "../controllers/vendedor/ventasController.js";
import {crearActualizarLugarRetiro, crearActualizarQR, crearActualizarTransferencia, eliminarLugarRetiro, eliminarMetodoPago, visualizarMetodosPago } from "../controllers/vendedor/metodoPagoController.js";
import { validarArchivoImagen, validarLugarRetiro, validarTransferencia } from "../validations/validadorPagos.js";
import handleValidationErrors from "../middlewares/handleValidationErrors.js";
import { validarProducto } from "../validations/validadorProducto.js";

const router = Router();

//  PRODUCTOS 
router.post('/vendedor/crear/producto', verifyTokenJWT, esVendedor,validarProducto, handleValidationErrors, crearProducto);
router.get('/vendedor/visualizar/producto', verifyTokenJWT, esVendedor, listarProducto);
router.put('/vendedor/actualizar/producto/:id', verifyTokenJWT, esVendedor,validarProducto, handleValidationErrors,actualizarProducto);
router.delete('/vendedor/eliminar/producto/:id', verifyTokenJWT, esVendedor, eliminarProducto);
router.post("/vendedor/producto/:id/generar-modelo", verifyTokenJWT, esVendedor, generarModelo3DParaProducto);
router.get("/vendedor/producto/:id/progreso-modelo", verifyTokenJWT, esVendedor, consultarEstadoModelo);


// MÉTODOS DE PAGO
router.post("/vendedor/pago/transferencia", verifyTokenJWT, esVendedor, validarTransferencia, handleValidationErrors, crearActualizarTransferencia);
router.post("/vendedor/pago/qr", verifyTokenJWT, esVendedor, validarArchivoImagen, crearActualizarQR);
router.post("/vendedor/pago/retiro", verifyTokenJWT, esVendedor, validarLugarRetiro, handleValidationErrors, crearActualizarLugarRetiro);
router.delete("/vendedor/pago/retiro/lugar", verifyTokenJWT, esVendedor, eliminarLugarRetiro);
router.get("/vendedor/pago/:tipo", verifyTokenJWT,  tieneRol('estudiante', 'admin', 'vendedor'), visualizarMetodosPago);
router.get("/vendedor/pago", verifyTokenJWT,  tieneRol('estudiante', 'admin', 'vendedor'), visualizarMetodosPago);
router.delete("/vendedor/pago/:id", verifyTokenJWT, esVendedor, eliminarMetodoPago);


// PAGOS Y VENTAS
router.put('/vendedor/ventas/:id/pagar', verifyTokenJWT, esVendedor, confirmarPagoVenta);
router.get('/vendedor/historial-ventas', verifyTokenJWT, esVendedor, visualizarHistorialVentasVendedor);

export default router;
