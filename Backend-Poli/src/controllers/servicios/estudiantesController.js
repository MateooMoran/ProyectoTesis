import Estudiante from "../../models/Estudiante.js";

<<<<<<< HEAD
// Buscar estudiantes por nombre y/o apellido, excluyendo admins
export const buscarEstudiantePorNombre = async (req, res) => {
    try {
        const { nombre, apellido } = req.query;

        if (!nombre && !apellido) {
            return res.status(400).json({ msg: "Debe proporcionar al menos un nombre o apellido" });
        }

        const condiciones = [];
        if (nombre) condiciones.push({ nombre: { $regex: nombre, $options: 'i' } });
        if (apellido) condiciones.push({ apellido: { $regex: apellido, $options: 'i' } });

        const estudiantes = await Estudiante.find({
            $or: condiciones,
=======
// Buscar estudiantes por nombre, excluyendo admins
export const buscarEstudiantePorNombre = async (req, res) => {
    try {
        const { nombre } = req.query;

        if (!nombre) {
            return res.status(400).json({ msg: "Debe proporcionar un nombre" });
        }

        const estudiantes = await Estudiante.find({
            nombre: { $regex: nombre, $options: 'i' },
>>>>>>> c0edcfe1c1985dfaada7d979b8075f13d4409641
            rol: { $ne: 'admin' }
        }).select('nombre apellido rol');

        if (!estudiantes.length) {
<<<<<<< HEAD
            return res.status(404).json({ msg: "No se encontraron estudiantes con esos datos" });
=======
            return res.status(404).json({ msg: "No se encontraron estudiantes con ese nombre" });
>>>>>>> c0edcfe1c1985dfaada7d979b8075f13d4409641
        }

        res.status(200).json(estudiantes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};
