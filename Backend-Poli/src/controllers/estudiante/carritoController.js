import Carrito from "../../models/Carrito.js";
import Producto from "../../models/Producto.js";
import mongoose from "mongoose";

// Crear o actualizar carrito
export const crearCarrito = async (req, res) => {
  try {
    const { productos } = req.body;
    let carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });

    if (!carrito) carrito = new Carrito({ comprador: req.estudianteBDD._id, productos: [], total: 0 });

    let totalActual = carrito.total || 0;

    for (const item of productos) {
      const productoid = item.producto;
      const stockReservado = item.cantidad;

      if (!productoid || stockReservado <= 0) return res.status(400).json({ msg: "Producto o cantidad inválida" });
      if (!mongoose.Types.ObjectId.isValid(productoid)) return res.status(400).json({ msg: `ID de producto inválido: ${productoid}` });

      const productoDB = await Producto.findById(productoid).select("stock precio activo");
      if (!productoDB || !productoDB.activo) return res.status(404).json({ msg: `Producto con id ${productoid} no encontrado` });
      if (stockReservado > productoDB.stock) return res.status(400).json({ msg: `Stock no disponible para el producto ${productoDB._id}` });

      const existente = carrito.productos.find(p => p.producto.toString() === productoid);
      const precioUnitario = productoDB.precio;
      const subtotal = precioUnitario * stockReservado;

      if (existente) {
        existente.cantidad += stockReservado;
        existente.subtotal += subtotal;
      } else {
        carrito.productos.push({ producto: productoid, cantidad: stockReservado, precioUnitario, subtotal });
      }

      totalActual += subtotal;
    }

    carrito.total = totalActual;
    await carrito.save();
    res.status(200).json({ msg: "Carrito actualizado correctamente", carrito });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creando carrito", error: error.message });
  }
};

export const visualizarCarrito = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id })
      .populate('productos.producto', 'nombreProducto precio imagen');

    if (!carrito) return res.status(200).json({ msg: "No hay productos en el carrito", carrito: null });
    res.status(200).json(carrito);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error visualizando carrito", error: error.message });
  }
};

export const disminuirCantidadProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de producto inválido" });
    if (!carrito || carrito.productos.length === 0) return res.status(400).json({ msg: "No hay productos en el carrito" });

    const index = carrito.productos.findIndex(p => p._id.toString() === id);
    if (index === -1) return res.status(404).json({ msg: "Producto no encontrado en el carrito" });

    const item = carrito.productos[index];
    if (item.cantidad > 1) {
      item.cantidad -= 1;
      item.subtotal = item.cantidad * item.precioUnitario;
    } else {
      carrito.productos.splice(index, 1);
    }

    carrito.total = carrito.productos.reduce((acc, p) => acc + p.subtotal, 0);
    await carrito.save();
    res.status(200).json({ msg: "Cantidad actualizada correctamente", carrito });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error disminuyendo cantidad", error: error.message });
  }
};

export const eliminarProductoCarrito = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de producto inválido" });

    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id }).populate('productos.producto');
    if (!carrito || carrito.productos.length === 0) return res.status(400).json({ msg: "No hay productos en el carrito" });

    const index = carrito.productos.findIndex(p => p._id.toString() === id);
    if (index === -1) return res.status(404).json({ msg: "Producto no encontrado en el carrito" });

    carrito.productos.splice(index, 1);
    carrito.total = carrito.productos.reduce((acc, p) => acc + p.subtotal, 0);
    await carrito.save();
    res.status(200).json({ msg: "Producto eliminado correctamente", carrito });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error eliminando producto del carrito", error: error.message });
  }
};

export const vaciarCarrito = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });
    if (!carrito) return res.status(404).json({ msg: "Carrito no encontrado" });

    carrito.productos = [];
    carrito.total = 0;
    await carrito.save();
    res.status(200).json({ msg: "Carrito vaciado correctamente", carrito });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error vaciando carrito", error: error.message });
  }
};
