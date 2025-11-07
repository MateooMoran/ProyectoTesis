import Orden from "../../models/Orden.js";
import Producto from "../../models/Producto.js";
import MetodoPagoVendedor from "../../models/MetodoPagoVendedor.js";
import Notificacion from "../../models/Notificacion.js";
import Stripe from 'stripe';
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper para crear notificaciones con Socket.IO
const crearNotificacion = async (usuario, mensaje, tipo, req) => {
  try {
    const notificacion = await Notificacion.create({ usuario, mensaje, tipo });
    
    const io = req?.app?.get('io');
    if (io) {
      io.to(`user-${usuario}`).emit('notificacion:nueva', notificacion);
      console.log(`🔔 Notificación emitida a usuario: ${usuario}`);
    }
    
    return notificacion;
  } catch (error) {
    console.error('Error creando notificación:', error);
  }
};

// Crear orden 
export const crearOrden = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productoId, cantidad, metodoPagoVendedorId, lugarRetiro } = req.body;

    // Validar producto y stock
    const producto = await Producto.findById(productoId).session(session);
    if (!producto) {
      await session.abortTransaction();
      return res.status(404).json({ msg: "Producto no encontrado" });
    }
    if (producto.stock < cantidad) {
      await session.abortTransaction();
      return res.status(400).json({ msg: `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles` });
    }
    if (!producto.activo || producto.estado !== "disponible") {
      await session.abortTransaction();
      return res.status(400).json({ msg: "Producto no disponible para compra" });
    }

    // Validar método de pago del vendedor
    const metodoPago = await MetodoPagoVendedor.findOne({
      _id: metodoPagoVendedorId,
      vendedor: producto.vendedor
    }).session(session);

    if (!metodoPago) {
      await session.abortTransaction();
      return res.status(400).json({ msg: "Método de pago inválido para este vendedor" });
    }

    if (metodoPago.tipo === "retiro") {
      if (!lugarRetiro) {
        await session.abortTransaction();
        return res.status(400).json({ msg: "Debes seleccionar un lugar de retiro" });
      }

      if (!metodoPago.lugares || !metodoPago.lugares.includes(lugarRetiro)) {
        await session.abortTransaction();
        return res.status(400).json({ msg: "El lugar de retiro seleccionado no es válido" });
      }
    }

    const subtotal = parseFloat((producto.precio * cantidad).toFixed(2));

    const orden = new Orden({
      comprador: req.estudianteBDD._id,
      vendedor: producto.vendedor,
      producto: producto._id,
      cantidad,
      precioUnitario: parseFloat(producto.precio.toFixed(2)),
      subtotal,
      total: subtotal,
      metodoPagoVendedor: metodoPago._id,
      tipoPago: metodoPago.tipo, 
      lugarRetiroSeleccionado: lugarRetiro || null,
      estado: "pendiente_pago"
    });

    await orden.save({ session });


    const mensajeNotificacion = lugarRetiro
      ? `Nueva orden de ${cantidad} unidad(es) de "${producto.nombreProducto}" - Retiro en: ${lugarRetiro}`
      : `Nueva orden de ${cantidad} unidad(es) de "${producto.nombreProducto}"`;

    await crearNotificacion(
      producto.vendedor,
      mensajeNotificacion,
      "venta",
      req
    );

    await session.commitTransaction();
    res.status(201).json({
      msg: "Orden creada exitosamente",
      orden
    });

  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({ msg: "Error creando orden", error: error.message });
  } finally {
    session.endSession();
  }
};

// Subir comprobante de pago
export const subirComprobante = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orden = await Orden.findById(req.params.id).session(session);
    if (!orden) {
      await session.abortTransaction();
      return res.status(404).json({ msg: "Orden no encontrada" });
    }
    if (!orden.comprador.equals(req.estudianteBDD._id)) {
      await session.abortTransaction();
      return res.status(403).json({ msg: "No autorizado" });
    }
    if (orden.estado !== "pendiente_pago") {
      await session.abortTransaction();
      return res.status(400).json({ msg: "La orden no está en estado pendiente de pago" });
    }

    if (!req.files?.comprobante) {
      await session.abortTransaction();
      return res.status(400).json({ msg: "Debe subir un comprobante de pago" });
    }

    const file = req.files.comprobante;
    if (!file.mimetype.startsWith("image/")) {
      if (file.tempFilePath) await fs.unlink(file.tempFilePath);
      await session.abortTransaction();
      return res.status(400).json({ msg: "Solo se permiten archivos de imagen" });
    }

    // Subir comprobante a Cloudinary
    const { secure_url } = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'poli-market/comprobantes_pago'
    });

    // Eliminar archivo temporal después de subir
    if (file.tempFilePath) await fs.unlink(file.tempFilePath);

    orden.comprobantePago = secure_url;
    orden.estado = "comprobante_subido";
    orden.fechaComprobanteSubido = new Date();
    await orden.save({ session });

    // Notificar al vendedor
    await crearNotificacion(
      orden.vendedor,
      `El comprador ha subido el comprobante de pago para la orden ${orden._id}`,
      "venta",
      req
    );

    await session.commitTransaction();
    res.json({ msg: "Comprobante subido correctamente", orden });
  } catch (error) {
    if (req.files?.comprobante?.tempFilePath) {
      await fs.unlink(req.files.comprobante.tempFilePath);
    }
    await session.abortTransaction();
    res.status(500).json({ msg: "Error subiendo comprobante", error: error.message });
  } finally {
    session.endSession();
  }
};



// Procesar pago con tarjeta
export const procesarPagoTarjeta = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentMethodId, ordenId, productoId, cantidad, metodoPagoVendedorId, lugarRetiro } = req.body;

    let orden;

    if (!ordenId) {
      if (!productoId || !cantidad) {
        return res.status(400).json({ msg: "Faltan datos para crear la orden (productoId, cantidad)" });
      }

      // Validar producto y stock
      const producto = await Producto.findById(productoId).session(session);
      if (!producto) {
        await session.abortTransaction();
        return res.status(404).json({ msg: "Producto no encontrado" });
      }
      if (producto.stock < cantidad) {
        await session.abortTransaction();
        return res.status(400).json({ msg: `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles` });
      }
      if (!producto.activo || producto.estado !== "disponible") {
        await session.abortTransaction();
        return res.status(400).json({ msg: "Producto no disponible para compra" });
      }

      let metodoPagoId = null;

      if (metodoPagoVendedorId && metodoPagoVendedorId !== "stripe") {
        const metodoPago = await MetodoPagoVendedor.findOne({
          _id: metodoPagoVendedorId,
          vendedor: producto.vendedor
        }).session(session);

        if (!metodoPago) {
          await session.abortTransaction();
          return res.status(400).json({ msg: "Método de pago inválido para este vendedor" });
        }

        if (metodoPago.tipo === "retiro") {
          if (!lugarRetiro) {
            await session.abortTransaction();
            return res.status(400).json({ msg: "Debes seleccionar un lugar de retiro" });
          }
          if (!metodoPago.lugares || !metodoPago.lugares.includes(lugarRetiro)) {
            await session.abortTransaction();
            return res.status(400).json({ msg: "El lugar de retiro seleccionado no es válido" });
          }
        }

        metodoPagoId = metodoPago._id;
      }

      const subtotal = parseFloat((producto.precio * cantidad).toFixed(2));

      // Crear la orden
      orden = new Orden({
        comprador: req.estudianteBDD._id,
        vendedor: producto.vendedor,
        producto: producto._id,
        cantidad,
        precioUnitario: parseFloat(producto.precio.toFixed(2)),
        subtotal,
        total: subtotal,
        metodoPagoVendedor: metodoPagoId,
        tipoPago: "tarjeta", 
        lugarRetiroSeleccionado: lugarRetiro || null,
        estado: "pendiente_pago"
      });

      await orden.save({ session });

    } else {
      // Si ya existe la orden se busca
      orden = await Orden.findById(ordenId).session(session);
      if (!orden) {
        await session.abortTransaction();
        return res.status(404).json({ msg: "Orden no encontrada" });
      }
      if (!orden.comprador.equals(req.estudianteBDD._id)) {
        await session.abortTransaction();
        return res.status(403).json({ msg: "No autorizado" });
      }
      if (orden.estado !== "pendiente_pago") {
        await session.abortTransaction();
        return res.status(400).json({ msg: "La orden no está en estado pendiente de pago" });
      }
    }

    // Crear pago con Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(orden.total * 100),
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: {
        ordenId: orden._id.toString(),
        comprador: req.estudianteBDD._id.toString()
      },
    });

    orden.estado = "pago_confirmado_vendedor";
    orden.confirmadoPagoVendedor = true;
    orden.fechaPagoConfirmado = new Date();
    await orden.save({ session });

    // Notificar al vendedor
    await crearNotificacion(
      orden.vendedor,
      `Se ha procesado un pago con tarjeta para la orden ${orden._id}`,
      "venta",
      req
    );

    await session.commitTransaction();
    res.json({
      msg: "Pago con tarjeta procesado correctamente",
      orden,
      paymentIntent
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ msg: "Error procesando pago con tarjeta", error: error.message });
  } finally {
    session.endSession();
  }
};



// Confirmar entrega por comprador
export const confirmarEntrega = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orden = await Orden.findById(req.params.id).session(session);
    if (!orden) {
      await session.abortTransaction();
      return res.status(404).json({ msg: "Orden no encontrada" });
    }
    if (!orden.comprador.equals(req.estudianteBDD._id)) {
      await session.abortTransaction();
      return res.status(403).json({ msg: "No autorizado" });
    }
    if (orden.estado !== "pago_confirmado_vendedor") {
      await session.abortTransaction();
      return res.status(400).json({ msg: "El vendedor aún no ha confirmado el pago" });
    }

    orden.estado = "completada";
    orden.confirmadoEntregaComprador = true;
    orden.fechaCompletada = new Date();
    await orden.save({ session });

    // Actualizar stock Y vendidos del producto
    const producto = await Producto.findById(orden.producto).session(session);
    if (producto) {
      const nuevoStock = Math.max(0, producto.stock - orden.cantidad);
      const nuevosVendidos = producto.vendidos + orden.cantidad;

      producto.stock = nuevoStock;
      producto.vendidos = nuevosVendidos;

      if (producto.stock <= 0) {
        producto.estado = "no disponible";
        producto.activo = false;
        await crearNotificacion(
          producto.vendedor,
          `Tu producto "${producto.nombreProducto}" se ha agotado.`,
          "sistema",
          req
        );
      }
      await producto.save({ session });
    }

    // Notificar al vendedor
    await crearNotificacion(
      orden.vendedor,
      `El comprador ha confirmado la entrega de la orden ${orden._id}`,
      "venta",
      req
    );

    await session.commitTransaction();
    res.json({ msg: "Entrega confirmada correctamente", orden });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ msg: "Error confirmando entrega", error: error.message });
  } finally {
    session.endSession();
  }
};

// Cancelar orden
export const cancelarOrden = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orden = await Orden.findById(req.params.id).session(session);
    if (!orden) {
      await session.abortTransaction();
      return res.status(404).json({ msg: "Orden no encontrada" });
    }

    if (!orden.comprador.equals(req.estudianteBDD._id)) {
      await session.abortTransaction();
      return res.status(403).json({ msg: "No autorizado" });
    }

    if (orden.estado !== "pendiente_pago") {
      await session.abortTransaction();
      return res.status(400).json({ msg: "Solo se pueden cancelar órdenes en estado pendiente de pago" });
    }

    const canceladas = await Orden.countDocuments({
      comprador: req.estudianteBDD._id,
      estado: "cancelada"
    });

    if (canceladas >= 2) {
      await session.abortTransaction();
      return res.status(400).json({ msg: "Has alcanzado el límite de 2 órdenes canceladas" });
    }

    // Cancelar la orden
    orden.estado = "cancelada";
    await orden.save({ session });

    // Notificar al vendedor
    await crearNotificacion(
      orden.vendedor,
      `El comprador ha cancelado la orden ${orden._id}`,
      "venta",
      req
    );

    await session.commitTransaction();
    res.json({ msg: "Orden cancelada correctamente", orden });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ msg: "Error cancelando orden", error: error.message });
  } finally {
    session.endSession();
  }
};

// Ver ordenes del estudiante
export const verOrdenes = async (req, res) => {
  try {
    if (!req.estudianteBDD || !req.estudianteBDD._id) {
      return res.status(401).json({ msg: "Usuario no autenticado" });
    }

    const ordenes = await Orden.find({ comprador: req.estudianteBDD._id })
      .populate({
        path: "producto",
        select: "nombreProducto precio stock descripcion categoria estado activo vendidos imagen",
      })
      .populate({
        path: "metodoPagoVendedor",
        select: "tipo banco numeroCuenta titular",
      })
      .populate({
        path: "comprador",
        select: "nombre apellido email",
      })
      .populate({
        path: "vendedor",
        select: "nombre apellido email",
      })
      .lean();

    res.status(200).json(ordenes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo órdenes", error: error.message });
  }
};
