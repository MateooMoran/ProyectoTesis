import mongoose from "mongoose";
import Notificacion from "../../models/Notificacion.js";

//  Listar notificaciones del usuario
export const listarNotificaciones = async (req, res) => {
  try {
    const usuarioId = req.estudianteBDD._id;

    const notificaciones = await Notificacion.find({ usuario: usuarioId })
      .select("-__v") 
      .populate("usuario", "nombre apellido telefono rol")
      .sort({ createdAt: -1 });


    res.status(200).json({ data: notificaciones });
  } catch (error) {
    console.error(" Error al listar notificaciones:", error);
    res.status(500).json({ msg: "Error interno al listar notificaciones" });
  }
};

//  Marcar notificación como leída
export const marcarNotificacionLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.estudianteBDD._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID inválido" });
    }

    const notificacion = await Notificacion.findOne({ _id: id, usuario: usuarioId });
    if (!notificacion) {
      return res.status(404).json({ msg: "Notificación no encontrada o no te pertenece" });
    }

    if (notificacion.leido) {
      return res.status(200).json({ msg: "La notificación ya estaba marcada como leída" });
    }

    notificacion.leido = true;
    await notificacion.save();

    res.status(200).json({ msg: "Notificación marcada como leída" });
  } catch (error) {
    console.error(" Error al marcar como leída:", error);
    res.status(500).json({ msg: "Error del servidor de notificaciones" });
  }
};

//  Eliminar una notificación específica
export const eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.estudianteBDD._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID inválido" });
    }

    const notificacion = await Notificacion.findOneAndDelete({ _id: id, usuario: usuarioId });

    if (!notificacion) {
      return res.status(404).json({ msg: "Notificación no encontrada o no te pertenece" });
    }

    res.status(200).json({ msg: "Notificación eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    res.status(500).json({ msg: "Error del servidor de notificaciones" });
  }
};

// Eliminar todas las notificaciones del usuario
export const eliminarTodasNotificaciones = async (req, res) => {
  try {
    const usuarioId = req.estudianteBDD._id;
    const resultado = await Notificacion.deleteMany({ usuario: usuarioId });

    res.status(200).json({
      msg: `Se eliminaron ${resultado.deletedCount} notificaciones`
    });
  } catch (error) {
    console.error("Error al eliminar todas las notificaciones:", error);
    res.status(500).json({ msg: "Error del servidor de notificaciones" });
  }
};

// Marcar todas las notificaciones del usuario como leídas
export const marcarTodasNotificaciones = async (req, res) => {
  try {
    const usuarioId = req.estudianteBDD._id;

    const resultado = await Notificacion.updateMany(
      { usuario: usuarioId, leido: false },
      { $set: { leido: true } }
    );

    res.status(200).json({
      msg: `Se marcaron ${resultado.modifiedCount || resultado.nModified || 0} notificaciones como leídas`,
      modifiedCount: resultado.modifiedCount || resultado.nModified || 0
    });
  } catch (error) {
    console.error("Error marcando todas las notificaciones:", error);
    res.status(500).json({ msg: "Error del servidor de notificaciones" });
  }
};
