import Estudiante from "../models/Estudiante.js";


const buscarEstudiantePorNombre = async (req, res) => {
    try {
        const { nombre, apellido } = req.query;

        if (!nombre && !apellido) {
            return res.status(400).json({ msg: "Debe proporcionar al menos un nombre o apellido" });
        }

        const condiciones = [];

        if (nombre) {
            condiciones.push({ nombre: { $regex: nombre, $options: 'i' } });
        }
        if (apellido) {
            condiciones.push({ apellido: { $regex: apellido, $options: 'i' } });
        }

        const estudiantes = await Estudiante.find({
            $or: condiciones,
            rol: { $ne: 'admin' },
        }).select('nombre apellido rol')
        if (!estudiantes || estudiantes.length === 0) {
            return res.status(404).json({ msg: "No se encontraron estudiantes con esos datos" });
        }

        return res.status(200).json(estudiantes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Error interno del servidor" });
    }
};




export {
    buscarEstudiantePorNombre

}
