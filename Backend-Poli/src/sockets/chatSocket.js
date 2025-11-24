import Conversacion from "../models/Conversacion.js";
import Mensaje from "../models/Mensaje.js";
import Notificacion from "../models/Notificacion.js";
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

    const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.URL_FRONTEND || '*',
            credentials: true
        },
        // Optimizaciones de configuración
        pingTimeout: 60000,
        pingInterval: 25000,
        maxHttpBufferSize: 10e6, // 10MB máximo por mensaje (incluye metadata)
        transports: ['websocket', 'polling'] // Priorizar websocket
    });

    // Constantes de límites
    const MAX_IMAGE_SIZE_MB = 5; // 5MB máximo para imágenes
    const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

    // Mapas optimizados para tracking de usuarios
    const socketIdToUserId = new Map();
    const userIdToSocketIds = new Map();

    // Middleware de autenticación optimizado
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

    // Helper para obtener IDs de usuarios conectados (memoizado)
    const getConnectedUserIds = () => Array.from(userIdToSocketIds.keys());

    // Helper para registrar socket de usuario
    const registerUserSocket = (socket) => {
        socketIdToUserId.set(socket.id, socket.userId);
        
        if (!userIdToSocketIds.has(socket.userId)) {
            userIdToSocketIds.set(socket.userId, new Set());
        }
        
        const socketsSet = userIdToSocketIds.get(socket.userId);
        const isFirstConnection = socketsSet.size === 0;
        socketsSet.add(socket.id);
        
        return isFirstConnection;
    };

    // Helper para desregistrar socket de usuario
    const unregisterUserSocket = (socketId) => {
        const userId = socketIdToUserId.get(socketId);
        socketIdToUserId.delete(socketId);

        if (userId && userIdToSocketIds.has(userId)) {
            const set = userIdToSocketIds.get(userId);
            set.delete(socketId);
            
            if (set.size === 0) {
                userIdToSocketIds.delete(userId);
                return { userId, isLastConnection: true };
            }
        }
        
        return { userId, isLastConnection: false };
    };

    // Helper optimizado para actualizar mensajes no leídos
    const incrementarMensajesNoLeidos = async (conversacionId, usuarioId) => {
        const updateResult = await Conversacion.updateOne(
            { _id: conversacionId, 'mensajesNoLeidos.usuario': usuarioId },
            { $inc: { 'mensajesNoLeidos.$.cantidad': 1 } }
        );

        if (updateResult.matchedCount === 0) {
            await Conversacion.updateOne(
                { _id: conversacionId },
                { $push: { mensajesNoLeidos: { usuario: usuarioId, cantidad: 1 } } }
            );
        }
    };

    // Helper para validar membresía en conversación
    const validarMiembro = (conversacion, userId) => {
        return conversacion.miembros.some(m => m.toString() === userId);
    };

    io.on('connection', (socket) => {
        console.log('🔌 Usuario conectado:', socket.userId);

        // Registrar conexión y verificar si es primera conexión
        const isFirstConnection = registerUserSocket(socket);

        // Unirse a sala personal
        socket.join(`user-${socket.userId}`);

        // Emitir usuario conectado solo si es la primera conexión
        if (isFirstConnection) {
            io.emit('usuario-conectado', { usuarioId: socket.userId });
            console.log('📡 Primera conexión de usuario:', socket.userId);
        }

        // Enviar lista de usuarios conectados (optimizado)
        socket.emit('usuarios-conectados', getConnectedUserIds());

        // Obtener usuarios conectados manualmente
        socket.on('obtener-usuarios-conectados', () => {
            socket.emit('usuarios-conectados', getConnectedUserIds());
        });

        // Enviar imagen (optimizado con validación de tamaño)
        socket.on('enviar-imagen', async ({ conversacionId, imagenUrl, imagenPublicId, imagenSize }) => {
            try {
                // Validar tamaño de imagen
                if (imagenSize && imagenSize > MAX_IMAGE_SIZE_BYTES) {
                    return socket.emit('error-mensaje', `La imagen excede el tamaño máximo permitido de ${MAX_IMAGE_SIZE_MB}MB`);
                }

                const conversacion = await Conversacion.findById(conversacionId)
                    .select('miembros ocultadaPor')
                    .lean();
                
                if (!conversacion) {
                    return socket.emit('error-mensaje', 'Conversación no encontrada');
                }
                
                if (!validarMiembro(conversacion, socket.userId)) {
                    return socket.emit('error-mensaje', 'No eres miembro de esta conversación');
                }

                const otroMiembro = conversacion.miembros.find(m => m.toString() !== socket.userId);

                // Crear mensaje
                const nuevoMensaje = await Mensaje.create({
                    conversacion: conversacionId,
                    emisor: socket.userId,
                    tipo: 'imagen',
                    imagenUrl,
                    imagenPublicId
                });

                await nuevoMensaje.populate('emisor', 'nombre apellido rol');

                // Emitir mensaje inmediatamente
                io.to(conversacionId).emit('message:new', { mensaje: nuevoMensaje });

                // Operaciones en background (sin bloquear)
                setImmediate(async () => {
                    try {
                        await Promise.all([
                            Conversacion.findByIdAndUpdate(conversacionId, {
                                $set: { ultimoMensaje: nuevoMensaje._id, updatedAt: new Date() },
                                $pull: { ocultadaPor: otroMiembro }
                            }),
                            incrementarMensajesNoLeidos(conversacionId, otroMiembro)
                        ]);

                        const notificacion = await Notificacion.create({
                            usuario: otroMiembro,
                            mensaje: 'Te han enviado una imagen',
                            tipo: 'mensaje',
                            leido: false
                        });

                        io.to(`user-${otroMiembro}`).emit('notificacion:nueva', notificacion);
                        io.to(`user-${otroMiembro}`).emit('chat:updated', {
                            conversacionId,
                            ultimoMensaje: nuevoMensaje,
                            mensajesNoLeidos: 1
                        });
                    } catch (bgError) {
                        console.error('❌ Error background imagen:', bgError);
                    }
                });

                console.log(`🖼️ Imagen enviada en ${conversacionId}`);
            } catch (error) {
                console.error('❌ Error en enviar-imagen:', error);
                socket.emit('error-mensaje', 'Error al enviar imagen');
            }
        });

        // Unirse a conversación (optimizado)
        socket.on('join-chat', async ({ conversacionId }) => {
            try {
                const conversacion = await Conversacion.findById(conversacionId)
                    .select('miembros')
                    .lean();

                if (!conversacion) {
                    return socket.emit('error-mensaje', 'Conversación no encontrada');
                }

                if (!validarMiembro(conversacion, socket.userId)) {
                    return socket.emit('error-mensaje', 'No eres miembro de esta conversación');
                }

                socket.join(conversacionId);

                // Cargar mensajes con índice optimizado
                const mensajes = await Mensaje.find({
                    conversacion: conversacionId,
                    eliminado: false
                })
                    .sort({ createdAt: -1 }) // Orden descendente para LIMIT eficiente
                    .limit(50)
                    .populate('emisor', 'nombre apellido rol')
                    .lean();

                // Revertir orden para UI (más reciente al final)
                socket.emit('chat-joined', {
                    roomId: conversacionId,
                    mensajes: mensajes.reverse()
                });

                console.log(`✅ Usuario ${socket.userId} unido a ${conversacionId}`);
            } catch (error) {
                console.error('❌ Error en join-chat:', error);
                socket.emit('error-mensaje', 'Error al unirse al chat');
            }
        });

        // Enviar mensaje de texto (máxima optimización)
        socket.on('enviar-mensaje', async ({ conversacionId, contenido }) => {
            try {
                // Validaciones rápidas
                const contenidoTrimmed = contenido?.trim();
                if (!contenidoTrimmed) {
                    return socket.emit('error-mensaje', 'El mensaje no puede estar vacío');
                }

                const palabras = contenidoTrimmed.split(/\s+/).length;
                if (palabras > 100) {
                    return socket.emit('error-mensaje', 'El mensaje excede el límite de 100 palabras');
                }

                // Validar conversación (mínima proyección)
                const conversacion = await Conversacion.findById(conversacionId)
                    .select('miembros')
                    .lean();

                if (!conversacion) {
                    return socket.emit('error-mensaje', 'Conversación no encontrada');
                }

                if (!validarMiembro(conversacion, socket.userId)) {
                    return socket.emit('error-mensaje', 'No eres miembro de esta conversación');
                }

                const otroMiembro = conversacion.miembros.find(m => m.toString() !== socket.userId);

                // Crear mensaje
                const nuevoMensaje = await Mensaje.create({
                    conversacion: conversacionId,
                    emisor: socket.userId,
                    tipo: 'texto',
                    contenido: contenidoTrimmed
                });

                // Poblar emisor
                await nuevoMensaje.populate('emisor', 'nombre apellido rol email');

                // Emitir mensaje INMEDIATAMENTE (optimistic delivery)
                io.to(conversacionId).emit('message:new', { mensaje: nuevoMensaje });
                socket.emit('mensaje:confirmado', { mensajeId: nuevoMensaje._id });

                // Operaciones en background con setImmediate (no bloquean event loop)
                setImmediate(async () => {
                    try {
                        await Promise.all([
                            Conversacion.findByIdAndUpdate(conversacionId, {
                                $set: { ultimoMensaje: nuevoMensaje._id, updatedAt: new Date() },
                                $pull: { ocultadaPor: otroMiembro }
                            }),
                            incrementarMensajesNoLeidos(conversacionId, otroMiembro)
                        ]);

                        const notificacion = await Notificacion.create({
                            usuario: otroMiembro,
                            mensaje: 'Tienes un nuevo mensaje',
                            tipo: 'mensaje',
                            leido: false
                        });

                        // Emitir notificaciones al otro usuario
                        io.to(`user-${otroMiembro}`).emit('notificacion:nueva', notificacion);
                        io.to(`user-${otroMiembro}`).emit('chat:updated', {
                            conversacionId,
                            ultimoMensaje: nuevoMensaje,
                            mensajesNoLeidos: 1
                        });
                        io.to(`user-${otroMiembro}`).emit('conversacion:restaurada', { conversacionId });
                    } catch (bgError) {
                        console.error('❌ Error background mensaje:', bgError);
                    }
                });
            } catch (error) {
                console.error('❌ Error en enviar-mensaje:', error);
                socket.emit('error-mensaje', 'Error al enviar mensaje');
            }
        });

        // Eliminar mensaje (optimizado)
        socket.on('eliminar-mensaje', async ({ mensajeId }) => {
            try {
                const mensaje = await Mensaje.findById(mensajeId).lean();
                
                if (!mensaje) {
                    return socket.emit('error-mensaje', 'Mensaje no encontrado');
                }

                if (mensaje.emisor.toString() !== socket.userId) {
                    return socket.emit('error-mensaje', 'Solo puedes eliminar tus propios mensajes');
                }

                // Soft delete
                await Mensaje.findByIdAndUpdate(mensajeId, { $set: { eliminado: true } });

                // Emitir eliminación inmediatamente
                io.to(mensaje.conversacion.toString()).emit('message:delete', { mensajeId });

                // Operaciones en background
                setImmediate(async () => {
                    try {
                        // Eliminar de Cloudinary si es imagen
                        if (mensaje.tipo === 'imagen' && mensaje.imagenPublicId) {
                            cloudinary.uploader.destroy(mensaje.imagenPublicId).catch(err => 
                                console.error('Error Cloudinary:', err)
                            );
                        }

                        // Actualizar último mensaje si era el último
                        const conversacion = await Conversacion.findById(mensaje.conversacion)
                            .select('ultimoMensaje')
                            .lean();

                        if (conversacion?.ultimoMensaje?.toString() === mensajeId) {
                            const nuevoUltimoMensaje = await Mensaje.findOne({
                                conversacion: mensaje.conversacion,
                                eliminado: false
                            })
                                .sort({ createdAt: -1 })
                                .select('_id')
                                .lean();

                            await Conversacion.findByIdAndUpdate(mensaje.conversacion, {
                                $set: { ultimoMensaje: nuevoUltimoMensaje?._id || null }
                            });
                        }
                    } catch (bgError) {
                        console.error('❌ Error background eliminar:', bgError);
                    }
                });

                console.log(`🗑️ Mensaje ${mensajeId} eliminado`);
            } catch (error) {
                console.error('❌ Error en eliminar-mensaje:', error);
                socket.emit('error-mensaje', 'Error al eliminar mensaje');
            }
        });

        // Desconexión (optimizado)
        socket.on('disconnect', () => {
            console.log('🔌 Usuario desconectado:', socket.userId);

            const { userId, isLastConnection } = unregisterUserSocket(socket.id);

            // Emitir desconexión solo si fue la última conexión del usuario
            if (isLastConnection) {
                io.emit('usuario-desconectado', { usuarioId: userId });
                console.log('📡 Última conexión cerrada:', userId);
            }
        });
    });

    return io;
};

export default initSocket;