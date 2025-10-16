import Estudiante from "../../models/Estudiante.js";
import mongoose from "mongoose";

// Agregar o quitar favorito (toggle)
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

// Ver todos los favoritos
export const verFavoritos = async (req, res) => {
  try {
    const estudianteId = req.estudianteBDD._id;

    const estudiante = await Estudiante.findById(estudianteId).populate({
      path: "favoritos", 
      select: "_id nombreProducto descripcion categoria estado imagen"
    });

    if (!estudiante) {
      return res.status(404).json({ msg: "Estudiante no encontrado" });
    }

    res.status(200).json({ favoritos: estudiante.favoritos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo favoritos", error: error.message });
  }
};

// Eliminar un favorito específico
export const eliminarFavorito = async (req, res) => {
  try {
    const estudianteId = req.estudianteBDD._id;
    const { id: productoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productoId)) {
      return res.status(400).json({ msg: "ID de producto inválido" });
    }

    const estudiante = await Estudiante.findById(estudianteId);
    if (!estudiante) {
      return res.status(404).json({ msg: "Estudiante no encontrado" });
    }

    const index = estudiante.favoritos.findIndex(favId => favId.toString() === productoId);

    if (index === -1) {
      return res.status(404).json({ msg: "Producto no está en favoritos" });
    }

    estudiante.favoritos.splice(index, 1);
    await estudiante.save();

    res.status(200).json({ msg: "Producto eliminado de favoritos", favoritos: estudiante.favoritos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error eliminando favorito", error: error.message });
  }
};
