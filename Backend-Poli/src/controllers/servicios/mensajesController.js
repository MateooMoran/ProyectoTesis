import Mensaje from "../../models/Mensaje.js";
import Conversacion from "../../models/Conversacion.js";
import Notificacion from "../../models/Notificacion.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

// 📤 Enviar mensaje de texto
export const enviarMensajeTexto = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { conversacionId, contenido } = req.body;
    const emisorId = req.estudianteBDD._id;

    if (!conversacionId || !contenido?.trim()) {
      return res.status(400).json({ msg: "Conversación y contenido son requeridos" });
    }

    // Validar conversación y membresía
    const conversacion = await Conversacion.findById(conversacionId);
    if (!conversacion) {
      return res.status(404).json({ msg: "Conversación no encontrada" });
    }

    if (!conversacion.miembros.some(m => m.toString() === emisorId.toString())) {
      return res.status(403).json({ msg: "No eres miembro de esta conversación" });
    }

    // Crear mensaje
    const nuevoMensaje = new Mensaje({
      conversacion: conversacionId,
      emisor: emisorId,
      tipo: "texto",
      contenido: contenido.trim()
    });

    await nuevoMensaje.save({ session });

    // Actualizar último mensaje y contador
    const otroMiembro = conversacion.miembros.find(m => m.toString() !== emisorId.toString());
    
    const mensajesNoLeidosActualizado = conversacion.mensajesNoLeidos.map(item => {
      if (item.usuario.toString() === otroMiembro.toString()) {
        return { usuario: item.usuario, cantidad: item.cantidad + 1 };
      }
      return item;
    });

    // Si no existe, crear entrada
    if (!mensajesNoLeidosActualizado.some(item => item.usuario.toString() === otroMiembro.toString())) {
      mensajesNoLeidosActualizado.push({ usuario: otroMiembro, cantidad: 1 });
    }

    conversacion.ultimoMensaje = nuevoMensaje._id;
    conversacion.mensajesNoLeidos = mensajesNoLeidosActualizado;
    conversacion.updatedAt = new Date();
    
    // Remover al emisor de ocultadaPor si estaba
    conversacion.ocultadaPor = conversacion.ocultadaPor.filter(
      id => id.toString() !== emisorId.toString()
    );

    await conversacion.save({ session });

    // Crear notificación para el otro usuario
    await Notificacion.create([{
      usuario: otroMiembro,
      mensaje: "Tienes un nuevo mensaje",
      tipo: "mensaje",
      leido: false
    }], { session });

    await session.commitTransaction();

    const mensajeConDatos = await Mensaje.findById(nuevoMensaje._id)
      .populate("emisor", "nombre apellido rol");

    res.status(201).json({ 
      msg: "Mensaje enviado", 
      mensaje: mensajeConDatos 
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error enviando mensaje:", error);
    res.status(500).json({ msg: "Error enviando mensaje", error: error.message });
  } finally {
    session.endSession();
  }
};

// 📷 Enviar mensaje con imagen
export const enviarMensajeImagen = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { conversacionId } = req.body;
    const emisorId = req.estudianteBDD._id;

    console.log('🖼️ Recibiendo imagen:', { conversacionId, emisorId });

    if (!conversacionId) {
      return res.status(400).json({ msg: "Conversación requerida" });
    }

    if (!req.files?.imagen) {
      return res.status(400).json({ msg: "Imagen requerida" });
    }

    const file = req.files.imagen;
    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ msg: "Solo se permiten imágenes" });
    }

    // Validar conversación y membresía
    const conversacion = await Conversacion.findById(conversacionId);
    if (!conversacion) {
      return res.status(404).json({ msg: "Conversación no encontrada" });
    }

    if (!conversacion.miembros.some(m => m.toString() === emisorId.toString())) {
      return res.status(403).json({ msg: "No eres miembro de esta conversación" });
    }

    // Subir a Cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "poli-market/chat-imagenes",
      resource_type: "image"
    });

    // Crear mensaje
    const nuevoMensaje = new Mensaje({
      conversacion: conversacionId,
      emisor: emisorId,
      tipo: "imagen",
      imagenUrl: secure_url,
      imagenPublicId: public_id
    });

    await nuevoMensaje.save({ session });

    // Actualizar conversación
    const otroMiembro = conversacion.miembros.find(m => m.toString() !== emisorId.toString());
    
    const mensajesNoLeidosActualizado = conversacion.mensajesNoLeidos.map(item => {
      if (item.usuario.toString() === otroMiembro.toString()) {
        return { usuario: item.usuario, cantidad: item.cantidad + 1 };
      }
      return item;
    });

    if (!mensajesNoLeidosActualizado.some(item => item.usuario.toString() === otroMiembro.toString())) {
      mensajesNoLeidosActualizado.push({ usuario: otroMiembro, cantidad: 1 });
    }

    conversacion.ultimoMensaje = nuevoMensaje._id;
    conversacion.mensajesNoLeidos = mensajesNoLeidosActualizado;
    conversacion.updatedAt = new Date();
    conversacion.ocultadaPor = conversacion.ocultadaPor.filter(
      id => id.toString() !== emisorId.toString()
    );

    await conversacion.save({ session });

    // Notificación
    await Notificacion.create([{
      usuario: otroMiembro,
      mensaje: "Te han enviado una imagen",
      tipo: "mensaje",
      leido: false
    }], { session });

    await session.commitTransaction();

    const mensajeConDatos = await Mensaje.findById(nuevoMensaje._id)
      .populate("emisor", "nombre apellido rol");

    // Emitir evento de socket
    const io = req.app.get('io');
    if (io) {
      io.to(conversacionId).emit('message:new', {
        mensaje: mensajeConDatos
      });
      
      io.to(`user:${otroMiembro}`).emit('chat:updated', {
        conversacionId,
        ultimoMensaje: mensajeConDatos
      });
    }

    res.status(201).json({ 
      msg: "Imagen enviada", 
      mensaje: mensajeConDatos 
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error enviando imagen:", error);
    res.status(500).json({ msg: "Error enviando imagen", error: error.message });
  } finally {
    session.endSession();
  }
};

// 📜 Obtener mensajes de una conversación
export const obtenerMensajes = async (req, res) => {
  try {
    const { conversacionId } = req.params;
    const usuarioId = req.estudianteBDD._id;
    const { limit = 50, skip = 0 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(conversacionId)) {
      return res.status(400).json({ msg: "ID de conversación inválido" });
    }

    // Validar membresía
    const conversacion = await Conversacion.findById(conversacionId);
    if (!conversacion) {
      return res.status(404).json({ msg: "Conversación no encontrada" });
    }

    if (!conversacion.miembros.some(m => m.toString() === usuarioId.toString())) {
      return res.status(403).json({ msg: "No eres miembro de esta conversación" });
    }

    // Obtener mensajes
    const mensajes = await Mensaje.find({
      conversacion: conversacionId,
      eliminado: false
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("emisor", "nombre apellido rol")
      .lean();

    res.status(200).json({ 
      mensajes: mensajes.reverse(), // Más antiguos primero
      total: await Mensaje.countDocuments({ conversacion: conversacionId, eliminado: false })
    });

  } catch (error) {
    console.error("Error obteniendo mensajes:", error);
    res.status(500).json({ msg: "Error obteniendo mensajes", error: error.message });
  }
};

// 🗑️ Eliminar mensaje (solo el autor)
export const eliminarMensaje = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { mensajeId } = req.params;
    const usuarioId = req.estudianteBDD._id;

    if (!mongoose.Types.ObjectId.isValid(mensajeId)) {
      return res.status(400).json({ msg: "ID de mensaje inválido" });
    }

    const mensaje = await Mensaje.findById(mensajeId);
    if (!mensaje) {
      return res.status(404).json({ msg: "Mensaje no encontrado" });
    }

    // Verificar que el usuario sea el autor
    if (mensaje.emisor.toString() !== usuarioId.toString()) {
      return res.status(403).json({ msg: "Solo puedes eliminar tus propios mensajes" });
    }

    // Soft delete
    mensaje.eliminado = true;
    await mensaje.save({ session });

    // Si es imagen, eliminar de Cloudinary
    if (mensaje.tipo === "imagen" && mensaje.imagenPublicId) {
      try {
        await cloudinary.uploader.destroy(mensaje.imagenPublicId);
      } catch (cloudinaryError) {
        console.error("Error eliminando imagen de Cloudinary:", cloudinaryError);
        // No fallar la transacción por esto
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
      await conversacion.save({ session });
    }

    await session.commitTransaction();

    res.status(200).json({ msg: "Mensaje eliminado correctamente" });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error eliminando mensaje:", error);
    res.status(500).json({ msg: "Error eliminando mensaje", error: error.message });
  } finally {
    session.endSession();
  }
};

// ✅ Marcar mensajes como leídos
export const marcarMensajesLeidos = async (req, res) => {
  try {
    const { conversacionId } = req.params;
    const usuarioId = req.estudianteBDD._id;

    if (!mongoose.Types.ObjectId.isValid(conversacionId)) {
      return res.status(400).json({ msg: "ID de conversación inválido" });
    }

    const conversacion = await Conversacion.findById(conversacionId);
    if (!conversacion) {
      return res.status(404).json({ msg: "Conversación no encontrada" });
    }

    if (!conversacion.miembros.some(m => m.toString() === usuarioId.toString())) {
      return res.status(403).json({ msg: "No eres miembro de esta conversación" });
    }

    // Actualizar contador
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

    res.status(200).json({ msg: "Mensajes marcados como leídos" });

  } catch (error) {
    console.error("Error marcando mensajes como leídos:", error);
    res.status(500).json({ msg: "Error marcando mensajes como leídos", error: error.message });
  }
};
