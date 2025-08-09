import { sendMailToAssignSeller } from "../config/nodemailer.js";
import Estudiante from "../models/Estudiante.js";
import Producto from "../models/Producto.js";
import QuejasSugerencias from "../models/QuejasSugerencias.js";
import Notificacion from "../models/Notificacion.js";
import mongoose from "mongoose";

// CAMBIO ROL 
const obtenerUsuarios = async (req, res) => {
    const estudianteBDD = await Estudiante.find({ rol: { $in: ['estudiante', 'vendedor'] } }).select('_id nombre apellido telefono direccion rol estado');
    if (!estudianteBDD || estudianteBDD.length === 0) {
        return res.status(404).json({ msg: "No hay estudiantes registrados" })
    }
    res.status(200).json(estudianteBDD);
}

const cambioRol = async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;
    if (!rol) {
        return res.status(400).json({ msg: "Rol es requerido" });
    }
    if (!id) {
        return res.status(400).json({ msg: "ID de usuario es requerido" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de usuario no válido" });
    }
    const usuario = await Estudiante.findById(id);

    if (!['vendedor', 'estudiante'].includes(rol)) {
        return res.status(400).json({ msg: 'Rol no válido' });
    }
    if (!usuario) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    if (usuario.rol === rol) {
        return res.status(400).json({ msg: `El usuario ya tiene el rol ${rol}` });
    }

    usuario.rol = rol;
    await usuario.save();

    if (rol === 'vendedor') {
        await Producto.updateMany({ vendedor: id, activo: false }, { $set: { activo: true } });
        console.log('Cambiado el rol y sus productos se encuentran activos')
    } else if (rol === 'estudiante') {
        await Producto.updateMany({ vendedor: id, activo: true }, { $set: { activo: false } });
        console.log('Cambiado el rol y sus productos se encuentran inactivos')
    }

    sendMailToAssignSeller(usuario.email, usuario.nombre, usuario.rol);
    res.json({ msg: 'Rol actualizado correctamente' });
}

// QUEJAS SUGERENCIAS

const listarTodasLasQuejasSugerencias = async (req, res) => {
    const quejas = await QuejasSugerencias.find()
        .populate("usuario", "nombre apellido telefono rol")
        .sort({ createdAt: -1 })
    if (quejas.length === 0) {
        return res.status(404).json({ msg: "No hay quejas o sugerencias registradas" });
    }
    res.status(200).json(quejas)
}

const responderQuejaSugerencia = async (req, res) => {
    const { id } = req.params
    const { respuesta } = req.body
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de queja/sugerencia no válido" });
    }
    if (!respuesta || respuesta.trim() === "") {
        return res.status(400).json({ msg: "La respuesta no puede estar vacía" });
    }

    const queja = await QuejasSugerencias.findById(id);
    if (!queja) return res.status(404).json({ msg: "Queja/Sugerencia no encontrada" });

    queja.respuesta = respuesta;
    queja.estado = "resuelto";

    await Notificacion.create({
        usuario: queja.usuario,
        mensaje: `Tu ${queja.tipo} ha sido respondida: "${respuesta}"`,
        tipo: "sistema"
    });

    await queja.save();

    res.status(200).json({ msg: "Respuesta enviada correctamente" });

}

// NOTIFICACIONES 

const listarNotificacionesAdmin = async (req, res) => {
    const adminId = req.estudianteBDD._id;
    const notificaciones = await Notificacion.find({ usuario: adminId })
        .populate("usuario", "nombre apellido telefono rol")
        .sort({ createdAt: -1 });

    res.status(200).json(notificaciones);
}

const marcarNotificacionLeida = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'ID de notifacion invalida' });
    }

    const notificacion = await Notificacion.findById(id);
    if (!notificacion) return res.status(404).json({ msg: "Notificación no encontrada" });

    notificacion.leido = true;
    await notificacion.save();

    res.status(200).json({ msg: "Notificación marcada como leída" });
};

export {
    obtenerUsuarios,
    cambioRol,
    listarTodasLasQuejasSugerencias,
    responderQuejaSugerencia,
    listarNotificacionesAdmin,
    marcarNotificacionLeida
}

