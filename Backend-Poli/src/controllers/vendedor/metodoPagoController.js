import MetodoPagoVendedor from "../../models/MetodoPagoVendedor.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs-extra';

export const crearActualizarMetodoPago = async (req, res) => {
  try {
    const { tipo, banco, numeroCuenta, titular, cedula, lugarRetiro } = req.body;

    if (!["transferencia", "qr", "efectivo"].includes(tipo)) {
      return res.status(400).json({ msg: "Tipo de pago inválido" });
    }

    let imagenUrl, imagenId;
    if (tipo === "qr" && req.files?.comprobante) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.comprobante.tempFilePath,
        { folder: 'MetodosPagoQR' }
      );
      imagenUrl = secure_url;
      imagenId = public_id;
      await fs.unlink(req.files.comprobante.tempFilePath);
    }

    let metodo = await MetodoPagoVendedor.findOne({ vendedor: req.estudianteBDD._id, tipo });

    if (!metodo) {
      metodo = new MetodoPagoVendedor({ vendedor: req.estudianteBDD._id, tipo });
    }

    if (tipo === "transferencia") {
      if (!banco || !numeroCuenta || !titular || !cedula) {
        return res.status(400).json({ msg: "Faltan datos para transferencia bancaria" });
      }
      metodo.banco = banco;
      metodo.numeroCuenta = numeroCuenta;
      metodo.titular = titular;
      metodo.cedula = cedula;

      metodo.lugarRetiro = undefined;
      metodo.imagenComprobante = undefined;
      metodo.imagenID = undefined;

    } else if (tipo === "qr") {
      if (!imagenUrl) return res.status(400).json({ msg: "Se requiere subir el QR" });
      metodo.imagenComprobante = imagenUrl;
      metodo.imagenID = imagenId;

      metodo.banco = undefined;
      metodo.numeroCuenta = undefined;
      metodo.titular = undefined;
      metodo.cedula = undefined;
      metodo.lugarRetiro = undefined;

    } else if (tipo === "efectivo") {
      if (!lugarRetiro || !Array.isArray(lugarRetiro) || lugarRetiro.length === 0) {
        return res.status(400).json({ msg: "Debe enviar al menos un lugar de retiro" });
      }
      metodo.lugarRetiro = lugarRetiro;

      metodo.banco = undefined;
      metodo.numeroCuenta = undefined;
      metodo.titular = undefined;
      metodo.cedula = undefined;
      metodo.imagenComprobante = undefined;
      metodo.imagenID = undefined;
    }

    await metodo.save();

    res.status(200).json({ msg: "Método de pago actualizado correctamente", metodo });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creando/actualizando método de pago", error: error.message });
  }
};
