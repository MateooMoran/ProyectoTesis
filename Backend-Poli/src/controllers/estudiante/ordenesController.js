import Orden from "../../models/Orden.js";
import Carrito from "../../models/Carrito.js";
import Producto from "../../models/Producto.js";
import Notificacion from "../../models/Notificacion.js";
import Stripe from 'stripe';
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const crearOrdenPendiente = async (req, res) => {
  try {
    const { metodoPago } = req.body;
    if (!["efectivo", "transferencia"].includes(metodoPago)) {
      return res.status(400).json({ msg: "Método de pago inválido para orden pendiente" });
    }

    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });
    if (!carrito || carrito.productos.length === 0) {
      return res.status(400).json({ msg: "El carrito está vacío" });
    }

    for (const item of carrito.productos) {
      const producto = await Producto.findById(item.producto);
      if (!producto || producto.stock < item.cantidad) {
        return res.status(400).json({ msg: `Stock insuficiente para ${producto?.nombreProducto || "producto no disponible"}` });
      }
    }

    for (const item of carrito.productos) {
      const producto = await Producto.findById(item.producto);
      const orden = new Orden({
        comprador: req.estudianteBDD._id,
        vendedor: producto.vendedor,
        productos: [item],
        total: item.subtotal,
        estado: "pendiente",
        metodoPago
      });
      await orden.save();
      await Notificacion.create({
        usuario: producto.vendedor,
        mensaje: `Tienes una nueva orden pendiente por ${item.cantidad} unidad(es) de "${producto.nombreProducto}"`,
        tipo: "venta"
      });
    }

    await Carrito.findByIdAndDelete(carrito._id);
    res.status(200).json({ msg: "Orden creada con estado pendiente máximo pagar en 12 horas." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creando orden pendiente", error: error.message });
  }
};

// Procesar pago con tarjeta
export const procesarPago = async (req, res) => {
  try {
    const { paymentMethodId, metodoPago = "tarjeta" } = req.body;
    if (metodoPago !== "tarjeta") return res.status(400).json({ msg: "Este endpoint es solo para pagos con tarjeta" });

    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });
    if (!carrito || carrito.productos.length === 0) return res.status(400).json({ msg: "El carrito está vacío" });

    for (const item of carrito.productos) {
      const producto = await Producto.findById(item.producto);
      if (!producto || producto.stock < item.cantidad) {
        return res.status(400).json({ msg: `Stock insuficiente para ${producto?.nombreProducto || "producto no disponible"}` });
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(carrito.total * 100),
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: { comprador: req.estudianteBDD._id.toString() },
    });

    for (const item of carrito.productos) {
      const producto = await Producto.findById(item.producto);
      const orden = new Orden({
        comprador: req.estudianteBDD._id,
        vendedor: producto.vendedor,
        productos: [item],
        total: item.subtotal,
        estado: "pagado",
        metodoPago
      });
      await orden.save();

      producto.stock -= item.cantidad;
      producto.vendidos += item.cantidad;
      if (producto.stock <= 0) {
        producto.estado = "no disponible";
        producto.activo = false;
        await Notificacion.create({
          usuario: producto.vendedor,
          mensaje: `Tu producto "${producto.nombreProducto}" se ha agotado.`,
          tipo: "sistema"
        });
      }
      await producto.save();

      await Notificacion.create({
        usuario: producto.vendedor,
        mensaje: `Has vendido ${item.cantidad} unidad(es) de "${producto.nombreProducto}"`,
        tipo: "venta"
      });
    }

    await Carrito.findByIdAndDelete(carrito._id);
    res.status(200).json({ msg: "Pago procesado correctamente", paymentIntent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error procesando pago", error: error.message });
  }
};

// Cancelar orden individual
export const cancelarOrden = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de orden inválido" });

    const orden = await Orden.findById(id);
    if (!orden) return res.status(404).json({ msg: "Orden no encontrada" });
    if (!orden.comprador.equals(req.estudianteBDD._id)) return res.status(403).json({ msg: "No autorizado para cancelar esta orden" });
    if (orden.estado !== "pendiente") return res.status(400).json({ msg: "Solo se pueden cancelar órdenes pendientes" });

    for (const item of orden.productos) {
      const producto = await Producto.findById(item.producto);
      if (!producto) continue;

      producto.stock += item.cantidad;
      if (producto.stock > 0) {
        producto.estado = "disponible";
        producto.activo = true;
      }
      await producto.save();

      await Notificacion.create({
        usuario: producto.vendedor,
        mensaje: `Se liberó el stock de "${producto.nombreProducto}" por cancelación manual de orden.`,
        tipo: "sistema"
      });
    }

    orden.estado = "cancelado";
    await orden.save();

    await Notificacion.create({
      usuario: orden.comprador,
      mensaje: `Tu orden con ID ${orden._id} ha sido cancelada.`,
      tipo: "sistema"
    });

    res.status(200).json({ msg: "Orden cancelada correctamente", orden });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error cancelando orden", error: error.message });
  }
};

// Cancelar órdenes pendientes vencidas
export const cancelarOrdenesVencidas = async () => {
  try {
    const ahora = new Date();
    const hace12Horas = new Date(ahora.getTime() - 12 * 60 * 60 * 1000);

    const ordenesPendientes = await Orden.find({ estado: "pendiente", createdAt: { $lte: hace12Horas } });

    for (const orden of ordenesPendientes) {
      for (const item of orden.productos) {
        const producto = await Producto.findById(item.producto);
        if (!producto) continue;

        producto.stock += item.cantidad;
        if (producto.stock > 0) {
          producto.estado = "disponible";
          producto.activo = true;
        }
        await producto.save();

        await Notificacion.create({
          usuario: producto.vendedor,
          mensaje: `Se liberó el stock de "${producto.nombreProducto}" por vencimiento de orden.`,
          tipo: "sistema"
        });
      }

      orden.estado = "cancelado";
      await orden.save();

      await Notificacion.create({
        usuario: orden.comprador,
        mensaje: `Tu orden con ID ${orden._id} fue cancelada por no completarse en 12 horas.`,
        tipo: "sistema"
      });
    }

    console.log(`Órdenes vencidas canceladas: ${ordenesPendientes.length}`);
  } catch (error) {
    console.error("Error cancelando órdenes vencidas:", error);
  }
};

// Visualizar historial de pagos
export const visualizarHistorialPagos = async (req, res) => {
  try {
    const historial = await Orden.find({ comprador: req.estudianteBDD._id })
      .populate('productos.producto', 'nombreProducto precio imagen')
      .sort({ createdAt: -1 });

    res.status(200).json(historial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo historial de pagos", error: error.message });
  }
};
