import Categoria from "../models/Categoria.js"
import Producto from "../models/Producto.js";
import Carrito from "../models/Carrito.js";
import Orden from "../models/Orden.js";
import Stripe from 'stripe'
import QuejasSugerencias from "../models/QuejasSugerencias.js";
import mongoose from "mongoose";
import Estudiante from "../models/Estudiante.js";
import Notificacion from "../models/Notificacion.js";

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// CATEGORIAS Y PRODCUTOS

const verCategorias = async (req, res) => {
    const verCategoriasBDD = await Categoria.find().select('_id nombreCategoria');
    res.status(200).json(verCategoriasBDD)
}
const verProductos = async (req, res) => {
    const productos = await Producto.find({ disponible: true })
        .select('nombreProducto precio imagen stock categoria estado descripcion')
        .populate('categoria', 'nombreCategoria _id');
    res.status(200).json(productos);
};

const verProductoPorId = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de producto inválido" });
    }
    const producto = await Producto.findById(id)
        .populate('categoria', 'nombreCategoria _id')
        .select("-createdAt -updatedAt -__v")
    if (!producto) {
        return res.status(404).json({ msg: "Producto no encontrado" });
    }
    res.status(200).json(producto);
};

const buscarProductos = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ msg: "Consulta de búsqueda requerida" });
    }
    const productos = await Producto.find({
        $or: [
            { nombreProducto: new RegExp(query, 'i') },
            { descripcion: new RegExp(query, 'i') }
        ],
        disponible: true
    })
        .select('nombreProducto precio imagen stock categoria estado descripcion')
        .populate('categoria', 'nombreCategoria _id');
    if (!productos.length) {
        return res.status(404).json({ msg: "No se encontraron productos" });
    }
    res.status(200).json(productos);
};

const verProductosPorCategoria = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de categoría inválido" });
    }
    const productos = await Producto.find({ categoria: id, disponible: true })
        .select('nombreProducto precio imagen stock categoria estado descripcion')
        .populate('categoria', 'nombreCategoria _id');
    if (!productos.length) {
        return res.status(404).json({ msg: "No se encontraron productos en esta categoría" });
    }
    res.status(200).json(productos);
};


// CARRITO

const crearCarrito = async (req, res) => {
    const { productos } = req.body;

    let carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });

    if (!carrito) {
        carrito = new Carrito({
            comprador: req.estudianteBDD._id,
            productos: [],
            total: 0
        });
    }
    console.log("req.body.productos", productos);

    let totalActual = carrito.total || 0;
    for (const item of productos) {
        const productoid = item.producto;
        console.log("productoid:", productoid);

        console.log(productoid)
        const stockReservado = item.cantidad;
        console.log(stockReservado)
        if (!productoid || stockReservado <= 0) {
            return res.status(400).json({ msg: "Producto o cantidad inválida" });
        }
        if (!mongoose.Types.ObjectId.isValid(productoid)) {
            return res.status(400).json({ msg: `ID de producto inválido: ${productoid}` });
        }
        const productoDB = await Producto.findById(productoid).select("stock precio activo");
        if (!productoDB || !productoDB.activo) {
            return res.status(404).json({ msg: `Producto con id ${productoid} no encontrado` });
        }

        if (stockReservado > productoDB.stock) {
            return res.status(400).json({ msg: `Stock no disponible para el producto ${productoDB._id}` });
        }

        const existente = carrito.productos.find(p => p.producto.toString() === productoid);
        const precioUnitario = productoDB.precio;
        const subtotal = precioUnitario * stockReservado;

        if (existente) {
            existente.cantidad += stockReservado;
            existente.subtotal += subtotal;
        } else {
            carrito.productos.push({
                producto: productoid,
                cantidad: stockReservado,
                precioUnitario,
                subtotal
            });
        }

        totalActual += subtotal;
    }

    carrito.total = totalActual;
    await carrito.save();

    res.status(200).json({ msg: "Carrito actualizado correctamente", carrito });
};


const visualizarCarrito = async (req, res) => {
    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id })
        .populate('productos.producto', 'nombreProducto precio imagen');
    if (!carrito) {
        return res.status(200).json({ msg: "No hay productos en el carrito", carrito: null });
    }
    res.status(200).json(carrito);
};

const disminuirCantidadProducto = async (req, res) => {
    const { id } = req.params;
    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de producto inválido" });
    }
    if (!carrito || carrito.productos.length === 0) {
        return res.status(400).json({ msg: "No hay productos en el carrito" });
    }

    const index = carrito.productos.findIndex(p => p._id.toString() === id);
    if (index === -1) return res.status(404).json({ msg: "Producto no encontrado en el carrito" });

    const item = carrito.productos[index];

    if (item.cantidad > 1) {
        item.cantidad -= 1;
        item.subtotal = item.cantidad * item.precioUnitario;
    } else {
        carrito.productos.splice(index, 1);
    }

    carrito.total = carrito.productos.reduce((acc, p) => acc + p.subtotal, 0);
    await carrito.save();

    res.status(200).json({ msg: "Cantidad actualizada correctamente", carrito });
};

const eliminarProductoCarrito = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de producto inválido" });
    }
    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id })
        .populate('productos.producto');

    if (!carrito || carrito.productos.length === 0) {
        return res.status(400).json({ msg: "No hay productos en el carrito" });
    }

    const index = carrito.productos.findIndex(p => p._id.toString() === id);
    if (index === -1) return res.status(404).json({ msg: "Producto no encontrado en el carrito" });

    carrito.productos.splice(index, 1);
    carrito.total = carrito.productos.reduce((acc, p) => acc + p.subtotal, 0);
    await carrito.save();

    res.status(200).json({ msg: "Producto eliminado correctamente", carrito });
};

const vaciarCarrito = async (req, res) => {
    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });

    if (!carrito) return res.status(404).json({ msg: "Carrito no encontrado" });

    carrito.productos = [];
    carrito.total = 0;
    await carrito.save();

    res.status(200).json({ msg: "Carrito vaciado correctamente", carrito });
};


// PAGOS
const crearOrdenPendiente = async (req, res) => {
    const { metodoPago } = req.body;
    if (!["efectivo", "transferencia"].includes(metodoPago)) {
        return res.status(400).json({ msg: "Método de pago inválido para orden pendiente" });
    }
    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });
    if (!carrito || carrito.productos.length === 0) {
        return res.status(400).json({ msg: "El carrito está vacío" });
    }

    for (const item of carrito.productos) {
        const producto = await Producto.findById(item.producto);
        if (!producto || producto.stock < item.cantidad) {
            return res.status(400).json({ msg: `Stock insuficiente para ${producto?.nombreProducto || "producto no disponible"}` });
        }
    }

    for (const item of carrito.productos) {
        const producto = await Producto.findById(item.producto);
        const orden = new Orden({
            comprador: req.estudianteBDD._id,
            vendedor: producto.vendedor,
            productos: [item],
            total: item.subtotal,
            estado: "pendiente",
            metodoPago
        });
        await orden.save();
        await Notificacion.create({
            usuario: producto.vendedor,
            mensaje: `Tienes una nueva orden pendiente por ${item.cantidad} unidad(es) de "${producto.nombreProducto}"`,
            tipo: "venta"
        })
    }
    await Carrito.findByIdAndDelete(carrito._id);
    res.status(200).json({ msg: "Orden creada con estado pendiente maximo pagar en 12 horas." });
}

const procesarPago = async (req, res) => {
    const { paymentMethodId, metodoPago = "tarjeta" } = req.body;
    if (metodoPago !== "tarjeta") {
        return res.status(400).json({ msg: "Este endpoint es solo para pagos con tarjeta" });
    }

    const carrito = await Carrito.findOne({ comprador: req.estudianteBDD._id });
    if (!carrito || carrito.productos.length === 0) {
        return res.status(400).json({ msg: "El carrito está vacío" });
    }

    // Validar stock
    for (const item of carrito.productos) {
        const producto = await Producto.findById(item.producto);
        if (!producto || producto.stock < item.cantidad) {
            return res.status(400).json({ msg: `Stock insuficiente para ${producto?.nombreProducto || "producto no disponible"}` });
        }
    }

    // Crear intento de pago en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(carrito.total * 100),
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        metadata: {
            comprador: req.estudianteBDD._id.toString()
        },
    });

    // Crear orden por cada producto y vendedor
    for (const item of carrito.productos) {
        const producto = await Producto.findById(item.producto);
        const orden = new Orden({
            comprador: req.estudianteBDD._id,
            vendedor: producto.vendedor,
            productos: [item],
            total: item.subtotal,
            estado: "pagado",
            metodoPago
        });
        await orden.save();

        producto.stock -= item.cantidad;
        producto.vendidos += item.cantidad;
        if (producto.stock <= 0) {
            producto.estado = "no disponible";
            producto.activo = false;
            await Notificacion.create({
                usuario: producto.vendedor,
                mensaje: `Tu producto "${producto.nombreProducto}" se ha agotado.`,
                tipo: "sistema"
            });
        }
        await producto.save();

        await Notificacion.create({
            usuario: producto.vendedor,
            mensaje: `Has vendido ${item.cantidad} unidad(es) de "${producto.nombreProducto}"`,
            tipo: "venta"
        })
    }

    await Carrito.findByIdAndDelete(carrito._id);

    res.status(200).json({ msg: "Pago procesado correctamente", paymentIntent });
};

const cancelarOrden = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID de orden inválido" });
    }
    const orden = await Orden.findById(id);
    if (!orden) return res.status(404).json({ msg: "Orden no encontrada" });
    if (!orden.comprador.equals(req.estudianteBDD._id)) {
        return res.status(403).json({ msg: "No autorizado para cancelar esta orden" });
    }
    if (orden.estado !== "pendiente") {
        return res.status(400).json({ msg: "Solo se pueden cancelar órdenes pendientes" });
    }
    for (const item of orden.productos) {
        const producto = await Producto.findById(item.producto);
        if (!producto) continue;
        producto.stock += item.cantidad;
        if (producto.stock > 0) {
            producto.estado = "disponible";
            producto.activo = true;
        }
        await producto.save();
        await Notificacion.create({
            usuario: producto.vendedor,
            mensaje: `Se liberó el stock de "${producto.nombreProducto}" por cancelación manual de orden.`,
            tipo: "sistema"
        });
    }
    orden.estado = "cancelado";
    await orden.save();
    await Notificacion.create({
        usuario: orden.comprador,
        mensaje: `Tu orden con ID ${orden._id} ha sido cancelada.`,
        tipo: "sistema"
    });
    res.status(200).json({ msg: "Orden cancelada correctamente", orden });

}
const cancelarOrdenesVencidas = async () => {
    try {
        const ahora = new Date();
        const hace12Horas = new Date(ahora.getTime() - 12 * 60 * 60 * 1000);

        const ordenesPendientes = await Orden.find({
            estado: "pendiente",
            createdAt: { $lte: hace12Horas }
        });

        for (const orden of ordenesPendientes) {
            for (const item of orden.productos) {
                const producto = await Producto.findById(item.producto);
                if (!producto) continue;

                producto.stock += item.cantidad;
                if (producto.stock > 0) {
                    producto.estado = "disponible";
                    producto.activo = true;
                }
                await producto.save();

                await Notificacion.create({
                    usuario: producto.vendedor,
                    mensaje: `Se liberó el stock de "${producto.nombreProducto}" por vencimiento de orden.`,
                    tipo: "sistema"
                });
            }

            orden.estado = "cancelado";
            await orden.save();

            await Notificacion.create({
                usuario: orden.comprador,
                mensaje: `Tu orden con ID ${orden._id} fue cancelada por no completarse en 12 horas.`,
                tipo: "sistema"
            });
        }

        console.log(`Órdenes vencidas canceladas: ${ordenesPendientes.length}`);
    } catch (error) {
        console.error("Error cancelando órdenes vencidas:", error);
    }
};


const visualizarHistorialPagos = async (req, res) => {
    const historial = await Orden.find({ comprador: req.estudianteBDD._id })
        .populate('productos.producto', 'nombreProducto precio imagen')
        .sort({ createdAt: -1 });

    res.status(200).json(historial);
};

// QUEJAS Y SUGERENCIAS

const crearQuejasSugerencias = async (req, res) => {
    const { tipo, mensaje } = req.body;
    if (!tipo || !mensaje) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    const nueva = new QuejasSugerencias({
        tipo,
        mensaje,
        usuario: req.estudianteBDD._id,
    });

    const notificacion = new Notificacion({
        usuario: req.estudianteBDD._id,
        mensaje: `Tu ${tipo} ha sido registrada correctamente.`,
        tipo: "sistema"
    });

    const admin = await Estudiante.findOne({ rol: "admin" });
    const notificacionAdmin = new Notificacion({
        usuario: admin._id,
        mensaje: `Nuevo mensaje recibido del tipo (${tipo.toUpperCase()}) del usuario: ${req.estudianteBDD.nombre} ${req.estudianteBDD.apellido}`,

        tipo: "sistema"
    });
    await notificacionAdmin.save();
    await notificacion.save();
    await nueva.save();
    res.status(200).json({ msg: "Queja/Sugerencia enviada correctamente" });
};


const visualizarQuejasSugerencias = async (req, res) => {
    const datos = await QuejasSugerencias.find({ usuario: req.estudianteBDD._id })
        .populate("usuario", "nombre apellido telefono rol")

    if (!datos.length) return res.status(404).json({ msg: "No se encontraron registros" });
    res.status(200).json(datos);
};

const eliminarQuejaSugerencia = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ msg: "ID inválido" });
    }

    const queja = await QuejasSugerencias.findById(id);
    if (!queja) return res.status(404).json({ msg: "Queja/Sugerencia no encontrada" });

    if (!queja.usuario.equals(req.estudianteBDD._id)) {
        return res.status(403).json({ msg: "No autorizado para eliminar esta queja/sugerencia" });
    }

    await queja.deleteOne();
    res.status(200).json({ msg: "Queja/Sugerencia eliminada correctamente" });
}



export {
    verCategorias,
    verProductos,
    verProductoPorId,
    buscarProductos,
    verProductosPorCategoria,
    crearCarrito,
    visualizarCarrito,
    disminuirCantidadProducto,
    eliminarProductoCarrito,
    vaciarCarrito,
    cearOrdenPendiente,
    procesarPago,
    cancelarOrden,
    cancelarOrdenesVencidas,
    visualizarHistorialPagos,
    crearQuejasSugerencias,
    visualizarQuejasSugerencias,
    eliminarQuejaSugerencia
}