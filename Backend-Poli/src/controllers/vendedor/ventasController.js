import Orden from "../../models/Orden.js";
import mongoose from "mongoose";
import Notificacion from "../../models/Notificacion.js";
import { crearNotificacionSocket } from "../../utils/notificaciones.js";

// Visualizar historial de ventas del vendedor
export const visualizarHistorialVentasVendedor = async (req, res) => {
  try {
    const historial = await Orden.find({ vendedor: req.estudianteBDD._id })
      .populate("comprador", "nombre email telefono")
      .populate("producto", "nombreProducto precio imagen estado")
      .populate("metodoPagoVendedor", "tipo banco numeroCuenta lugares") 
      .sort({ createdAt: -1 });

    if (!historial.length) {
      return res.status(404).json({ msg: "No tienes ventas registradas" });
    }

    res.status(200).json(historial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo historial de ventas", error: error.message });
  }
};


// Confirmar pago de una venta
export const confirmarPagoVenta = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orden = await Orden.findOne({
      _id: req.params.id,
      vendedor: req.estudianteBDD._id
    });

    if (!orden) {
      return res.status(404).json({ msg: 'Orden no encontrada' });
    }

    if(orden.estado === "pago_confirmado_vendedor"){
      return res.status(400).json({ msg: 'El pago ya ha sido confirmado previamente' });
    }
    if (orden.estado !== 'comprobante_subido') {
      return res.status(400).json({ msg: 'La orden no tiene comprobante subido' });
    }

    orden.estado = 'pago_confirmado_vendedor';
    orden.confirmadoPagoVendedor = true;
    orden.fechaPagoConfirmado = new Date();
    
    await orden.save({ session });

    // Notificar al comprador con Socket.IO
    await crearNotificacionSocket(req, orden.comprador, `El vendedor ha confirmado tu pago para la orden ${orden._id}`, "venta");

    await session.commitTransaction();
    res.json({ msg: 'Pago confirmado correctamente', orden });

  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({ msg: 'Error confirmando pago', error: error.message });
  } finally {
    session.endSession();
  }
};
