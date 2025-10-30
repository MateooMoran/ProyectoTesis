import Categoria from "../../models/Categoria.js";
import Producto from "../../models/Producto.js";
import mongoose from "mongoose";

// Crear una categoría
export const crearCategoria = async (req, res) => {
  try {
    let { nombreCategoria } = req.body;

    if (!nombreCategoria || !nombreCategoria.trim()) {
      return res.status(400).json({ msg: "Debe llenar el campo" });
    }

    const normalizarTexto = (texto) =>
      texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    const nombreNormalizado = normalizarTexto(nombreCategoria);

    const categorias = await Categoria.find();
    const existe = categorias.some(
      (cat) => normalizarTexto(cat.nombreCategoria) === nombreNormalizado
    );

    if (existe) {
      return res.status(400).json({ msg: "La categoría ya existe" });
    }

    const nuevaCategoria = new Categoria({ nombreCategoria });
    await nuevaCategoria.save();

    res.status(200).json({ msg: "Categoría creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error creando categoría", error: error.message });
  }
};

// Listar todas las categorías
export const listarCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find().select('_id nombreCategoria');
    res.status(200).json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error listando categorías", error: error.message });
  }
};

// Eliminar una categoría
export const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID inválido" });

    const productos = await Producto.find({ categoria: id });
    if (productos.length > 0) return res.status(400).json({ msg: "No se puede eliminar, hay productos asociados" });

    const eliminar = await Categoria.findByIdAndDelete(id);
    if (!eliminar) return res.status(404).json({ msg: "Categoría no encontrada" });

    res.status(200).json({ msg: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error eliminando categoría", error: error.message });
  }
};
