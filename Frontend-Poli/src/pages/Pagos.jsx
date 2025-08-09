import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { toast } from 'react-toastify';
import storeAuth from '../context/storeAuth';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const { token } = storeAuth();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const crearOrdenPendiente = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/estudiante/orden`,
        { metodoPago: 'tarjeta' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.msg);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error creando orden pendiente');
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Primero creamos la orden pendiente para reservar productos y validar stock
      await crearOrdenPendiente();

      const cardElement = elements.getElement(CardElement);

      // Crear método de pago con Stripe
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentMethodError) {
        toast.error(paymentMethodError.message);
        setLoading(false);
        return;
      }

      // Procesar pago en backend
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/estudiante/pago`,
        {
          paymentMethodId: paymentMethod.id,
          metodoPago: 'tarjeta',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.msg);
      navigate('/dashboard/estudiante/historial-pagos'); // Redirige a historial de pagos o donde quieras

    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error procesando pago');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Pagar con Tarjeta</h2>
      <div className="mb-4 border p-3 rounded">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Procesando...' : 'Pagar Ahora'}
      </button>
    </form>
  );
};

const Pagos = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Pagos;
