import QuejasSugerencias from "../../models/QuejasSugerencias.js";
import Notificacion from "../../models/Notificacion.js";
import { crearNotificacionSocket } from "../../utils/notificaciones.js";
import mongoose from "mongoose";

// Listar todas las quejas y sugerencias
export const listarTodasLasQuejasSugerencias = async (req, res) => {
  try {
    const quejas = await QuejasSugerencias.find()
      .populate("usuario", "nombre apellido telefono rol")
      .sort({ createdAt: -1 });

    if (quejas.length === 0) return res.status(404).json({ msg: "No hay quejas o sugerencias registradas" });

    res.status(200).json(quejas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo quejas/sugerencias", error: error.message });
  }
};

// Responder una queja o sugerencia
export const responderQuejaSugerencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { respuesta } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de queja/sugerencia no válido" });
    if (!respuesta || respuesta.trim() === "") return res.status(400).json({ msg: "La respuesta no puede estar vacía" });

    const queja = await QuejasSugerencias.findById(id);
    if (!queja) return res.status(404).json({ msg: "Queja/Sugerencia no encontrada" });

    queja.respuesta = respuesta;
    queja.estado = "resuelto";

    // Crear notificación y emitir en tiempo real
    await crearNotificacionSocket(req, queja.usuario, `Tu ${queja.tipo} ha sido respondida: "${respuesta}"`, "sistema");

    await queja.save();
    res.status(200).json({ msg: "Respuesta enviada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error respondiendo queja/sugerencia", error: error.message });
  }
};


// Eliminar una queja o sugerencia solo si está resuelta
export const eliminarQuejaSugerencia = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) 
      return res.status(400).json({ msg: "ID de queja/sugerencia no válido" });

    const queja = await QuejasSugerencias.findById(id);
    if (!queja) return res.status(404).json({ msg: "Queja/Sugerencia no encontrada" });

    // Validar que esté resuelta
    if (queja.estado !== "resuelto") 
      return res.status(400).json({ msg: "Solo se pueden eliminar quejas/sugerencias resueltas" });

    await QuejasSugerencias.findByIdAndDelete(id);

    res.status(200).json({ msg: "Queja/Sugerencia eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error eliminando queja/sugerencia", error: error.message });
  }
};