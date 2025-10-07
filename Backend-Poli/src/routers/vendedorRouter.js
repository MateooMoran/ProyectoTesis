import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esVendedor } from "../middlewares/roles.js";

import {crearCategoria,listarCategorias,eliminarCategoria} from "../controllers/vendedor/categoriaController.js";
import {crearProducto,listarProducto,actualizarProducto,eliminarProducto,visualizarProductoCategoria} from "../controllers/vendedor/productoController.js";
import { generarModelo3DParaProducto } from "../controllers/vendedor/modelo3DController.js";
import { visualizarHistorialVentasVendedor, actualizarEstadoVenta } from "../controllers/vendedor/ventasController.js";

const router = Router();

//  CATEGORÍAS 
router.post('/vendedor/crear/categoria', verifyTokenJWT, esVendedor, crearCategoria);          
router.get('/vendedor/visualizar/categoria', verifyTokenJWT, esVendedor, listarCategorias);       
router.delete('/vendedor/eliminar/categoria/:id', verifyTokenJWT, esVendedor, eliminarCategoria);

//  PRODUCTOS 
router.post('/vendedor/crear/producto', verifyTokenJWT, esVendedor, crearProducto);
router.get('/vendedor/visualizar/producto', verifyTokenJWT, esVendedor, listarProducto);
router.put('/vendedor/actualizar/producto/:id', verifyTokenJWT, esVendedor, actualizarProducto);
router.delete('/vendedor/eliminar/producto/:id', verifyTokenJWT, esVendedor, eliminarProducto);
router.get('/vendedor/categoria/:id/productos', verifyTokenJWT, esVendedor, visualizarProductoCategoria);

// Generar modelo 3D
router.post("/vendedor/generar/producto/:id", verifyTokenJWT, esVendedor, generarModelo3DParaProducto);

// HISTORIAL DE VENTAS
router.get('/vendedor/historial-ventas', verifyTokenJWT, esVendedor, visualizarHistorialVentasVendedor);
router.put('/ventas/:id/pagar', verifyTokenJWT, esVendedor, actualizarEstadoVenta);

export default router;
