import Conversacion from "../models/Conversacion.js";
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.URL_FRONTEND || '*',
            credentials: true
        },
    });

    // Middleware de autenticación
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            console.log('❌ Socket sin token');
            return next(new Error('Token no proporcionado'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            console.log('✅ Socket autenticado:', socket.userId);
            next();
        } catch (error) {
            console.log('❌ Token inválido');
            return next(new Error('Token inválido'));
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 Usuario conectado:', socket.userId);

        // Unirse a una conversación
        socket.on('join-chat', async ({ userId, otherUserId }) => {
            // Validar que el usuario autenticado es quien dice ser
            if (socket.userId !== userId) {
                return socket.emit('error-mensaje', 'No autorizado');
            }
            try {
                let conversacion = await Conversacion.findOne({
                    miembros: { $all: [userId, otherUserId] },
                });

                if (!conversacion) {
                    conversacion = await Conversacion.create({
                        miembros: [userId, otherUserId],
                        mensajes: [],
                        ocultadaPor: [] // Inicializar vacío
                    });
                } else {
                    // Si el usuario que se une había ocultado la conversación, removerlo del array
                    if (conversacion.ocultadaPor.includes(userId)) {
                        conversacion.ocultadaPor = conversacion.ocultadaPor.filter(
                            id => id.toString() !== userId.toString()
                        );
                        await conversacion.save();
                    }
                }

                const roomId = conversacion._id.toString();
                socket.join(roomId);

                await conversacion.populate({
                    path: 'mensajes.emisor',
                    select: 'nombre apellido',
                });

                socket.emit('chat-joined', {
                    roomId,
                    mensajes: conversacion.mensajes,
                });
                
                console.log(`✅ Usuario ${userId} unido a conversación ${roomId}`);
            } catch (error) {
                console.error('❌ Error en join-chat:', error);
                socket.emit('error-mensaje', 'Error al unirse al chat');
            }
        });

        socket.on('escribiendo', ({ roomId }) => {
            socket.to(roomId).emit('escribiendo', { roomId });
        });

        // Enviar mensaje con límite de palabras
        socket.on('enviar-mensaje', async ({ roomId, texto, emisor }) => {
            try {
                // Validar que el emisor sea el usuario autenticado
                if (socket.userId !== emisor) {
                    return socket.emit('error-mensaje', 'No autorizado');
                }

                const cantidadPalabras = texto.trim().split(/\s+/).length;

                if (cantidadPalabras > 100) {
                    return socket.emit('error-mensaje', 'El mensaje excede el límite de 100 palabras.');
                }

                const nuevoMensaje = { texto, emisor, fecha: new Date() };

                // Si el emisor había ocultado la conversación, removerlo del array para "reactivarla"
                const conversacion = await Conversacion.findByIdAndUpdate(
                    roomId,
                    { 
                        $push: { mensajes: nuevoMensaje },
                        $pull: { ocultadaPor: emisor } // Remover al emisor del array de ocultamiento
                    },
                    { new: true }
                ).populate({
                    path: 'mensajes.emisor',
                    select: 'nombre apellido',
                });

                if (!conversacion) {
                    return socket.emit('error-mensaje', 'Conversación no encontrada');
                }

                // Emitir a todos en la sala
                io.to(roomId).emit('nuevo-mensaje', conversacion.mensajes);
                
                console.log(`📨 Mensaje enviado en ${roomId} por ${emisor}`);
            } catch (error) {
                console.error('❌ Error en enviar-mensaje:', error);
                socket.emit('error-mensaje', 'Error al enviar mensaje');
            }
        });

        // Eliminar conversación (ya no se usa desde socket, se usa el endpoint REST)
        // Mantener por compatibilidad pero deprecado
        socket.on('eliminar-conversacion', async ({ roomId, userId }) => {
            try {
                const conversacion = await Conversacion.findById(roomId);
                
                if (!conversacion) {
                    return socket.emit('error-mensaje', 'Conversación no encontrada');
                }

                // Ocultar para el usuario que lo solicita
                if (!conversacion.ocultadaPor.includes(userId)) {
                    conversacion.ocultadaPor.push(userId);
                    await conversacion.save();
                }

                // Si ambos usuarios ocultaron, eliminar permanentemente
                const todosOcultaron = conversacion.miembros.every(miembro => 
                    conversacion.ocultadaPor.some(oculto => oculto.toString() === miembro.toString())
                );

                if (todosOcultaron) {
                    await Conversacion.findByIdAndDelete(roomId);
                    io.to(roomId).emit('conversacion-eliminada', { roomId });
                    console.log(`Conversación ${roomId} eliminada permanentemente.`);
                } else {
                    socket.emit('conversacion-ocultada', { roomId });
                    console.log(`Conversación ${roomId} ocultada para usuario ${userId}.`);
                }
            } catch (error) {
                console.error('Error al eliminar conversación:', error);
                socket.emit('error-mensaje', 'Error al eliminar conversación');
            }
        });


        // Desconexión
        socket.on('disconnect', () => {
            console.log('🔌 Usuario desconectado:', socket.userId || socket.id);
        });
    });

    return io;
};

export default initSocket;
