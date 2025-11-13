import QuejasSugerencias from "../../models/QuejasSugerencias.js";
import Estudiante from "../../models/Estudiante.js";
import Notificacion from "../../models/Notificacion.js";
import { crearNotificacionSocket } from "../../utils/notificaciones.js";
import mongoose from "mongoose";

// Crear queja o sugerencia
export const crearQuejasSugerencias = async (req, res) => {
  try {
    let  { tipo, mensaje } = req.body;
    tipo = tipo?.trim().toLowerCase();

    const nueva = new QuejasSugerencias({ tipo, mensaje, usuario: req.estudianteBDD._id });

    await nueva.save();
    // Notificación al usuario con Socket.IO
    await crearNotificacionSocket(req, req.estudianteBDD._id, `Tu ${tipo} ha sido registrada correctamente`, "sistema");

    const admin = await Estudiante.findOne({ rol: "admin" });
    if (admin) {
      await crearNotificacionSocket(req, admin._id, `Nuevo mensaje recibido del tipo (${tipo.toUpperCase()}) del usuario: ${req.estudianteBDD.nombre} ${req.estudianteBDD.apellido}`, "sistema");
    }


    res.status(200).json({ msg: 'Queja o sugerencia enviada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error interno del servidor al crear la queja/sugerencia' });
  }
};

// Visualizar quejas y sugerencias del usuario
export const visualizarQuejasSugerencias = async (req, res) => {
  try {
    const datos = await QuejasSugerencias.find({ usuario: req.estudianteBDD._id })
      .populate("usuario", "nombre apellido telefono rol");

    if (!datos.length) return res.status(404).json({ msg: "No se encontraron registros" });
    res.status(200).json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo quejas/sugerencias" });
  }
};

// Eliminar queja o sugerencia
export const eliminarQuejaSugerencia = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID inválido" });

    const queja = await QuejasSugerencias.findOne({_id: id, usuario: req.estudianteBDD._id});

    if (!queja) {
      return res.status(404).json({ msg: "Queja/Sugerencia no encontrada o no autorizada" });
    }

    if (queja.estado === "resuelto") {
      return res.status(400).json({ msg: "No se puede eliminar una queja/sugerencia ya resuelta" });
    }

    await queja.deleteOne();
    res.status(200).json({ msg: "Queja/Sugerencia eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error eliminando queja/sugerencia" });
  }
};
