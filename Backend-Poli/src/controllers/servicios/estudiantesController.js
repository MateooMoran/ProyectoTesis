import Estudiante from "../../models/Estudiante.js";

// Buscar estudiantes por nombre para el chat
// Los administradores, estudiantes y vendedores pueden usar el chat
// PERO los administradores NO aparecen en los resultados de búsqueda
export const buscarEstudiantePorNombre = async (req, res) => {
    try {
        const { nombre } = req.query;

        if (!nombre) {
            return res.status(400).json({ msg: "Debe proporcionar un nombre" });
        }

        // Buscar usuarios excluyendo a los admins de los resultados
        const estudiantes = await Estudiante.find({
            nombre: { $regex: nombre, $options: 'i' },
            rol: { $ne: 'admin' } // Excluir administradores de la búsqueda
        }).select('nombre apellido rol');

        if (!estudiantes.length) {
            return res.status(404).json({ msg: "No se encontraron estudiantes con ese nombre" });
        }

        res.status(200).json(estudiantes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};
