import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)


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

const procesarReembolso = async (req, res) => {
  const { paymentIntentId, amount } = req.body
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount // amount in cents, e.g., 1000 for $10.00
    })

    console.log('✅ Reembolso exitoso:', refund.id)
    res.json({ success: true, refund })
  } catch (error) {
    console.error('❌ Error al procesar el reembolso:', error.message)
    res.status(400).json({ success: false, message: error.message })
  }
}


export { procesarPago, procesarReembolso }
