import MetodoPagoVendedor from "../../models/MetodoPagoVendedor.js";
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from "fs";

// Función auxiliar para crear o actualizar método de pago
const crearOActualizarMetodo = async (vendedorId, tipo, data) => {
  let metodo = await MetodoPagoVendedor.findOne({ vendedor: vendedorId, tipo });

  if (!metodo) {
    metodo = new MetodoPagoVendedor({ vendedor: vendedorId, tipo });
  }

  metodo.banco = data.banco || undefined;
  metodo.numeroCuenta = data.numeroCuenta || undefined;
  metodo.titular = data.titular || undefined;
  metodo.cedula = data.cedula || undefined;
  metodo.lugarRetiro = data.lugarRetiro || undefined;
  metodo.imagenComprobante = data.imagenComprobante || undefined;
  metodo.imagenID = data.imagenID || undefined;

  await metodo.save();
  return metodo;
};

export const crearActualizarTransferencia = async (req, res) => {
  try {
    const { banco, numeroCuenta, titular, cedula } = req.body;
    if (!banco || !numeroCuenta || !titular || !cedula) {
      return res.status(400).json({ msg: "Faltan datos para transferencia bancaria" });
    }

    const metodo = await crearOActualizarMetodo(req.estudianteBDD._id, "transferencia", { banco, numeroCuenta, titular, cedula });

    res.status(200).json({ msg: "Método de pago por transferencia actualizado", metodo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creando/actualizando método de transferencia", error: error.message });
  }
};

//  CREAR / ACTUALIZAR QR
export const crearActualizarQR = async (req, res) => {
  try {
    if (!req.files?.comprobante) {
      return res.status(400).json({ msg: "Se requiere subir el QR" });
    }

    const file = req.files.comprobante;

    if (!file.mimetype.startsWith("image/")) {
      if (file.tempFilePath) await fs.unlink(file.tempFilePath); // Borra si existe
      return res.status(400).json({ msg: "Solo se permiten archivos de imagen" });
    }

    // Sube a Cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "MetodosPagoQR",
    });

    // Borra el archivo temporal después de subirlo
    if (file.tempFilePath) await fs.unlink(file.tempFilePath);

    // Crea o actualiza método de pago
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
// CREAR / ACTUALIZAR efectivo 
export const crearActualizarEfectivo = async (req, res) => {
  try {
    const { lugarRetiro } = req.body;
    if (!lugarRetiro || !Array.isArray(lugarRetiro) || lugarRetiro.length === 0) {
      return res.status(400).json({ msg: "Debe enviar al menos un lugar de retiro" });
    }

    const metodo = await crearOActualizarMetodo(req.estudianteBDD._id, "efectivo", { lugarRetiro });

    res.status(200).json({ msg: "Método de pago en efectivo actualizado", metodo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creando/actualizando método efectivo", error: error.message });
  }
};


export const visualizarMetodosPago = async (req, res) => {
  try {
    const { tipo } = req.params;

    if (!req.estudianteBDD) {
      return res.status(401).json({ msg: "No autenticado" });
    }

    let idBusqueda = null;

    if (req.estudianteBDD.rol === 'vendedor') {
      idBusqueda = req.estudianteBDD._id;
    }
    else if (req.estudianteBDD.rol === 'estudiante') {
      const vendedorId = req.query.vendedorId;
      if (!vendedorId) {
        return res.status(400).json({ msg: "Falta vendedorId" });
      }
      if (!mongoose.Types.ObjectId.isValid(vendedorId)) {
        return res.status(400).json({ msg: "vendedorId inválido" });
      }
      idBusqueda = vendedorId;
    }

    const metodos = await MetodoPagoVendedor.find({
      vendedor: idBusqueda,
      tipo
    }).select('-vendedor -createdAt -updatedAt -__v');

    if (metodos.length === 0) {
      return res.status(404).json({ msg: `No hay métodos ${tipo}` });
    }

    res.json({ metodos });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};