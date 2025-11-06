import Conversacion from "../models/Conversacion.js";
import { Server } from 'socket.io';

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
        },
    });

    io.on('connection', (socket) => {

        // Unirse a una conversación
        socket.on('join-chat', async ({ userId, otherUserId }) => {
            try {
                let conversacion = await Conversacion.findOne({
                    miembros: { $all: [userId, otherUserId] },
                });

                if (!conversacion) {
                    conversacion = await Conversacion.create({
                        miembros: [userId, otherUserId],
                        mensajes: [],
                    });
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
            } catch (error) {
                console.error('Error en join-chat:', error);
            }
        });

        socket.on('escribiendo', ({ roomId }) => {
            socket.to(roomId).emit('escribiendo', { roomId });
        });

        // Enviar mensaje con límite de palabras
        socket.on('enviar-mensaje', async ({ roomId, texto, emisor }) => {
            try {
                const cantidadPalabras = texto.trim().split(/\s+/).length;

                if (cantidadPalabras > 100) {
                    return socket.emit('error-mensaje', 'El mensaje excede el límite de 100 palabras.');
                }

                const nuevoMensaje = { texto, emisor };

                const conversacion = await Conversacion.findByIdAndUpdate(
                    roomId,
                    { $push: { mensajes: nuevoMensaje } },
                    { new: true }
                ).populate({
                    path: 'mensajes.emisor',
                    select: 'nombre apellido',
                });

                io.to(roomId).emit('nuevo-mensaje', conversacion.mensajes);
            } catch (error) {
                console.error('Error en enviar-mensaje:', error);
            }
        });

        // Eliminar conversación
        socket.on('eliminar-conversacion', async ({ roomId }) => {
            try {
                await Conversacion.findByIdAndDelete(roomId);
                io.to(roomId).emit('conversacion-eliminada', { roomId });
                console.log(`Conversación ${roomId} eliminada.`);
            } catch (error) {
                console.error('Error al eliminar conversación:', error);
            }
        });


        // Desconexión
        socket.on('disconnect', () => {
            console.log('Persona desconectada:', socket.id);
        });
    });
};

export default initSocket;
