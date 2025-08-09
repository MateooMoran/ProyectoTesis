import Categoria from "../models/Categoria.js";
import Producto from "../models/Producto.js";
import { v2 as cloudinary } from 'cloudinary'
import Notificacion from "../models/Notificacion.js";
import Orden from "../models/Orden.js";
import mongoose from 'mongoose';

// CATEGORIAS

const crearCategoria = async (req, res) => {
    const { nombreCategoria } = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Debe llenar el campo" })

    const verificarCategoriaBDD = await Categoria.findOne({ nombreCategoria: { $regex: `^${nombreCategoria}$`, $options: "i" } })
    if (verificarCategoriaBDD) return res.status(400).json({ msg: "Lo sentimos esa categoria ya se encuentra creado" });

    const nuevaCategoria = new Categoria({ nombreCategoria })
    await nuevaCategoria.save()
    res.status(200).json({ msg: "Categoría creada correctamente" })
}

const listarCategorias = async (req, res) => {
    const categorias = await Categoria.find().select('_id nombreCategoria');
    res.status(200).json(categorias);
};

const eliminarCategoria = async (req, res) => {
    const { id } = req.params;

    const productos = await Producto.find({ categoria: id });
    if (productos.length > 0) { return res.status(400).json({ msg: "No se puede eliminar porque hay productos asociados" }); }
    const eliminar = await Categoria.findByIdAndDelete(id);
    if (!eliminar) return res.status(404).json({ msg: "Categoría no encontrada" });

    res.status(200).json({ msg: "Categoría eliminada correctamente" });
};

// PRODUCTOS

const crearProducto = async (req, res) => {
    try {
        const { precio, stock, categoria } = req.body
        if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Debe llenar todo los campo" })
        if (!mongoose.Types.ObjectId.isValid(categoria)) {
            return res.status(400).json({ msg: 'ID de categoría no válido' });
        }
        if (precio < 0 || stock < 0) {
            return res.status(400).json({ msg: "Precio y stock deben ser positivos" });
        }

        const nuevoProducto = new Producto({
            ...req.body,
            vendedor: req.estudianteBDD._id,
            estado: "disponible",
            activo: true,
        });
        if (req.files?.imagen) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'ImagenesProductos' })
            nuevoProducto.imagen = secure_url
            nuevoProducto.imagenID = public_id
            const fs = require('fs-extra');

            await fs.unlink(req.files.imagen.tempFilePath)
        }

        if (req.body?.imagenIA) {
            const base64Data = req.body.imagenIA.replace(/^data:image\/\w+;base64,/, '')
            const buffer = Buffer.from(base64Data, 'base64')

            const { secure_url } = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: 'ImagenesProductosIA', resource_type: 'auto' }, (error, response) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(response)
                    }
                })
                stream.end(buffer)
            })
            nuevoProducto.imagenIA = secure_url

        }

        await nuevoProducto.save()
        res.status(200).json({ msg: "Producto creado correctamente" })
    } catch (error) {
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
}

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombreProducto, precio, stock, descripcion, imagen, categoria, estado, activo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'ID de producto no válido' });
    }

    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Debe llenar todos los campos" });
    }
    if (!mongoose.Types.ObjectId.isValid(categoria)) {
        return res.status(400).json({ msg: 'ID de categoría no válido' });
    }

    if (precio < 0 || stock < 0) {
        return res.status(400).json({ msg: "Precio y stock deben ser positivos" });
    }
    const producto = await Producto.findOne({ _id: id, vendedor: req.estudianteBDD._id });

    if (!producto)
        return res.status(403).json({ msg: "Producto no encontrado o sin permisos" });


    producto.nombreProducto = nombreProducto ?? producto.nombreProducto;
    producto.precio = precio ?? producto.precio;
    producto.stock = stock ?? producto.stock;
    producto.descripcion = descripcion ?? producto.descripcion;
    producto.categoria = categoria ?? producto.categoria;
    producto.estado = estado ?? producto.estado;
    producto.activo = activo ?? producto.activo;

    if (req.files?.imagen) {
        if (producto.imagenID) {
            await cloudinary.uploader.destroy(producto.imagenID);
        }

        const { secure_url, public_id } = await cloudinary.uploader.upload(
            req.files.imagen.tempFilePath,
            { folder: 'ImagenesProductos' }
        );

        producto.imagen = secure_url;
        producto.imagenID = public_id;

        await fs.unlink(req.files.imagen.tempFilePath);
    }

    if (req.body?.imagenIA) {
        if (producto.imagenID) {
            await cloudinary.uploader.destroy(producto.imagenID);
        }

        const base64Data = req.body.imagenIA.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const { secure_url, public_id } = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'ImagenesProductosIA', resource_type: 'auto' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(buffer);
        });

        producto.imagenIA = secure_url;
        producto.imagenID = public_id;
    }

    await producto.save();

    res.status(200).json({ msg: "Producto actualizado correctamente" });
};


const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'ID de producto no válido' });
    }
    const producto = await Producto.findOne({ _id: id, vendedor: req.estudianteBDD._id });
    if (!producto) { return res.status(404).json({ msg: "Producto no encontrado o no correspondiente" }) }

    await producto.deleteOne();
    res.status(200).json({ msg: "Producto eliminado correctamente" });
};


const listarProducto = async (req, res) => {
    const productos = await Producto.find({ vendedor: req.estudianteBDD._id })
        .select("-createdAt -updatedAt -__v")
        .populate('categoria', 'nombreCategoria');

    if (!productos || productos.length === 0) {
        return res.status(404).json({ msg: "No existen productos registrados" });
    }

    res.status(200).json(productos);
};

const visualizarProductoCategoria = async (req, res) => {
    const productos = await Producto.find({ vendedor: req.estudianteBDD._id, categoria: req.params.id }).select("-createdAt -updatedAt -__v").populate("categoria", "nombreCategoria");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ msg: 'ID de categoría no válido' });
    }
    if (!productos || productos.length === 0) {
        return res.status(404).json({ msg: "No hay productos registrados en esta categoría" });
    }

    res.status(200).json(productos);
};

// Visualizar historial de ventas
const visualizarHistorialVentasVendedor = async (req, res) => {
    const historial = await Orden.find({ vendedor: req.estudianteBDD._id })
        .populate("comprador", "nombre apellido")
        .populate("productos.producto", "nombreProducto precio imagen estado activo vendidos")
        .sort({ createdAt: -1 });

    if (!historial.length) {
        return res.status(404).json({ msg: "No tienes ventas registradas" });
    }

    res.status(200).json(historial);
};

// Notificaciones

const verNotificaciones = async (req, res) => {
    const notificaciones = await Notificacion.find({ usuario: req.estudianteBDD._id })
        .populate("usuario", "nombre apellido telefono rol")
        .sort({ createdAt: -1 });

    if (!notificaciones.length) {
        return res.status(404).json({ msg: "No tienes notificaciones" });
    }
    res.status(200).json(notificaciones);
};

const marcarComoLeida = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'ID de notificación no válido' });
    }
    const noti = await Notificacion.findOne({ _id: id, usuario: req.estudianteBDD._id });
    if (!noti) return res.status(404).json({ msg: "Notificación no encontrada" });

    noti.leido = true;
    await noti.save();
    res.status(200).json({ msg: "Notificación marcada como leída" });
};

const eliminarNotificacion = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: 'ID de notificación no válido' });
    }
    const eliminar = await Notificacion.findOneAndDelete({ _id: id, usuario: req.estudianteBDD._id });
    if (!eliminar) return res.status(404).json({ msg: "No se encontró la notificación" });

    res.status(200).json({ msg: "Notificación eliminada" });
};
export {

    crearCategoria,
    listarCategorias,
    eliminarCategoria,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    listarProducto,
    visualizarProductoCategoria,
    visualizarHistorialVentasVendedor,
    verNotificaciones,
    marcarComoLeida,
    eliminarNotificacion
}
