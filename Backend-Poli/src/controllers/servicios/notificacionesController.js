import mongoose from "mongoose";
import Notificacion from "../../models/Notificacion.js";

// Listar notificaciones del usuario
export const listarNotificaciones = async (req, res) => {
    try {
        const usuarioId = req.estudianteBDD._id;
        const notificaciones = await Notificacion.find({ usuario: usuarioId })
            .populate('usuario', 'nombre apellido telefono rol')
            .sort({ createdAt: -1 });

        res.status(200).json(notificaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error interno al listar notificaciones" });
    }
};

// Marcar notificación como leída
export const marcarNotificacionLeida = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'ID inválido' });

        const notificacion = await Notificacion.findById(id);
        if (!notificacion) return res.status(404).json({ msg: "Notificación no encontrada" });
        if (notificacion.usuario.toString() !== req.estudianteBDD._id.toString()) return res.status(403).json({ msg: 'No autorizado' });

        notificacion.leido = true;
        await notificacion.save();

        res.status(200).json({ msg: 'Notificación marcada como leída' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

// Eliminar notificación
export const eliminarNotificacion = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'ID inválido' });

        const notificacion = await Notificacion.findById(id);
        if (!notificacion) return res.status(404).json({ msg: 'Notificación no encontrada' });
        if (notificacion.usuario.toString() !== req.estudianteBDD._id.toString()) return res.status(403).json({ msg: 'No autorizado' });

        await notificacion.deleteOne();
        res.status(200).json({ msg: 'Notificación eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};
