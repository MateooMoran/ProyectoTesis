import Carrito from "../../models/Carrito.js";
import Producto from "../../models/Producto.js";
import mongoose from "mongoose";

const calcularTotalCarrito = (productos) =>
  productos.reduce((acc, p) => acc + p.subtotal, 0);

const poblarCarrito = (carrito) =>
  Carrito.findById(carrito._id).populate(
    "productos.producto",
    "nombreProducto precio imagen vendedor"
  );

//  CREAR / ACTUALIZAR CARRITO 
export const crearCarrito = async (req, res) => {
  try {
    const { productos } = req.body;
    if (!Array.isArray(productos) || productos.length === 0)
      return res.status(400).json({ msg: "Debe enviar un array de productos válido" });

    let carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });
    if (!carrito) {
      carrito = new Carrito({ comprador: req.estudianteBDD._id, productos: [], total: 0 });
    }

    for (const item of productos) {
      const { producto: productoid, cantidad: stockReservado } = item;

      if (!productoid || stockReservado <= 0)
        return res.status(400).json({ msg: "Producto o cantidad inválida" });
      if (!mongoose.Types.ObjectId.isValid(productoid))
        return res.status(400).json({ msg: `ID de producto inválido: ${productoid}` });

      const productoDB = await Producto.findById(productoid).select("stock precio activo");
      if (!productoDB || !productoDB.activo)
        return res.status(404).json({ msg: `Producto no encontrado o inactivo: ${productoid}` });
      if (stockReservado > productoDB.stock)
        return res.status(400).json({ msg: `Stock insuficiente: solo hay ${productoDB.stock}` });

      const existente = carrito.productos.find(p => p.producto.toString() === productoid);
      const subtotal = productoDB.precio * stockReservado;

      if (existente) {
        existente.cantidad += stockReservado;
        existente.subtotal += subtotal;
      } else {
        carrito.productos.push({
          producto: productoid,
          cantidad: stockReservado,
          precioUnitario: productoDB.precio,
          subtotal,
        });
      }
    }

    carrito.total = calcularTotalCarrito(carrito.productos);
    await carrito.save();

    const carritoPoblado = await poblarCarrito(carrito);
    res.status(200).json({ msg: "Carrito actualizado correctamente", carrito: carritoPoblado });
  } catch (error) {
    console.error("Error en crearCarrito:", error);
    res.status(500).json({ msg: "Error interno", error: error.message });
  }
};

//  VISUALIZAR CARRITO 
export const visualizarCarrito = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id })
      .populate("productos.producto", "nombreProducto precio imagen vendedor");

    if (!carrito || carrito.productos.length === 0)
      return res.status(200).json({ msg: "Carrito vacío", carrito: null });

    res.status(200).json(carrito);
  } catch (error) {
    console.error("Error en visualizarCarrito:", error);
    res.status(500).json({ msg: "Error al cargar carrito", error: error.message });
  }
};

//  DISMINUIR CANTIDAD 
export const disminuirCantidadProducto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ msg: "ID inválido" });

    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });
    if (!carrito || carrito.productos.length === 0)
      return res.status(400).json({ msg: "Carrito vacío" });

    const index = carrito.productos.findIndex(p => p._id.toString() === id);
    if (index === -1)
      return res.status(404).json({ msg: "Producto no encontrado en el carrito" });

    const item = carrito.productos[index];
    if (item.cantidad > 1) {
      item.cantidad -= 1;
      item.subtotal = item.cantidad * item.precioUnitario;
    } else {
      carrito.productos.splice(index, 1);
    }

    carrito.total = calcularTotalCarrito(carrito.productos);
    await carrito.save();

    const carritoPoblado = await poblarCarrito(carrito);
    res.status(200).json({ msg: "Cantidad reducida", carrito: carritoPoblado });
  } catch (error) {
    console.error("Error en disminuirCantidad:", error);
    res.status(500).json({ msg: "Error al reducir cantidad", error: error.message });
  }
};

//  AUMENTAR CANTIDAD 
export const aumentarCantidadProducto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ msg: "ID inválido" });

    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });
    if (!carrito || carrito.productos.length === 0)
      return res.status(400).json({ msg: "Carrito vacío" });

    const index = carrito.productos.findIndex(p => p._id.toString() === id);
    if (index === -1)
      return res.status(404).json({ msg: "Producto no encontrado" });

    const item = carrito.productos[index];
    const productoDB = await Producto.findById(item.producto).select("stock activo");
    if (!productoDB || !productoDB.activo)
      return res.status(404).json({ msg: "Producto no disponible" });

    if (item.cantidad + 1 > productoDB.stock)
      return res.status(400).json({ msg: `Stock insuficiente. Disponible: ${productoDB.stock}` });

    item.cantidad += 1;
    item.subtotal = item.cantidad * item.precioUnitario;
    carrito.total = calcularTotalCarrito(carrito.productos);
    await carrito.save();

    const carritoPoblado = await poblarCarrito(carrito);
    res.status(200).json({ msg: "Cantidad aumentada", carrito: carritoPoblado });
  } catch (error) {
    console.error("Error en aumentarCantidad:", error);
    res.status(500).json({ msg: "Error al aumentar cantidad", error: error.message });
  }
};

//  ELIMINAR PRODUCTO 
export const eliminarProductoCarrito = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ msg: "ID inválido" });

    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });
    if (!carrito || carrito.productos.length === 0)
      return res.status(400).json({ msg: "Carrito vacío" });

    const index = carrito.productos.findIndex(p => p._id.toString() === id);
    if (index === -1)
      return res.status(404).json({ msg: "Producto no encontrado" });

    carrito.productos.splice(index, 1);
    carrito.total = calcularTotalCarrito(carrito.productos);
    await carrito.save();

    const carritoPoblado = carrito.productos.length > 0 ? await poblarCarrito(carrito) : null;
    res.status(200).json({ msg: "Producto eliminado", carrito: carritoPoblado });
  } catch (error) {
    console.error("Error en eliminarProducto:", error);
    res.status(500).json({ msg: "Error al eliminar", error: error.message });
  }
};

//  VACIAR CARRITO 
export const vaciarCarrito = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });
    if (!carrito)
      return res.status(404).json({ msg: "Carrito no encontrado" });

    carrito.productos = [];
    carrito.total = 0;
    await carrito.save();

    res.status(200).json({ msg: "Carrito vaciado", carrito: null });
  } catch (error) {
    console.error("Error en vaciarCarrito:", error);
    res.status(500).json({ msg: "Error al vaciar carrito", error: error.message });
  }
};