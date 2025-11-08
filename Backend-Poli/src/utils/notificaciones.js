import Notificacion from "../models/Notificacion.js";




export const crearNotificacionSocket = async (ioOrReq, usuarioId, mensaje, tipo = "sistema") => {
  try {
    const notificacion = await Notificacion.create({ usuario: usuarioId, mensaje, tipo });
    const io = ioOrReq?.app?.get?.("io") || ioOrReq;

    if (io) {
      io.to(`user-${usuarioId}`).emit("notificacion:nueva", notificacion);
      console.log(` Notificación emitida a user-${usuarioId}`);
    }

    return notificacion;
  } catch (error) {
    console.error(" Error creando notificación:", error);
  }
};

