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
        
        // Unirse a sala personal para notificaciones
        socket.join(`user:${socket.userId}`);

        // Unirse a una conversación
        socket.on('join-chat', async ({ conversacionId }) => {
            try {
                const conversacion = await Conversacion.findById(conversacionId);

                if (!conversacion) {
                    return socket.emit('error-mensaje', 'Conversación no encontrada');
                }

                // Validar que el usuario sea miembro
                if (!conversacion.miembros.some(m => m.toString() === socket.userId)) {
                    return socket.emit('error-mensaje', 'No eres miembro de esta conversación');
                }

                const roomId = conversacionId;
                socket.join(roomId);

                // Obtener mensajes de la conversación
                const mensajes = await Mensaje.find({
                    conversacion: conversacionId,
                    eliminado: false
                })
                    .sort({ createdAt: 1 })
                    .limit(50)
                    .populate('emisor', 'nombre apellido rol')
                    .lean();

                socket.emit('chat-joined', {
                    roomId,
                    mensajes
                });
                
                console.log(`✅ Usuario ${socket.userId} unido a conversación ${roomId}`);
            } catch (error) {
                console.error('❌ Error en join-chat:', error);
                socket.emit('error-mensaje', 'Error al unirse al chat');
            }
        });

        // Usuario escribiendo
        socket.on('escribiendo', ({ conversacionId }) => {
            socket.to(conversacionId).emit('usuario-escribiendo', { 
                conversacionId,
                usuarioId: socket.userId 
            });
        });

        // Usuario dejó de escribir
        socket.on('dejo-escribir', ({ conversacionId }) => {
            socket.to(conversacionId).emit('usuario-dejo-escribir', { 
                conversacionId,
                usuarioId: socket.userId 
            });
        });

        // Enviar mensaje de texto
        socket.on('enviar-mensaje', async ({ conversacionId, contenido }) => {
            console.log('📨 Recibiendo mensaje:', { conversacionId, contenido, userId: socket.userId });
            
            try {
                if (!contenido?.trim()) {
                    console.log('❌ Mensaje vacío');
                    return socket.emit('error-mensaje', 'El mensaje no puede estar vacío');
                }

                const palabras = contenido.trim().split(/\s+/).length;
                if (palabras > 100) {
                    console.log('❌ Mensaje muy largo');
                    return socket.emit('error-mensaje', 'El mensaje excede el límite de 100 palabras');
                }

                const conversacion = await Conversacion.findById(conversacionId);
                if (!conversacion) {
                    console.log('❌ Conversación no encontrada:', conversacionId);
                    return socket.emit('error-mensaje', 'Conversación no encontrada');
                }

                // Validar membresía
                if (!conversacion.miembros.some(m => m.toString() === socket.userId)) {
                    console.log('❌ Usuario no es miembro');
                    return socket.emit('error-mensaje', 'No eres miembro de esta conversación');
                }

                console.log('✅ Validaciones pasadas, creando mensaje...');

                // Crear mensaje
                const nuevoMensaje = await Mensaje.create({
                    conversacion: conversacionId,
                    emisor: socket.userId,
                    tipo: 'texto',
                    contenido: contenido.trim()
                });

                console.log('✅ Mensaje creado:', nuevoMensaje._id);

                // Populate el mensaje
                const mensajePopulado = await Mensaje.findById(nuevoMensaje._id)
                    .populate('emisor', 'nombre apellido rol');

                console.log('✅ Mensaje populado:', mensajePopulado);
                console.log('✅ Actualizando conversación...');

                // Actualizar conversación
                const otroMiembro = conversacion.miembros.find(
                    m => m.toString() !== socket.userId
                );

                console.log('👤 Otro miembro:', otroMiembro);

                conversacion.ultimoMensaje = nuevoMensaje._id;
                conversacion.updatedAt = new Date();
                // 🔥 Remover al RECEPTOR del array ocultadaPor para que el chat le aparezca de nuevo
                conversacion.ocultadaPor = conversacion.ocultadaPor.filter(
                    id => id.toString() !== otroMiembro.toString()
                );

                // Incrementar contador para el otro usuario
                const mensajesNoLeidosActualizado = conversacion.mensajesNoLeidos.map(item => {
                    if (item.usuario.toString() === otroMiembro.toString()) {
                        return { usuario: item.usuario, cantidad: item.cantidad + 1 };
                    }
                    return item;
                });

                if (!mensajesNoLeidosActualizado.some(
                    item => item.usuario.toString() === otroMiembro.toString()
                )) {
                    mensajesNoLeidosActualizado.push({ 
                        usuario: otroMiembro, 
                        cantidad: 1 
                    });
                }

                conversacion.mensajesNoLeidos = mensajesNoLeidosActualizado;
                await conversacion.save();

                console.log('✅ Conversación actualizada');

                // Crear notificación
                await Notificacion.create({
                    usuario: otroMiembro,
                    mensaje: 'Tienes un nuevo mensaje',
                    tipo: 'mensaje',
                    leido: false
                });

                console.log('✅ Notificación creada');

                // Emitir eventos
                console.log('📡 Emitiendo mensaje a sala:', conversacionId);
                console.log('📡 Mensaje a emitir:', JSON.stringify(mensajePopulado, null, 2));
                
                io.to(conversacionId).emit('message:new', {
                    mensaje: mensajePopulado
                });

                console.log('📡 Mensaje emitido a la sala');

                // Notificar actualización de chat al otro usuario
                io.to(`user:${otroMiembro}`).emit('chat:updated', {
                    conversacionId,
                    ultimoMensaje: mensajePopulado,
                    mensajesNoLeidos: 1
                });

                // 🔥 Forzar recarga si el chat estaba oculto
                io.to(`user:${otroMiembro}`).emit('conversacion:restaurada', {
                    conversacionId
                });

                console.log(`✅ Mensaje enviado correctamente en ${conversacionId} por ${socket.userId}`);
                
                // Confirmar al emisor
                socket.emit('mensaje:confirmado', {
                    mensajeId: mensajePopulado._id
                });
            } catch (error) {
                console.error('❌ Error en enviar-mensaje:', error);
                console.error('Stack:', error.stack);
                socket.emit('error-mensaje', 'Error al enviar mensaje: ' + error.message);
            }
        });

        // Enviar imagen
        socket.on('enviar-imagen', async ({ conversacionId, imagenUrl, imagenPublicId }) => {
            try {
                const conversacion = await Conversacion.findById(conversacionId);
                if (!conversacion) {
                    return socket.emit('error-mensaje', 'Conversación no encontrada');
                }

                // Validar membresía
                if (!conversacion.miembros.some(m => m.toString() === socket.userId)) {
                    return socket.emit('error-mensaje', 'No eres miembro de esta conversación');
                }

                // Crear mensaje de imagen
                const nuevoMensaje = await Mensaje.create({
                    conversacion: conversacionId,
                    emisor: socket.userId,
                    tipo: 'imagen',
                    imagenUrl,
                    imagenPublicId
                });

                await nuevoMensaje.populate('emisor', 'nombre apellido rol');

                // Actualizar conversación
                const otroMiembro = conversacion.miembros.find(
                    m => m.toString() !== socket.userId
                );

                conversacion.ultimoMensaje = nuevoMensaje._id;
                conversacion.updatedAt = new Date();
                // 🔥 Remover al RECEPTOR del array ocultadaPor para que el chat le aparezca de nuevo
                conversacion.ocultadaPor = conversacion.ocultadaPor.filter(
                    id => id.toString() !== otroMiembro.toString()
                );

                // Incrementar contador
                const mensajesNoLeidosActualizado = conversacion.mensajesNoLeidos.map(item => {
                    if (item.usuario.toString() === otroMiembro.toString()) {
                        return { usuario: item.usuario, cantidad: item.cantidad + 1 };
                    }
                    return item;
                });

                if (!mensajesNoLeidosActualizado.some(
                    item => item.usuario.toString() === otroMiembro.toString()
                )) {
                    mensajesNoLeidosActualizado.push({ 
                        usuario: otroMiembro, 
                        cantidad: 1 
                    });
                }

                conversacion.mensajesNoLeidos = mensajesNoLeidosActualizado;
                await conversacion.save();

                // Crear notificación
                await Notificacion.create({
                    usuario: otroMiembro,
                    mensaje: 'Te han enviado una imagen',
                    tipo: 'mensaje',
                    leido: false
                });

                // Emitir eventos
                io.to(conversacionId).emit('message:new', {
                    mensaje: nuevoMensaje
                });

                io.to(`user:${otroMiembro}`).emit('chat:updated', {
                    conversacionId,
                    ultimoMensaje: nuevoMensaje,
                    mensajesNoLeidos: 1
                });

                console.log(`🖼️ Imagen enviada en ${conversacionId} por ${socket.userId}`);
            } catch (error) {
                console.error('❌ Error en enviar-imagen:', error);
                socket.emit('error-mensaje', 'Error al enviar imagen');
            }
        });

        // Eliminar mensaje
        socket.on('eliminar-mensaje', async ({ mensajeId }) => {
            try {
                const mensaje = await Mensaje.findById(mensajeId);
                
                if (!mensaje) {
                    return socket.emit('error-mensaje', 'Mensaje no encontrado');
                }

                // Verificar que el usuario sea el autor
                if (mensaje.emisor.toString() !== socket.userId) {
                    return socket.emit('error-mensaje', 'Solo puedes eliminar tus propios mensajes');
                }

                // Soft delete
                mensaje.eliminado = true;
                await mensaje.save();

                // Si es imagen, eliminar de Cloudinary
                if (mensaje.tipo === 'imagen' && mensaje.imagenPublicId) {
                    try {
                        await cloudinary.uploader.destroy(mensaje.imagenPublicId);
                    } catch (cloudinaryError) {
                        console.error('Error eliminando imagen de Cloudinary:', cloudinaryError);
                    }
                }

                // Actualizar último mensaje si era el último
                const conversacion = await Conversacion.findById(mensaje.conversacion);
                if (conversacion?.ultimoMensaje?.toString() === mensajeId) {
                    const nuevoUltimoMensaje = await Mensaje.findOne({
                        conversacion: mensaje.conversacion,
                        eliminado: false
                    }).sort({ createdAt: -1 });

                    conversacion.ultimoMensaje = nuevoUltimoMensaje?._id || null;
                    await conversacion.save();
                }

                // Emitir evento
                io.to(mensaje.conversacion.toString()).emit('message:delete', {
                    mensajeId
                });

                console.log(`🗑️ Mensaje ${mensajeId} eliminado por ${socket.userId}`);
            } catch (error) {
                console.error('❌ Error en eliminar-mensaje:', error);
                socket.emit('error-mensaje', 'Error al eliminar mensaje');
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
