import Conversacion from "../../models/Conversacion.js";
import Mensaje from "../../models/Mensaje.js";

// Obtener conversaciones recientes del usuario
export const obtenerConversacionesRecientes = async (req, res) => {
    const userId = req.estudianteBDD._id;

    try {
        // Filtrar conversaciones que NO han sido ocultadas por el usuario
        const conversaciones = await Conversacion.find({ 
            miembros: userId,
            ocultadaPor: { $ne: userId }
        })
            .populate('miembros', 'nombre apellido rol')
            .populate({
                path: 'ultimoMensaje',
                populate: {
                    path: 'emisor',
                    select: 'nombre apellido'
                }
            })
            .sort({ updatedAt: -1 })
            .lean();

        const conversacionesFormateadas = conversaciones.map(conv => {
            const otroMiembro = conv.miembros.find(m => m._id.toString() !== userId.toString());
            
            // Obtener contador de mensajes no leídos para este usuario
            const contadorNoLeidos = conv.mensajesNoLeidos?.find(
                item => item.usuario.toString() === userId.toString()
            );

            return {
                conversacionId: conv._id,
                otroMiembro,
                ultimoMensaje: conv.ultimoMensaje,
                mensajesNoLeidos: contadorNoLeidos?.cantidad || 0,
                updatedAt: conv.updatedAt
            };
        });

        res.json(conversacionesFormateadas);
    } catch (error) {
        console.error('Error al obtener conversaciones recientes:', error);
        res.status(500).json({ error: 'Error interno' });
    }
};

// Marcar conversación como leída
export const conversacionLectura = async (req, res) => {
    const usuarioId = req.estudianteBDD._id;
    const conversacionId = req.params.id;

    try {
        const conversacion = await Conversacion.findById(conversacionId);
        if (!conversacion) return res.status(404).json({ message: "Conversación no encontrada" });

        // Verificar membresía
        if (!conversacion.miembros.some(m => m.toString() === usuarioId.toString())) {
            return res.status(403).json({ message: "No eres miembro de esta conversación" });
        }

        // Resetear contador de mensajes no leídos
        conversacion.mensajesNoLeidos = conversacion.mensajesNoLeidos.map(item => {
            if (item.usuario.toString() === usuarioId.toString()) {
                return { usuario: item.usuario, cantidad: 0 };
            }
            return item;
        });

        await conversacion.save();

        // Marcar mensajes como leídos
        await Mensaje.updateMany(
            { 
                conversacion: conversacionId, 
                emisor: { $ne: usuarioId },
                leido: false 
            },
            { leido: true }
        );

        res.json({ message: "Conversación marcada como leída" });
    } catch (error) {
        console.error("Error actualizando lectura:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Ocultar conversación para el usuario
export const eliminarConversacion = async (req, res) => {
    const conversacionId = req.params.id;
    const usuarioId = req.estudianteBDD._id;
    
    try {
        const conversacion = await Conversacion.findById(conversacionId);
        
        if (!conversacion) {
            return res.status(404).json({ message: "Conversación no encontrada" });
        }

        // Verificar que el usuario sea miembro de la conversación
        if (!conversacion.miembros.some(m => m.toString() === usuarioId.toString())) {
            return res.status(403).json({ message: "No tienes acceso a esta conversación" });
        }

        // Agregar al usuario al array de ocultadaPor si no está ya
        if (!conversacion.ocultadaPor.some(id => id.toString() === usuarioId.toString())) {
            conversacion.ocultadaPor.push(usuarioId);
            await conversacion.save();
        }

        // Si AMBOS usuarios han ocultado la conversación, entonces eliminarla permanentemente
        const todosOcultaron = conversacion.miembros.every(miembro => 
            conversacion.ocultadaPor.some(oculto => oculto.toString() === miembro.toString())
        );

        if (todosOcultaron) {
            // Eliminar todos los mensajes de la conversación
            await Mensaje.deleteMany({ conversacion: conversacionId });
            // Eliminar la conversación
            await Conversacion.findByIdAndDelete(conversacionId);
            return res.json({ message: "Conversación eliminada permanentemente" });
        }

        res.json({ message: "Conversación ocultada correctamente" });
    }
    catch (error) {
        console.error("Error eliminando conversación:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Crear o obtener conversación con otro usuario
export const crearObtenerConversacion = async (req, res) => {
    try {
        const { otroUsuarioId } = req.body;
        const usuarioId = req.estudianteBDD._id;

        if (!otroUsuarioId) {
            return res.status(400).json({ msg: "ID del otro usuario es requerido" });
        }

        if (otroUsuarioId === usuarioId.toString()) {
            return res.status(400).json({ msg: "No puedes crear una conversación contigo mismo" });
        }

        // Buscar conversación existente
        let conversacion = await Conversacion.findOne({
            miembros: { $all: [usuarioId, otroUsuarioId] }
        })
            .populate('miembros', 'nombre apellido rol')
            .populate({
                path: 'ultimoMensaje',
                populate: {
                    path: 'emisor',
                    select: 'nombre apellido'
                }
            });

        if (!conversacion) {
            // Crear nueva conversación
            conversacion = await Conversacion.create({
                miembros: [usuarioId, otroUsuarioId],
                mensajesNoLeidos: [
                    { usuario: usuarioId, cantidad: 0 },
                    { usuario: otroUsuarioId, cantidad: 0 }
                ],
                ocultadaPor: []
            });

            await conversacion.populate('miembros', 'nombre apellido rol');
        } else {
            // Si el usuario que inicia había ocultado la conversación, removerlo
            if (conversacion.ocultadaPor.some(id => id.toString() === usuarioId.toString())) {
                conversacion.ocultadaPor = conversacion.ocultadaPor.filter(
                    id => id.toString() !== usuarioId.toString()
                );
                await conversacion.save();
            }
        }

        res.status(200).json(conversacion);

    } catch (error) {
        console.error("Error creando/obteniendo conversación:", error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

// Obtener contador total de mensajes no leídos
export const obtenerContadorMensajesNoLeidos = async (req, res) => {
    try {
        const usuarioId = req.estudianteBDD._id;

        const conversaciones = await Conversacion.find({
            miembros: usuarioId,
            ocultadaPor: { $ne: usuarioId }
        }).lean();

        const totalNoLeidos = conversaciones.reduce((total, conv) => {
            const contador = conv.mensajesNoLeidos?.find(
                item => item.usuario.toString() === usuarioId.toString()
            );
            return total + (contador?.cantidad || 0);
        }, 0);

        res.json({ totalNoLeidos });

    } catch (error) {
        console.error("Error obteniendo contador:", error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};
