import Estudiante from "../../models/Estudiante.js";
import mongoose from "mongoose";

export const seleccionarFavorito = async (req, res) => {
  try {
    const estudianteId = req.estudianteBDD._id;
    const { id: productoId } = req.params;

    // Validar ID del producto
    if (!mongoose.Types.ObjectId.isValid(productoId)) {
      return res.status(400).json({ msg: "ID de producto inválido" });
    }

    const estudiante = await Estudiante.findById(estudianteId);
    if (!estudiante) {
      return res.status(404).json({ msg: "Estudiante no encontrado" });
    }

    if (!Array.isArray(estudiante.favoritos)) estudiante.favoritos = [];

    const index = estudiante.favoritos.findIndex(favId => favId.toString() === productoId);

    let msg;
    if (index === -1) {
      estudiante.favoritos.push(productoId);
      msg = "Producto agregado a favoritos";
    } else {
      estudiante.favoritos.splice(index, 1);
      msg = "Producto removido de favoritos";
    }

    await estudiante.save();
    res.status(200).json({ msg, favoritos: estudiante.favoritos });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error actualizando favoritos", error: error.message });
  }
};