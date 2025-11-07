import Notificacion from "../models/Notificacion.js";


export const crearNotificacionConSocket = async (io, usuario, mensaje, tipo) => {
  try {
    // Crear notificación en la base de datos
    const notificacion = await Notificacion.create({ usuario, mensaje, tipo });
    
    // Emitir evento de Socket.IO para actualización en tiempo real
    if (io) {
      io.to(`user-${usuario}`).emit('notificacion:nueva', notificacion);
      console.log(`🔔 Notificación emitida a usuario: ${usuario}`);
    }
    
    return notificacion;
  } catch (error) {
    console.error('Error creando notificación:', error);
    throw error;
  }
};


export const crearNotificacion = async (usuario, mensaje, tipo) => {
  return await Notificacion.create({ usuario, mensaje, tipo });
};
