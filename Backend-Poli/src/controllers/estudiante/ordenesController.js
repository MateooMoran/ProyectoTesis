import Orden from "../../models/Orden.js";
import Carrito from "../../models/Carrito.js";
import Producto from "../../models/Producto.js";
import Notificacion from "../../models/Notificacion.js";
import Stripe from 'stripe';
import mongoose from "mongoose";
import { sendMailOrdenCompra } from "../../config/nodemailer.js";
import { generarYEnviarRecomendaciones } from "./recomendacionesController.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Verificar Stock
const verificarStock = async (productos) => {
  for (const item of productos) {
    const producto = await Producto.findById(item.producto);
    if (!producto || producto.stock < item.cantidad) {
      throw new Error(`Stock insuficiente para ${producto?.nombreProducto || "producto no disponible"}`);
    }
  }
};

// Para crear notificaciones
const crearNotificacion = async (usuario, mensaje, tipo) => {
  await Notificacion.create({ usuario, mensaje, tipo });
};

export const crearOrdenPendiente = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { metodoPago } = req.body;
    if (!["efectivo", "transferencia"].includes(metodoPago)) {
      return res.status(400).json({ msg: "Método de pago inválido para orden pendiente" });
    }

    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });
    if (!carrito || carrito.productos.length === 0) {
      return res.status(400).json({ msg: "El carrito está vacío" });
    }

    await verificarStock(carrito.productos);

    for (const item of carrito.productos) {
      const producto = await Producto.findById(item.producto);

      const orden = new Orden({
        comprador: req.estudianteBDD._id,
        vendedor: producto.vendedor,
        productos: [item],
        total: item.subtotal,
        estado: "pendiente",
        metodoPago,
      });

      await orden.save({ session });

      await crearNotificacion(
        producto.vendedor,
        `Tienes una nueva orden pendiente por ${item.cantidad} unidad(es) de "${producto.nombreProducto}"`,
        "venta"
      );
    }

    await Carrito.findByIdAndDelete(carrito._id, { session });
    await session.commitTransaction();
    res.status(200).json({ msg: "Orden creada con estado pendiente, máximo pagar en 12 horas." });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creando orden pendiente:", error);
    res.status(500).json({ msg: "Error creando orden pendiente", error: error.message });
  } finally {
    session.endSession();
  }
};

// Procesar pago con tarjeta
export const procesarPago = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentMethodId, metodoPago = "tarjeta" } = req.body;

    if (metodoPago !== "tarjeta") {
      return res.status(400).json({ msg: "Este endpoint es solo para pagos con tarjeta" });
    }

    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id })
      .populate("productos.producto");

    if (!carrito || carrito.productos.length === 0) {
      return res.status(400).json({ msg: "El carrito está vacío" });
    }

    await verificarStock(carrito.productos);

    const totalReal = carrito.productos.reduce((sum, item) => sum + item.subtotal, 0);

    // Crear pago con Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalReal * 100),
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: { comprador: req.estudianteBDD._id.toString() },
    });

    const productosComprados = [];

    for (const item of carrito.productos) {
      const producto = await Producto.findById(item.producto._id);
      if (!producto) continue;

      // Guardamos la info incluyendo imagen
      productosComprados.push({
        nombreProducto: producto.nombreProducto,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
        imagen: producto.imagen || `${process.env.URL_FRONTEND}/default.jpg`, // fallback
      });

      const orden = new Orden({
        comprador: req.estudianteBDD._id,
        vendedor: producto.vendedor,
        productos: [
          {
            producto: producto._id,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.subtotal,
          },
        ],
        total: item.subtotal,
        estado: "pagado",
        metodoPago,
      });

      await orden.save({ session });

      // Actualizar inventario
      producto.stock -= item.cantidad;
      producto.vendidos += item.cantidad;

      if (producto.stock <= 0) {
        producto.estado = "no disponible";
        producto.activo = false;
        await crearNotificacion(
          producto.vendedor,
          `Tu producto "${producto.nombreProducto}" se ha agotado.`,
          "sistema"
        );
      }

      await producto.save({ session });

      await crearNotificacion(
        producto.vendedor,
        `Has vendido ${item.cantidad} unidad(es) de "${producto.nombreProducto}"`,
        "venta"
      );
    }

    // Eliminar carrito tras pago exitoso
    await Carrito.findByIdAndDelete(carrito._id, { session });

    await session.commitTransaction();

    // Enviar correo de confirmación al comprador
    await sendMailOrdenCompra(req.estudianteBDD.email, req.estudianteBDD.nombre, {
      productos: productosComprados,
      total: Number(totalReal), 
      estado: "pagado",
      metodoPago,
    });

    // Enviar recomendaciones en background
    generarYEnviarRecomendaciones(req.estudianteBDD._id).catch(console.error);

    return res.status(200).json({
      msg: "Pago procesado correctamente",
      paymentIntent,
    });

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Error procesando pago:", error);
    return res.status(500).json({
      msg: "Error procesando pago",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};



// Cancelar orden individual
export const cancelarOrden = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ msg: "ID de orden inválido" });

    const orden = await Orden.findById(id);
    if (!orden) return res.status(404).json({ msg: "Orden no encontrada" });
    if (!orden.comprador.equals(req.estudianteBDD._id))
      return res.status(403).json({ msg: "No autorizado para cancelar esta orden" });
    if (orden.estado !== "pendiente")
      return res.status(400).json({ msg: "Solo se pueden cancelar órdenes pendientes" });

    for (const item of orden.productos) {
      const producto = await Producto.findById(item.producto);
      if (!producto) continue;

      producto.stock += item.cantidad;
      if (producto.stock > 0) {
        producto.estado = "disponible";
        producto.activo = true;
      }
      await producto.save({ session });

      await crearNotificacion(
        producto.vendedor,
        `Se liberó el stock de "${producto.nombreProducto}" por cancelación manual de orden.`,
        "sistema"
      );
    }

    orden.estado = "cancelado";
    await orden.save({ session });

    await crearNotificacion(
      orden.comprador,
      `Tu orden con ID ${orden._id} ha sido cancelada.`,
      "sistema"
    );

    await session.commitTransaction();
    res.status(200).json({ msg: "Orden cancelada correctamente", orden });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error cancelando orden:", error);
    res.status(500).json({ msg: "Error cancelando orden", error: error.message });
  } finally {
    session.endSession();
  }
};

// Cancelar órdenes pendientes vencidas
export const cancelarOrdenesVencidas = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ahora = new Date();
    const hace12Horas = new Date(ahora.getTime() - 12 * 60 * 60 * 1000);

    const ordenesPendientes = await Orden.find({
      estado: "pendiente",
      createdAt: { $lte: hace12Horas },
    });

    for (const orden of ordenesPendientes) {
      for (const item of orden.productos) {
        const producto = await Producto.findById(item.producto);
        if (!producto) continue;

        producto.stock += item.cantidad;
        if (producto.stock > 0) {
          producto.estado = "disponible";
          producto.activo = true;
        }
        await producto.save({ session });

        await crearNotificacion(
          producto.vendedor,
          `Se liberó el stock de "${producto.nombreProducto}" por vencimiento de orden.`,
          "sistema"
        );
      }

      orden.estado = "cancelado";
      await orden.save({ session });

      await crearNotificacion(
        orden.comprador,
        `Tu orden con ID ${orden._id} fue cancelada por no completarse en 12 horas.`,
        "sistema"
      );
    }

    await session.commitTransaction();

    if (res) {
      res.status(200).json({
        msg: `Órdenes vencidas canceladas correctamente: ${ordenesPendientes.length}`,
      });
    } else {
      console.log(`Órdenes vencidas canceladas: ${ordenesPendientes.length}`);
    }
  } catch (error) {
    await session.abortTransaction();
    console.error("Error cancelando órdenes vencidas:", error);
    if (res) {
      res.status(500).json({ msg: "Error cancelando órdenes vencidas", error: error.message });
    }
  } finally {
    session.endSession();
  }
};
// Visualizar historial de pagos
export const visualizarHistorialPagos = async (req, res) => {
  try {
    const historial = await Orden.find({ comprador: req.estudianteBDD._id })
      .populate("productos.producto", "nombreProducto precio imagen")
      .sort({ createdAt: -1 });

    res.status(200).json(historial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo historial de pagos", error: error.message });
  }
};