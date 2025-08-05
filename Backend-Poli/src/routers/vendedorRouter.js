import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esVendedor } from "../middlewares/roles.js";
import { actualizarProducto, crearCategoria, crearProducto, eliminarCategoria, eliminarNotificacion, eliminarProducto, listarCategorias, listarProducto, marcarComoLeida, verNotificaciones, visualizarHistorialVentasVendedor, visualizarProductoCategoria } from "../controllers/vendedorController.js";

const router = Router()

// CATEGORÍAS
router.post('/vendedor/crear/categoria', verifyTokenJWT, esVendedor, crearCategoria);          
router.get('/vendedor/visualizar/categoria', verifyTokenJWT, esVendedor, listarCategorias);       
router.delete('/vendedor/eliminar/categoria/:id', verifyTokenJWT,esVendedor,eliminarCategoria)

// PRODUCTOS
router.post('/vendedor/crear/producto', verifyTokenJWT, esVendedor, crearProducto);
router.get('/vendedor/visualizar/producto', verifyTokenJWT, esVendedor, listarProducto);         
router.put('/vendedor/actualizar/producto/:id', verifyTokenJWT, esVendedor, actualizarProducto);           
router.delete('/vendedor/eliminar/producto/:id', verifyTokenJWT, esVendedor, eliminarProducto);           
router.get('/vendedor/categoria/:id/productos', verifyTokenJWT, esVendedor, visualizarProductoCategoria); 

// HISTORIAL DE VENTAS
router.get('/vendedor/historial-ventas', verifyTokenJWT, esVendedor, visualizarHistorialVentasVendedor)

// NOTIFICACIONES
router.get('/vendedor/notificaciones', verifyTokenJWT, esVendedor, verNotificaciones);
router.put('/vendedor/notificaciones/:id', verifyTokenJWT, esVendedor, marcarComoLeida);
router.delete('/vendedor/notificaciones/:id', verifyTokenJWT, esVendedor, eliminarNotificacion);

export default router