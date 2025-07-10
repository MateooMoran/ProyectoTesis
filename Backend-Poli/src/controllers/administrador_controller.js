import { sendMailToAssignSeller } from "../config/nodemailer.js";
import Estudiante from "../models/Estudiante.js";


const obtenerEstudiantes = async (req, res) => {
    const estudianteBDD = await Estudiante.find({ rol: { $in: ['estudiante', 'vendedor'] } }).select('_id nombre apellido telefono direccion rol');
    if (!estudianteBDD || estudianteBDD.length === 0) {
        return res.status(404).json({ msg: "No hay estudiantes registrados" })
    }
    res.status(200).json(estudianteBDD);
}


const cambiarRolAVendedor = async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;

    const usuario = await Estudiante.findById(id);
    if (!usuario) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    if (usuario.rol === rol) {
        return res.status(400).json({ msg: `El usuario ya tiene el rol ${rol}` });
    }


    usuario.rol = rol;
    sendMailToAssignSeller(usuario.email,usuario.nombre, usuario.rol);
    
    await usuario.save();

    res.json({ msg: 'Rol actualizado correctamente' });
}



export {
    obtenerEstudiantes,
    cambiarRolAVendedor
}

