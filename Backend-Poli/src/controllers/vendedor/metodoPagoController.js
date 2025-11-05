import MetodoPagoVendedor from "../../models/MetodoPagoVendedor.js";
import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from "fs";
import mongoose from "mongoose";

//  Función auxiliar
const crearOActualizarMetodo = async (vendedorId, tipo, data) => {
  tipo = tipo.toLowerCase();
  let metodo = await MetodoPagoVendedor.findOne({ vendedor: vendedorId, tipo });

  if (!metodo) {
    metodo = new MetodoPagoVendedor({ vendedor: vendedorId, tipo });
  }

  Object.assign(metodo, data);
  await metodo.save();

  return metodo;
};

// CREAR / ACTUALIZAR TRANSFERENCIA
export const crearActualizarTransferencia = async (req, res) => {
  try {
    const { banco, numeroCuenta, titular, cedula } = req.body;
    if (!banco || !numeroCuenta || !titular || !cedula) {
      return res.status(400).json({ msg: "Faltan datos para transferencia bancaria" });
    }

    const metodo = await crearOActualizarMetodo(req.estudianteBDD._id, "transferencia", {
      banco, numeroCuenta, titular, cedula
    });

    res.status(200).json({ msg: "Método de pago por transferencia actualizado", metodo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creando/actualizando método de transferencia", error: error.message });
  }
};

// CREAR / ACTUALIZAR QR
export const crearActualizarQR = async (req, res) => {
  try {
    if (!req.files?.comprobante) {
      return res.status(400).json({ msg: "Se requiere subir el QR" });
    }

    const file = req.files.comprobante;
    if (!file.mimetype.startsWith("image/")) {
      if (file.tempFilePath) await fs.unlink(file.tempFilePath);
      return res.status(400).json({ msg: "Solo se permiten archivos de imagen" });
    }

    // Subir a Cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "MetodosPagoQR",
    });

    if (file.tempFilePath) await fs.unlink(file.tempFilePath);

    const metodo = await crearOActualizarMetodo(req.estudianteBDD._id, "qr", {
      imagenComprobante: secure_url,
      imagenID: public_id,
    });

    res.status(200).json({ msg: "Método de pago tipo QR actualizado", metodo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creando/actualizando método QR", error: error.message });
  }
};

// CREAR / ACTUALIZAR LUGAR DE RETIRO
export const crearActualizarLugarRetiro = async (req, res) => {
  try {
    const { lugares } = req.body;

    const metodo = await crearOActualizarMetodo(req.estudianteBDD._id, "retiro", { lugares });

    res.status(200).json({ msg: "Lugares de retiro actualizados", metodo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creando/actualizando lugares de retiro", error: error.message });
  }
};

export const visualizarMetodosPago = async (req, res) => {
  try {
    let { tipo } = req.params; 

    if (!req.estudianteBDD) {
      return res.status(401).json({ msg: "No autenticado" });
    }

    let idBusqueda = null;

    if (req.estudianteBDD.rol === "vendedor") {
      idBusqueda = req.estudianteBDD._id;
    } else if (req.estudianteBDD.rol === "estudiante") {
      const { vendedorId } = req.query;
      if (!vendedorId)
        return res.status(400).json({ msg: "Falta vendedorId" });
      if (!mongoose.Types.ObjectId.isValid(vendedorId))
        return res.status(400).json({ msg: "vendedorId inválido" });
      idBusqueda = vendedorId;
    }

    let filtro = { vendedor: idBusqueda };
    if (tipo) {
      tipo = tipo.toLowerCase();
      filtro.tipo = tipo;
    }

    const metodos = await MetodoPagoVendedor.find(filtro)
      .select("-vendedor -createdAt -updatedAt -__v");

    if (metodos.length === 0)
      return res.status(404).json({ msg: "No se encontraron métodos de pago" });

    res.json({ metodos });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};


// ELIMINAR MÉTODO
export const eliminarMetodoPago = async (req, res) => {
  try {
    const metodoPago = await MetodoPagoVendedor.findOneAndDelete({
      _id: req.params.id,
      vendedor: req.estudianteBDD._id,
    });

    if (!metodoPago) {
      return res.status(404).json({ msg: "Método de pago no encontrado" });
    }

    // Elimina imagen de Cloudinary si aplica
    if (metodoPago.imagenID) {
      await cloudinary.uploader.destroy(metodoPago.imagenID);
    }

    res.json({ msg: "Método eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar método de pago"});
  }
};
