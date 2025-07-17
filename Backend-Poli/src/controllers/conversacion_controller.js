import Estudiante from "../models/Estudiante.js";

const buscarEstudiantePorNombre = async (req, res) => {
    const { nombre } = req.query


    const estudiantes = await Estudiante.find({
        nombre: { $regex: nombre, $options: 'i' }
    })

    res.status(200).json(estudiantes)
    if (!estudiantes || estudiantes.length === 0) {
        return res.status(404).json({ msg: "No se encontraron estudiantes con ese nombre" });
    }

}

export default buscarEstudiantePorNombre