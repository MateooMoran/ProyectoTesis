import Stripe from 'stripe'
import Estudiante from "../models/Estudiante.js";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// PARA CHAT EN TIEMPO REAL
const buscarEstudiantePorNombre = async (req, res) => {
    const { nombre } = req.query


    const estudiantes = await Estudiante.find({
        nombre: { $regex: nombre, $options: 'i' }
    })

    res.status(200).json(estudiantes)
    if (!estudiantes || estudiantes.length === 0) {
        return res.status(404).json({ msg: "No se encontraron estudiantes con ese nombre" });
    }

}

// PARA PASARELAS DE PAGO
const procesarPago = async (req, res) => {
    const { id, amount } = req.body
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method: id,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
        })
        res.status(200).json({ success: true, msg: 'Pago procesado correctamente', paymentIntentId: paymentIntent.id })
        console.log('Pago procesado correctamente:', paymentIntent.id)
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message })
    }
}


export { procesarPago,buscarEstudiantePorNombre}
