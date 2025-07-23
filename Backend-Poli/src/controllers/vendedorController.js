import Categoria from "../models/Categoria.js";
import Producto from "../models/Producto.js";

const crearCategoria = async (req, res) => {
    const { nombreCategoria } = req.body

    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Debe llenar todo los campo" })

    const verificarCategoriaBDD = await Categoria.findOne({ nombreCategoria })
    if (verificarCategoriaBDD) return res.status(400).json({ msg: "Lo sentimos esa categoria ya se encuentra creado" });

    const nuevaCategoria = new Categoria(req.body)
    await nuevaCategoria.save()
    res.status(200).json({ msg: "Categoría creada correctamente" })
}

const listarCategorias = async (req, res) => {
    const categorias = await Categoria.find().select('_id nombreCategoria');
    res.status(200).json(categorias);
};

const eliminarCategoria = async (req, res) => {
    const { id } = req.params
    const productoValidar = await Producto.find({ categoria: id })
    if (productoValidar.length > 0) return res.status(400).json({ msg: "No se puede eliminiar debido a que se encuentra registros en esa categoria" })
    const eliminar = await Categoria.findByIdAndDelete(id)
    if (!eliminar) return res.status(400).json({ msg: "No se encuentra esa categoria" })
    res.status(200).json({ msg: "Categoria eliminada correctamente" })
}

const crearProducto = async (req, res) => {
    const { precio } = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Debe llenar todo los campo" })

    if (precio < 0) {
        return res.status(400).json({ msg: "Ingresa solo valores positivos" })
    }

    const nuevoProducto = new Producto({
        ...req.body,
        vendedor: req.estudianteBDD._id,
        estado: "disponible",
        activo: true,
    });

    await nuevoProducto.save()
    res.status(200).json({ msg: "Producto creado correctamente" })

}

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombreProducto, precio, stock, descripcion, imagen, categoria, estado, activo } = req.body;
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Debe llenar todo los campo" });

    const producto = await Producto.findOne({ _id: id, vendedor: req.estudianteBDD._id });
    
    if (!producto)
        return res.status(403).json({ msg: "Producto no encontrado" }) //no tiene permiso para actualizar este producto

    if (precio < 0 || stock < 0) {
        return res.status(400).json({ msg: "Precio y/o stock deben ser positivos" });
    }

    producto.nombreProducto = nombreProducto ?? producto.nombreProducto;
    producto.precio = precio ?? producto.precio;
    producto.stock = stock ?? producto.stock;
    producto.descripcion = descripcion ?? producto.descripcion;
    producto.imagen = imagen ?? producto.imagen;
    producto.categoria = categoria ?? producto.categoria;
    producto.estado = estado ?? producto.estado;
    producto.activo = activo ?? producto.activo;

    await producto.save();

    res.status(200).json({ msg: "Producto actualizado correctamente" });
};



const eliminarProducto = async (req, res) => {
    const { id } = req.params;

    const producto = await Producto.findOne({ _id: id, vendedor: req.estudianteBDD._id });
    if (!producto) {
        return res.status(404).json({ msg: "Producto no encontrado" });
    }

    await producto.deleteOne();
    res.status(200).json({ msg: "Producto eliminado correctamente" });
};


const listarProducto = async (req, res) => {
    const productos = await Producto.find({
        vendedor: req.estudianteBDD._id,
    }).select("-createdAt -updatedAt -__v")
        .populate('categoria', 'nombreCategoria');

    if (!productos || productos.length === 0) {
        return res.status(404).json({ msg: "No existen productos registrados" });
    }

    res.status(200).json(productos);
};

const visualizarProductoCategoria = async (req, res) => {
    const productos = await Producto.find({ vendedor: req.estudianteBDD._id, categoria: req.params.id }).select("-createdAt -updatedAt -__v").populate("categoria", "nombreCategoria");

    if (!productos || productos.length === 0) {
        return res.status(404).json({ msg: "No hay productos registrados en esta categoría" });
    }

    res.status(200).json(productos);
};


export {

    crearCategoria,
    listarCategorias,
    eliminarCategoria,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    listarProducto,
    visualizarProductoCategoria
}
