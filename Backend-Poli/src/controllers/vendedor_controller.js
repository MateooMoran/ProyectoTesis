import Categoria from "../models/Categoria.js";
import Producto from "../models/Producto.js";

const crearCategoria = async (req, res) => {
    const { nombreCategoria } = req.body

    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Debe llenar todo los campo" })

    const verificarCategoriaBDD = await Categoria.findOne({ nombreCategoria })
    if (verificarCategoriaBDD) return res.status(400).json({ msg: "Lo sentimos esa categoria ya se encuentra creado" });

    const nuevaCategoria = new Categoria(req.body)
    await nuevaCategoria.save()
    res.status(200).json({ msg: "Creado correctamente la categoria " })
}

const listarCategorias = async (req, res) => {
    const categorias = await Categoria.find().select('_id nombreCategoria');
    res.status(200).json(categorias);
};

const eliminarCategoria = async (req, res) => {
    const { id } = req.body
    const productoValidar = await Producto.find({ categoria: id })
    if (productoValidar.length > 0) return res.status(400).json({ msg: "No se puede eliminiar debido a que se encuentra registros en esa categoria" })
    const eliminar = await Categoria.findByIdAndDelete(id)
    if (!eliminar) return res.status(400).json({ msg: "No se encuentra esa categoria" })
    res.status(200).json({ msg: "Categoria eliminada correctamente" })
}

const crearProducto = async (req, res) => {
    const { precio } = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Debe llenar el campo" })

    if (precio < 0) {
        return res.status(400).json({ msg: "Ingresa solo valores positivos" })
    }

    const nuevoProducto = new Producto({
        ...req.body,
        vendedor: req.estudianteBDD._id
    });

    await nuevoProducto.save()
    res.status(200).json({ msg: "Creado correctamente el producto" })

}

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombreProducto, precio, stock, descripcion, imagen, categoria } = req.body;

    if (precio < 0 || stock < 0) {
        return res.status(400).json({ msg: "Precio y stock deben ser positivos" });
    }



    const producto = await Producto.findOne({ _id: id, vendedor: req.estudianteBDD._id });
    if (!producto) return res.status(403).json({ msg: "No tienes permiso para actualizar este producto o no existe" });
    

    producto.nombreProducto = nombreProducto ?? producto.nombreProducto;
    producto.precio = precio ?? producto.precio;
    producto.stock = stock ?? producto.stock;
    producto.descripcion = descripcion ?? producto.descripcion;
    producto.imagen = imagen ?? producto.imagen;
    producto.categoria = categoria ?? producto.categoria;

    await producto.save();

    res.status(200).json({ msg: "Producto actualizado correctamente" });
};


const eliminarProducto = async (req, res) => {
    const { id } = req.params;

    const producto = await Producto.findById(id);
    if (!producto) {
        return res.status(404).json({ msg: "Producto no encontrado" });
    }

    await producto.deleteOne();
    res.status(200).json({ msg: "Producto eliminado correctamente" });
};


const listarProducto = async (req, res) => {
    const producto = await Producto.find({ vendedor: req.estudianteBDD._id }).select("-createdAt -updatedAt -__v").populate('categoria', 'nombreCategoria')
    if (!producto) {
        return res.status(404).json({ msg: "No existen productos registrados" });
    }
    res.status(200).json(producto)
}

const visualizarCategoriaPorCategoria = async (req, res) => {
    const categoria = await Producto.find({ vendedor: req.estudianteBDD._id, categoria: req.params.id }).select("-createdAt -updatedAt -__v").populate("categoria", "nombreCategoria");

    if (!categoria) {
        return res.status(404).json({ msg: "No hay productos registrados en esta categoría" });
    }

    res.status(200).json(categoria);
};

export {

    crearCategoria,
    listarCategorias,
    eliminarCategoria,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    listarProducto,
    visualizarCategoriaPorCategoria
}
