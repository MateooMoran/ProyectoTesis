import Categoria from "../../models/Categoria.js";
import Producto from "../../models/Producto.js";
import mongoose from "mongoose";

// Ver todas las categorías
export const verCategorias = async (req, res) => {
  try {
    const verCategoriasBDD = await Categoria.find().select('_id nombreCategoria');
    res.status(200).json(verCategoriasBDD);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo categorías", error: error.message });
  }
};

// Ver todos los productos disponibles
export const verProductos = async (req, res) => {
  try {
    const productos = await Producto.find({ disponible: true })
      .select('nombreProducto precio imagen stock categoria estado descripcion')
      .populate('categoria', 'nombreCategoria _id');
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo productos", error: error.message });
  }
};

// Ver producto por ID
export const verProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de producto inválido" });

    const producto = await Producto.findById(id)
      .populate('categoria', 'nombreCategoria _id')
      .populate({ path: "vendedor", select: "nombre apellido" })
      .select("-createdAt -updatedAt -__v");

    if (!producto) return res.status(404).json({ msg: "Producto no encontrado" });
    res.status(200).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo producto", error: error.message });
  }
};

// Buscar productos por query
export const buscarProductos = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ msg: "Consulta de búsqueda requerida" });

    const productos = await Producto.find({
      $or: [
        { nombreProducto: new RegExp(query, 'i') },
        { descripcion: new RegExp(query, 'i') }
      ],
      disponible: true
    })
      .select('nombreProducto precio imagen stock categoria estado descripcion')
      .populate('categoria', 'nombreCategoria _id');

    if (!productos.length) return res.status(404).json({ msg: "No se encontraron productos" });
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error buscando productos", error: error.message });
  }
};

// Ver productos por categoría
export const verProductosPorCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de categoría inválido" });

    const productos = await Producto.find({ categoria: id, disponible: true })
      .select('nombreProducto precio imagen stock categoria estado descripcion')
      .populate('categoria', 'nombreCategoria _id');

    if (!productos.length) return res.status(404).json({ msg: "No se encontraron productos en esta categoría" });
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo productos por categoría", error: error.message });
  }
};
