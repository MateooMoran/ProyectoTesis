import { Router } from "express";
import { actualizarProducto, crearCategoria,crearProducto, eliminarCategoria, eliminarProducto, listarCategorias, listarProducto, visualizarCategoriaPorCategoria } from "../controllers/vendedor_controller.js";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esVendedor } from "../middlewares/roles.js";

const router = Router()

// 📦 CATEGORÍAS
router.post('/vendedor/crear/categoria', verifyTokenJWT, esVendedor, crearCategoria);          
router.get('/vendedor/visualizar/categorias', verifyTokenJWT, esVendedor, listarCategorias);       
router.delete('/vendedor/eliminar/categoria/:id', verifyTokenJWT,esVendedor,eliminarCategoria)

// 🛒 PRODUCTOS
router.post('/vendedor/crear/producto', verifyTokenJWT, esVendedor, crearProducto);
router.get('/vendedor/visualizar/productos', verifyTokenJWT, esVendedor, listarProducto);         
router.put('/vendedor/actualizar/producto/:id', verifyTokenJWT, esVendedor, actualizarProducto);           
router.delete('/vendedor/eliminar/producto/:id', verifyTokenJWT, esVendedor, eliminarProducto);           
router.get('/vendedor/categoria/:id/productos', verifyTokenJWT, esVendedor, visualizarCategoriaPorCategoria); 




export default router