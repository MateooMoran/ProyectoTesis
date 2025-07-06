import Producto from "../models/Producto.js"
import Orden from "../models/Orden.js";

const crearOrden = async (req, res) => {
    const { productos } = req.body;

    let totalPagar = 0;

    for (const item of productos) {
        const productoid = item.producto;
        const stockReservado = item.cantidad;

        if (!productoid) {
            return res.status(400).json({ msg: "ID de producto inválido o no enviado" });
        }

        const productoDB = await Producto.findById(productoid).select("stock precio");
        if (!productoDB) {
            return res.status(404).json({ msg: `Producto con id ${productoid} no encontrado` });
        }

        if (stockReservado > productoDB.stock) {
            return res.status(400).json({ msg: `Stock no disponible para el producto ${productoDB._id}` });
        }

        totalPagar += stockReservado * productoDB.precio;
    }

    const nuevaOrden = new Orden({
        comprador: req.estudianteBDD._id,
        productos: productos,
        total: totalPagar,
    });

    await nuevaOrden.save();

    res.status(201).json({ msg: "Orden creada correctamente", orden: nuevaOrden });
}


const listarMisOrdenes = async (req, res) => {
    const misOrdenes = await Orden.find({ comprador: req.estudianteBDD._id })
    res.status(200).json(misOrdenes);
}


export {
    crearOrden,
    listarMisOrdenes
}