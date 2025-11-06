import Conversacion from "../../models/Conversacion.js";

// Obtener conversaciones recientes del usuario
export const obtenerConversacionesRecientes = async (req, res) => {
    const userId = req.estudianteBDD._id;

    try {
        // Filtrar conversaciones que NO han sido ocultadas por el usuario
        const conversaciones = await Conversacion.find({ 
            miembros: userId,
            ocultadaPor: { $ne: userId } // Excluir conversaciones ocultadas por este usuario
        })
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

export const eliminarConversacion = async (req, res) => {
    const conversacionId = req.params.id;
    const usuarioId = req.estudianteBDD._id;
    
    try {
        const conversacion = await Conversacion.findById(conversacionId);
        
        if (!conversacion) {
            return res.status(404).json({ message: "Conversación no encontrada" });
        }

        // Verificar que el usuario sea miembro de la conversación
        if (!conversacion.miembros.includes(usuarioId)) {
            return res.status(403).json({ message: "No tienes acceso a esta conversación" });
        }

        // Agregar al usuario al array de ocultadaPor si no está ya
        if (!conversacion.ocultadaPor.includes(usuarioId)) {
            conversacion.ocultadaPor.push(usuarioId);
            await conversacion.save();
        }

        // Si AMBOS usuarios han ocultado la conversación, entonces eliminarla permanentemente
        const todosOcultaron = conversacion.miembros.every(miembro => 
            conversacion.ocultadaPor.some(oculto => oculto.toString() === miembro.toString())
        );

        if (todosOcultaron) {
            await Conversacion.findByIdAndDelete(conversacionId);
            return res.json({ message: "Conversación eliminada permanentemente (ambos usuarios la ocultaron)" });
        }

        res.json({ message: "Conversación ocultada correctamente" });
    }
    catch (error) {
        console.error("Error eliminando conversación:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
