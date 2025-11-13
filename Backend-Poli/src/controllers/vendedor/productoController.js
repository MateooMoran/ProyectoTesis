import Producto from "../../models/Producto.js";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import fs from 'fs-extra';
import { generarEmbedding } from "../../utils/embeddings.js";
import Categoria from "../../models/Categoria.js";

// Helper para eliminar archivos temporales
const safeUnlink = async (path) => {
  try {
    if (!path) return;
    const exists = await fs.pathExists(path);
    if (exists) await fs.unlink(path);
  } catch (err) {
    console.warn(`No se pudo eliminar archivo temporal ${path}:`, err.message || err);
  }
};

// Crear un producto
export const crearProducto = async (req, res) => {
  try {
    const { nombreProducto, categoria } = req.body;

    if (!mongoose.isValidObjectId(categoria)) return res.status(400).json({ msg: "ID de categoría no válido" });
    // Validar que la categoria exista en la base de datos
    const categoriaExistente = await Categoria.findById(categoria);
    if (!categoriaExistente) {
      return res.status(400).json({ msg: "La categoría proporcionada no existe" });
    }

    // Validar nombre único en toda la DB
    const existeProducto = await Producto.findOne({ nombreProducto: nombreProducto.trim() });
    if (existeProducto) {
      return res.status(400).json({ msg: "Ya existe un producto con ese nombre" });
    }

    const nuevoProducto = new Producto({
      ...req.body,
      vendedor: req.estudianteBDD._id,
      estado: "disponible",
      activo: true,
    });

    // Imagen normal
    if (req.files?.imagen) {
      const tempPath = req.files.imagen.tempFilePath;
      try {
        const { secure_url, public_id } = await cloudinary.uploader.upload(tempPath, { folder: 'ImagenesProductos' });
        nuevoProducto.imagen = secure_url;
        nuevoProducto.imagenID = public_id;
      } catch (err) {
        console.error("Error subiendo imagen a Cloudinary:", err);
        throw err;
      } finally {
        await safeUnlink(tempPath);
      }
    }

    // Imagen IA
    if (req.body?.imagenIA) {
      const base64Data = req.body.imagenIA.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const { secure_url } = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'ImagenesProductosIA', resource_type: 'auto' }, (error, response) => {
          if (error) reject(error)
          else resolve(response)
        })
        stream.end(buffer)
      })
      nuevoProducto.imagenIA = secure_url
    }

    // Generar embedding
    try {
      nuevoProducto.embedding = await generarEmbedding(`${nuevoProducto.nombreProducto} ${nuevoProducto.descripcion}`);
    } catch (err) {
      console.warn("No se pudo generar embedding:", err.message)
    }

    await nuevoProducto.save();
    res.status(200).json({ msg: "Producto creado correctamente" });
  } catch (error) {
    console.error("Error crearProducto:", error);
    res.status(500).json({ msg: "Error interno del servidor", error: error.message });
  }
};

// Actualizar un producto
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreProducto,categoria } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de producto inválido" });
    }

    const producto = await Producto.findOne({ _id: id, vendedor: req.estudianteBDD._id });
    if (!producto) return res.status(403).json({ msg: "Producto no encontrado o sin permisos" });

    // Validar nombre único si se cambia
    if (nombreProducto && nombreProducto.trim() !== producto.nombreProducto) {
      const existeProducto = await Producto.findOne({ nombreProducto: nombreProducto.trim() });
      if (existeProducto) {
        return res.status(400).json({ msg: "Ya existe un producto con ese nombre" });
      }
      producto.nombreProducto = nombreProducto.trim();
    }
    const categoriaExistente = await Categoria.findById(categoria);
    if (!categoriaExistente) {
      return res.status(400).json({ msg: "La categoría proporcionada no existe" });
    }

    // Actualizar otros campos
    producto.precio = req.body.precio ?? producto.precio;
    producto.stock = req.body.stock ?? producto.stock;
    producto.descripcion = req.body.descripcion ?? producto.descripcion;
    producto.categoria = req.body.categoria ?? producto.categoria;

    // Si el vendedor actualiza stock el producto se vuelve disponible
    if (producto.stock > 0) {
      producto.estado = "disponible";
      producto.activo = true;
    } else if (producto.stock <= 0) {
      producto.estado = "no disponible";
      producto.activo = false;
    } else {
      producto.estado = estado ?? producto.estado;
      producto.activo = activo ?? producto.activo;
    }


    // Imagen normal
    if (req.files?.imagen) {
      const tempPath = req.files.imagen.tempFilePath;
      try {
        if (producto.imagenID) {
          try {
            await cloudinary.uploader.destroy(producto.imagenID);
          } catch (e) {
            console.warn(`No se pudo destruir imagen anterior en Cloudinary ${producto.imagenID}:`, e.message || e);
          }
        }

        const { secure_url, public_id } = await cloudinary.uploader.upload(tempPath, { folder: 'ImagenesProductos' });
        producto.imagen = secure_url;
        producto.imagenID = public_id;
      } catch (err) {
        console.error("Error subiendo imagen a Cloudinary:", err);
        throw err;
      } finally {
        await safeUnlink(tempPath);
      }
    }

    // Imagen IA
    if (req.body?.imagenIA) {
      if (producto.imagenID) await cloudinary.uploader.destroy(producto.imagenID);
      const base64Data = req.body.imagenIA.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const { secure_url, public_id } = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'ImagenesProductosIA', resource_type: 'auto' },
          (error, result) => error ? reject(error) : resolve(result)
        );
        stream.end(buffer);
      });
      producto.imagenIA = secure_url;
      producto.imagenID = public_id;
    }


    // Actualizar embedding
    try {
      producto.embedding = await generarEmbedding(`${producto.nombreProducto} ${producto.descripcion}`);
    } catch (err) {
      console.warn("No se pudo generar embedding:", err.message);
    }

    await producto.save();
    res.status(200).json({ msg: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizarProducto:", error);
    res.status(500).json({ msg: "Error actualizando producto", error: error.message });
  }
};

// Eliminar producto
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de producto inválido" });
    }
    const producto = await Producto.findOne({ _id: id, vendedor: req.estudianteBDD._id });
    if (!producto) return res.status(404).json({ msg: "Producto no encontrado o sin autorización para eliminar" });

    try {
      if (producto.imagenID) {
        await cloudinary.uploader.destroy(producto.imagenID, { resource_type: 'image' });
      }
    } catch (err) {
      console.warn(`No se pudo eliminar asset Cloudinary ${producto.imagenID}:`, err.message || err);
    }

    await producto.deleteOne();

    return res.status(200).json({ msg: "Producto eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error eliminando producto", error: error.message });
  }
};

// Listar todos los productos del vendedor
export const listarProducto = async (req, res) => {
  try {
    const productos = await Producto.find({
      vendedor: req.estudianteBDD._id,
      $or: [
        { eliminadoPorVendedor: false },
        { eliminadoPorVendedor: { $exists: false } }
      ]
    })
      .select("-__v -createdAt -updatedAt -embedding -descripcionNormalizada -nombreNormalizado")
      .populate("categoria", "nombreCategoria")
      .sort({ createdAt: -1 });

    if (!productos.length) {
      return res.status(404).json({ msg: "No hay productos registrados" });
    }

    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error listando productos", error: error.message });
  }
};

