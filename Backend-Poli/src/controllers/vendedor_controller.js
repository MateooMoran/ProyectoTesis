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

const listarProducto = async (req,res)=>{
    const producto = await Producto.find().select("-createdAt -updatedAt -__v").populate('categoria','nombreCategoria')
    res.status(200).json(producto)
}

const visualizarCategoriaPorCategoria = async (req,res) =>{
    const {id} = req.params
    const categoria = await Producto.find({categoria:id}).where().select("-createdAt -updatedAt -__v").populate('categoria','nombreCategoria')  
    res.status(200).json(categoria)
}
export {
    
    crearCategoria,
    listarCategorias,
    crearProducto,
    listarProducto,
    visualizarCategoriaPorCategoria
}
