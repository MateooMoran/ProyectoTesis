import { Router } from "express";
import { crearCategoria,crearProducto, listarCategorias, listarProducto, visualizarCategoriaPorCategoria } from "../controllers/vendedor_controller.js";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esVendedor } from "../middlewares/roles.js";

const router = Router()

// 📦 CATEGORÍAS
router.post('/vendedor/crear-categoria', verifyTokenJWT, esVendedor, crearCategoria);          
router.get('/vendedor/listar-categorias', verifyTokenJWT, esVendedor, listarCategorias);       
// 🛒 PRODUCTOS
router.post('/vendedor/crear-producto', verifyTokenJWT, esVendedor, crearProducto);           
router.get('/vendedor/listar-productos', verifyTokenJWT, esVendedor, listarProducto);         
router.get('/vendedor/productos-por-categoria/:id', verifyTokenJWT, esVendedor, visualizarCategoriaPorCategoria); 



export default router