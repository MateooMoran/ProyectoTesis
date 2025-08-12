import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { esVendedor } from "../middlewares/roles.js";
import { actualizarProducto, crearCategoria, crearProducto, eliminarCategoria, eliminarProducto, listarCategorias, listarProducto, visualizarHistorialVentasVendedor, visualizarProductoCategoria } from "../controllers/vendedorController.js";
import Orden from "../models/Orden.js";

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
router.put('/ventas/:id/pagar', verifyTokenJWT, esVendedor, async (req, res) => {
  try {
    const venta = await Orden.findByIdAndUpdate(
      req.params.id,
      { estado: 'pagado' },
      { new: true }
    );

    if (!venta) return res.status(404).json({ msg: 'Venta no encontrada' });

    res.json({ msg: 'Venta actualizada', venta });
  } catch (error) {
    res.status(500).json({ msg: 'Error al actualizar venta' });
  }
});
export default router