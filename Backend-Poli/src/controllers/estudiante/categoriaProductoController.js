import Categoria from "../../models/Categoria.js";
import Producto from "../../models/Producto.js";
import mongoose from "mongoose";

// Ver todas las categorías
export const verCategorias = async (req, res) => {
  try {
    const verCategoriasBDD = await Categoria.find().select('_id nombreCategoria').lean();
    res.status(200).json(verCategoriasBDD);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo categorías", error: error.message });
  }
};

// Ver todos los productos 
export const verProductos = async (req, res) => {
  try {
    const productos = await Producto.find({ estado: "disponible", stock: { $gt: 0 }, activo: true })
      .select('nombreProducto precio imagen imagenIA modelo stock categoria estado descripcion')
      .populate('categoria', 'nombreCategoria _id')
      .populate({ path: "vendedor", select: "_id nombre apellido" })
      .sort({ createdAt: -1 });

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
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ msg: "ID de producto inválido" });

    const producto = await Producto.findOne({ _id: id, estado: "disponible", stock: { $gt: 0 }, activo: true })
      .populate('categoria', 'nombreCategoria _id')
      .populate({ path: "vendedor", select: "_id nombre apellido" })
      .select("-createdAt -updatedAt -__v")
      .lean();


    if (!producto) return res.status(404).json({ msg: "Producto no encontrado o sin stock" });
    res.status(200).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo producto", error: error.message });
  }
};

// Buscar productos por texto normalizado
export const buscarProductos = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ msg: "Consulta de búsqueda requerida" });
    }

    const normalizar = (t) =>
      t?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const queryNormalizada = normalizar(query);

    const productos = await Producto.find({
      estado: "disponible",
      stock: { $gt: 0 },
      activo: true,
      $or: [
        { nombreNormalizado: { $regex: queryNormalizada, $options: "i" } },
        { descripcionNormalizada: { $regex: queryNormalizada, $options: "i" } },
      ],
    })
      .select('nombreProducto precio imagen imagenIA modelo stock categoria estado descripcion')
      .populate("categoria", "nombreCategoria _id")
      .lean();

    if (!productos || productos.length === 0) {
      return res.status(404).json({ msg: `Sin resultados para "${query}"` });
    }

    res.status(200).json(productos);
  } catch (error) {
    console.error("Error buscando productos:", error);
    res.status(500).json({ msg: "Error buscando productos", error: error.message });
  }
};

// Ver productos por categoría
export const verProductosPorCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ msg: "ID de categoría inválido" });

    const productos = await Producto.find({
      categoria: id,
      estado: "disponible",
      stock: { $gt: 0 },
      activo: true
    })
      .select('nombreProducto precio imagen imagenIA modelo stock categoria estado descripcion')
      .populate('categoria', 'nombreCategoria _id')
      .populate({ path: "vendedor", select: "_id nombre apellido" })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo productos por categoría", error: error.message });
  }
};
