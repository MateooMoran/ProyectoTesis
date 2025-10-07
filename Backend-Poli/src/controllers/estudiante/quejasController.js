import QuejasSugerencias from "../../models/QuejasSugerencias.js";
import Estudiante from "../../models/Estudiante.js";
import Notificacion from "../../models/Notificacion.js";
import mongoose from "mongoose";

// Crear queja o sugerencia
export const crearQuejasSugerencias = async (req, res) => {
  try {
    const { tipo, mensaje } = req.body;
    if (!tipo || !mensaje) return res.status(400).json({ msg: "Todos los campos son obligatorios" });

    const nueva = new QuejasSugerencias({ tipo, mensaje, usuario: req.estudianteBDD._id });

    const notificacion = new Notificacion({ usuario: req.estudianteBDD._id, mensaje: `Tu ${tipo} ha sido registrada correctamente.`, tipo: "sistema" });

    const admin = await Estudiante.findOne({ rol: "admin" });
    const notificacionAdmin = new Notificacion({
      usuario: admin._id,
      mensaje: `Nuevo mensaje recibido del tipo (${tipo.toUpperCase()}) del usuario: ${req.estudianteBDD.nombre} ${req.estudianteBDD.apellido}`,
      tipo: "sistema"
    });

    await notificacionAdmin.save();
    await notificacion.save();
    await nueva.save();

    res.status(200).json({ msg: "Queja/Sugerencia enviada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creando queja/sugerencia", error: error.message });
  }
};

// Visualizar quejas y sugerencias del usuario
export const visualizarQuejasSugerencias = async (req, res) => {
  try {
    const datos = await QuejasSugerencias.find({ usuario: req.estudianteBDD._id })
      .populate("usuario", "nombre apellido telefono rol");

    if (!datos.length) return res.status(404).json({ msg: "No se encontraron registros" });
    res.status(200).json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo quejas/sugerencias", error: error.message });
  }
};

// Eliminar queja o sugerencia
export const eliminarQuejaSugerencia = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID inválido" });

    const queja = await QuejasSugerencias.findById(id);
    if (!queja) return res.status(404).json({ msg: "Queja/Sugerencia no encontrada" });
    if (!queja.usuario.equals(req.estudianteBDD._id)) return res.status(403).json({ msg: "No autorizado para eliminar esta queja/sugerencia" });

    await queja.deleteOne();
    res.status(200).json({ msg: "Queja/Sugerencia eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error eliminando queja/sugerencia", error: error.message });
  }
};
