import mongoose from "mongoose";
import Conversacion from '../models/Conversacion.js';
import Estudiante from "../models/Estudiante.js";
import Notificacion from "../models/Notificacion.js";

const buscarEstudiantePorNombre = async (req, res) => {
    try {
        const { nombre, apellido } = req.query;

        if (!nombre && !apellido) {
            return res.status(400).json({ msg: "Debe proporcionar al menos un nombre o apellido" });
        }

        const condiciones = [];

        if (nombre) {
            condiciones.push({ nombre: { $regex: nombre, $options: 'i' } });
        }
        if (apellido) {
            condiciones.push({ apellido: { $regex: apellido, $options: 'i' } });
        }

        const estudiantes = await Estudiante.find({
            $or: condiciones,
            rol: { $ne: 'admin' },
        }).select('nombre apellido rol')
        if (!estudiantes || estudiantes.length === 0) {
            return res.status(404).json({ msg: "No se encontraron estudiantes con esos datos" });
        }

        return res.status(200).json(estudiantes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Error interno del servidor" });
    }
};


const listarNotificaciones = async (req, res) => {
    try {
        const usuarioId = req.estudianteBDD._id;
        const notificaciones = await Notificacion.find({ usuario: usuarioId })
            .populate('usuario', 'nombre apellido telefono rol')
            .sort({ createdAt: -1 });

        if (!notificaciones.length) {
            return res.status(404).json({ msg: 'No tienes notificaciones' });
        }
        res.status(200).json(notificaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const marcarNotificacionLeida = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'ID de notificación inválido' });
        }

        const notificacion = await Notificacion.findById(id);
        if (!notificacion) {
            return res.status(404).json({ msg: "Notificación no encontrada" });
        }

        if (notificacion.usuario.toString() !== req.estudianteBDD._id.toString()) {
            return res.status(403).json({ msg: 'No autorizado' });
        }

        notificacion.leido = true;
        await notificacion.save();

        res.status(200).json({ msg: 'Notificación marcada como leída' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const eliminarNotificacion = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'ID de notificación inválido' });
        }

        const notificacion = await Notificacion.findById(id);
        if (!notificacion) {
            return res.status(404).json({ msg: 'Notificación no encontrada' });
        }

        // Verificar que la notificación pertenezca al usuario actual
        if (notificacion.usuario.toString() !== req.estudianteBDD._id.toString()) {
            return res.status(403).json({ msg: 'No autorizado' });
        }

        await notificacion.deleteOne();

        res.status(200).json({ msg: 'Notificación eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const obtenerConversacionesRecientes = async (req, res) => {
    const userId = req.estudianteBDD._id;

    try {
        const conversaciones = await Conversacion.find({ miembros: userId })
            .populate('miembros', 'nombre apellido rol') 
            .lean();

        const conversacionesFormateadas = conversaciones.map(conv => {
            const mensajesOrdenados = conv.mensajes.sort(
                (a, b) => new Date(b.fecha || b.createdAt) - new Date(a.fecha || a.createdAt)
            );

            const ultimoMensaje = mensajesOrdenados[0] || null;

            // Filtrar el usuario actual para obtener el otro
            const otroMiembro = conv.miembros.find(m => m._id.toString() !== userId.toString());

            return {
                conversacionId: conv._id,
                otroMiembro,         // objeto completo con nombre, apellido, avatar...
                ultimoMensaje,
            };
        });

        conversacionesFormateadas.sort((a, b) => {
            const fechaA = new Date(a.ultimoMensaje?.fecha || a.ultimoMensaje?.createdAt || 0);
            const fechaB = new Date(b.ultimoMensaje?.fecha || b.ultimoMensaje?.createdAt || 0);
            return fechaB - fechaA;
        });

        res.json(conversacionesFormateadas);
    } catch (error) {
        console.error('Error al obtener conversaciones recientes:', error);
        res.status(500).json({ error: 'Error interno' });
    }
};




export {
    buscarEstudiantePorNombre,
    listarNotificaciones,
    marcarNotificacionLeida,
    eliminarNotificacion,
    obtenerConversacionesRecientes

}
