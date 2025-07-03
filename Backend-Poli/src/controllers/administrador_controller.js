import Estudiante from "../models/Estudiante.js";

const obtenerEstudiantes = async (req, res) => {
    const estudianteBDD = await Estudiante.find();
    if (estudianteBDD.length === 0) {
        return res.status(404).json({ msg: "Error al obtener estudiante" })
    }

    const estudiantes = estudianteBDD.map((estudiante) => {
        const { _id, nombre, apellido, telefono, direccion, rol } = estudiante
        return { _id, nombre, apellido, telefono, direccion, rol }
    })

    res.status(200).json(estudiantes)

}

const cambiarRolAVendedor = async (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;
    if (!['estudiante', 'vendedor'].includes(rol)) {
        return res.status(400).json({ msg: 'Rol no válido' });
    }
    const usuario = await Estudiante.findById(id);
    if (!usuario) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    if (usuario.rol === rol) {
        return res.status(400).json({ msg: `El usuario ya tiene el rol ${rol}` });
    }

    usuario.rol = rol;
    await usuario.save();

    res.json({ msg: 'Rol actualizado correctamente' });

}



export {
    obtenerEstudiantes,
    cambiarRolAVendedor
}

