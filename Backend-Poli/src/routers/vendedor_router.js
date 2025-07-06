import { Router } from "express";
import { actualizarProducto, crearCategoria,crearProducto, eliminarCategoria, eliminarProducto, listarCategorias, listarProducto, visualizarCategoriaPorCategoria } from "../controllers/vendedor_controller.js";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esVendedor } from "../middlewares/roles.js";

const router = Router()

// 📦 CATEGORÍAS
router.post('/vendedor/crear-categoria', verifyTokenJWT, esVendedor, crearCategoria);          
router.get('/vendedor/listar-categorias', verifyTokenJWT, esVendedor, listarCategorias);       
router.delete('/vendedor/eliminar-categoria', verifyTokenJWT,esVendedor,eliminarCategoria)
// 🛒 PRODUCTOS
router.post('/vendedor/crear-producto', verifyTokenJWT, esVendedor, crearProducto);
router.put('/vendedor/actualizar-producto/:id', verifyTokenJWT, esVendedor, actualizarProducto);           
router.delete('/vendedor/eliminar-producto/:id', verifyTokenJWT, esVendedor, eliminarProducto);           

router.get('/vendedor/listar-productos', verifyTokenJWT, esVendedor, listarProducto);         
router.get('/vendedor/productos-por-categoria/:id', verifyTokenJWT, esVendedor, visualizarCategoriaPorCategoria); 



export default router