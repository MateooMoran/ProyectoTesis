import Categoria from "../models/Categoria.js"
import Producto from "../models/Producto.js";
import Carrito from "../models/Carrito.js";
import Orden from "../models/Orden.js";
import Stripe from 'stripe'
import QuejasSugerencias from "../models/QuejasSugerencias.js";
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

    let totalActual = carrito.total || 0;

    for (const item of productos) {
        const productoid = item.producto;
        const stockReservado = item.cantidad;

        if (!productoid || stockReservado <= 0) {
            return res.status(400).json({ msg: "Producto o cantidad inválida" });
        }

        const productoDB = await Producto.findById(productoid).select("stock precio");
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

const eliminarProductoCarrito = async (req, res) => {
    const { id } = req.params;
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


// PAGOS
const procesarPago = async (req, res) => {
    const { paymentMethodId, metodoPago = "tarjeta" } = req.body;

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

    await nueva.save();
    res.status(200).json({ msg: "Queja/Sugerencia enviada correctamente" });
};


const visualizarQuejasSugerencias = async (req, res) => {
    const datos = await QuejasSugerencias.find({ usuario: req.estudianteBDD._id });
    if (!datos.length) return res.status(404).json({ msg: "No se encontraron registros" });
    res.status(200).json(datos);
};

// NOTIFICACIONES

const listarNotificacionesEstudiante = async (req, res) => {
    const notificaciones = await Notificacion.find({ usuario: req.estudianteBDD._id })
        .sort({ createdAt: -1 });

    res.status(200).json(notificaciones);
}

const marcarNotificacionLeidaEstudiante = async (req, res) => {
    const { id } = req.params;

    const notificacion = await Notificacion.findById(id);
    if (!notificacion) return res.status(404).json({ msg: "Notificación no encontrada" });

    if (notificacion.usuario.toString() !== req.estudianteBDD._id.toString()) {
        return res.status(403).json({ msg: "No autorizado" });
    }

    notificacion.leido = true;
    await notificacion.save();

    res.status(200).json({ msg: "Notificación marcada como leída" });
}
const eliminarNotificacionEstudiante = async (req, res) => {
  const { id } = req.params;

    const notificacion = await Notificacion.findById(id);
    if (!notificacion) return res.status(404).json({ msg: "Notificación no encontrada" });

    // Validar que el usuario que intenta eliminar es el dueño
    if (notificacion.usuario.toString() !== req.estudianteBDD._id.toString()) {
      return res.status(403).json({ msg: "No autorizado" });
    }

    await notificacion.deleteOne();

    res.status(200).json({ msg: "Notificación eliminada" });
}

export {
    verCategorias,
    verProductos,
    crearCarrito,
    visualizarCarrito,
    eliminarProductoCarrito,
    procesarPago,
    visualizarHistorialPagos,
    crearQuejasSugerencias,
    visualizarQuejasSugerencias,
    listarNotificacionesEstudiante,
    marcarNotificacionLeidaEstudiante,
    eliminarNotificacionEstudiante
}