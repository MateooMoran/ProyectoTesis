import Conversacion from "../../models/Conversacion.js";

// Obtener conversaciones recientes del usuario
export const obtenerConversacionesRecientes = async (req, res) => {
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
            const otroMiembro = conv.miembros.find(m => m._id.toString() !== userId.toString());

            const lectura = conv.lecturas.find(l => l.usuario.toString() === userId.toString());
            const ultimaLectura = lectura ? lectura.ultimaLectura : null;

            return {
                conversacionId: conv._id,
                otroMiembro,
                ultimoMensaje,
                ultimaLectura,
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

// Actualizar la lectura de una conversación
export const conversacionLectura = async (req, res) => {
    const usuarioId = req.estudianteBDD._id;
    const conversacionId = req.params.id;

    try {
        const conversacion = await Conversacion.findById(conversacionId);
        if (!conversacion) return res.status(404).json({ message: "Conversación no encontrada" });

        const ahora = new Date();
        const lecturaIndex = conversacion.lecturas.findIndex(
            (l) => l.usuario.toString() === usuarioId.toString()
        );

        if (lecturaIndex >= 0) {
            conversacion.lecturas[lecturaIndex].ultimaLectura = ahora;
        } else {
            conversacion.lecturas.push({ usuario: usuarioId, ultimaLectura: ahora });
        }

        await conversacion.save();
        res.json({ message: "Lectura actualizada correctamente" });
    } catch (error) {
        console.error("Error actualizando lectura:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
