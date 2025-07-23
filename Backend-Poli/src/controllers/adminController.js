import { sendMailToAssignSeller } from "../config/nodemailer.js";
import Estudiante from "../models/Estudiante.js";
import Producto from "../models/Producto.js";


const obtenerUsuarios = async (req, res) => {
    const estudianteBDD = await Estudiante.find({ rol: { $in: ['estudiante', 'vendedor'] } }).select('_id nombre apellido telefono direccion rol');
    if (!estudianteBDD || estudianteBDD.length === 0) {
        return res.status(404).json({ msg: "No hay estudiantes registrados" })
    }
    res.status(200).json(estudianteBDD);
}


const cambioRol = async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;

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



export {
    obtenerUsuarios,
    cambioRol
}

