import Categoria from "../models/Categoria.js"
import Producto from "../models/Producto.js";
import Orden from "../models/Carrito.js";
import Stripe from 'stripe'
import QuejasSugerencias from "../models/QuejasSugerencias.js";
import Carrito from "../models/Carrito.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)



const verCategorias = async (req, res) => {
    const verCategoriasBDD = await Categoria.find().select('_id nombreCategoria');
    res.status(200).json(verCategoriasBDD)
}
const verProductos = async (req, res) => {
    const productos = await Producto.find({ disponible: true }) 
      .select('nombreProducto precio imagen stock categoria')
      .populate('categoria', 'nombreCategoria _id');
    res.status(200).json(productos);
};

const crearCarrito = async (req, res) => {
    const { productos } = req.body;

    let orden = await Orden.findOne({ comprador: req.estudianteBDD._id, estado: 'pendiente' });

    if (!orden) {
        orden = new Orden({
            comprador: req.estudianteBDD._id,
            productos: [],
            total: 0,
            estado: 'pendiente'
        });
    }

    let totalActual = orden.total || 0;

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

        const existente = orden.productos.find(p => p.producto.toString() === productoid);
        if (existente) {
            existente.cantidad += stockReservado;
        } else {
            orden.productos.push({ producto: productoid, cantidad: stockReservado });
        }

        totalActual += stockReservado * productoDB.precio;
    }

    orden.total = totalActual;

    await orden.save();

    res.status(200).json({ msg: "Carrito actualizado correctamente" });
};


const visualizarCarrito = async (req, res) => {
    const ordenPendiente = await Orden.findOne({
        comprador: req.estudianteBDD._id,
        estado: 'pendiente'
    }).populate('productos.producto', 'nombreProducto precio imagen');

    if (!ordenPendiente) {
        return res.status(200).json({ msg: "No hay carrito pendiente", orden: null });
    }

    res.status(200).json(ordenPendiente);
};

const eliminarProductoCarrito = async (req, res) => {
    const { id } = req.params; 
    const orden = await Orden.findOne({ comprador: req.estudianteBDD._id, estado: 'pendiente' });
    if (!orden) {
        return res.status(404).json({ msg: "No hay orden pendiente" });
    }

    const index = orden.productos.findIndex(p => p._id.toString() === id);
    if (index === -1) {
        return res.status(404).json({ msg: "Producto no encontrado en la orden" });
    }

    // Restar del total
    const item = orden.productos[index];
    orden.total -= item.cantidad * (item.producto.precio || 0);

    // Quitar del array
    orden.productos.splice(index, 1);
    await orden.save();

    return res.status(200).json({ msg: "Producto eliminado correctamente", orden });
};


const procesarPago = async (req, res) => {
    const { idOrden, paymentMethodId } = req.body; // usa body, no query

    // Buscar la orden
    const orden = await Orden.findById(idOrden);
    if (!orden) {
        return res.status(404).json({ msg: "Orden no encontrada" });
    }
    // Validar el stock de los productos
    for (const item of orden.productos) {
        const producto = await Producto.findById(item.producto);
        if (!producto || producto.stock < item.cantidad) {
            return res.status(400).json({ msg: `Stock insuficiente para el producto ${producto.nombreProducto}` });
        }
    }

    // Validar si ya está pagada
    if (orden.estado === "pagado") {
        return res.status(400).json({ msg: "La orden ya ha sido pagada" });
    }

    // Calcular monto a pagar
    const totalPagar = orden.total;
    if (totalPagar <= 0) {
        return res.status(400).json({ msg: "Monto inválido para procesar el pago" });
    }


    // Crear intento de pago en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPagar * 100), // en centavos
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
        },
        metadata: {
            ordenId: orden._id.toString(),
            comprador: orden.comprador.toString(),
        },
    });

    // Si el pago fue exitoso, actualizar orden
    orden.estado = "pagado";
    orden.transaccionId = paymentIntent.id;
    await orden.save();

    // Actualizar el stock de los productos
    for (const item of orden.productos) {
        const producto = await Producto.findById(item.producto);
        if (producto) {
            producto.stock -= item.cantidad;
            if (producto.stock <= 0) {
                producto.estado = "no disponible";
                producto.activo = false;
            }
            await producto.save();
        }
    }


    return res.status(200).json({
        msg: "Pago procesado correctamente",
        orden,
        paymentIntent,
    });

}

const visualizarHistorialPagos = async (req, res) => {
    const historialPagos = await Orden.find({ comprador: req.estudianteBDD._id })
    return res.status(200).json(historialPagos);

}

const crearQuejasSugerencias = async (req, res) => {

    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos debes llenar todo los campos" })

    const nuevaQuejaSugerencia = new QuejasSugerencias({
        ...req.body,
        usuario: req.estudianteBDD._id,
    })

    await nuevaQuejaSugerencia.save()
    res.status(200).json({ msg: "Queja/Sugerencia creada correctamente" })
}

const visualizarQuejasSugerencias = async (req, res) => {
    const quejasSugerencias = await QuejasSugerencias.find({ usuario: req.estudianteBDD._id })
    if (quejasSugerencias.length === 0) {
        return res.status(404).json({ msg: "No se encontraron quejas o sugerencias" });
    }
    res.status(200).json(quejasSugerencias)
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
    visualizarQuejasSugerencias
}