import React, { useEffect, useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../layout/Header';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Pagos = () => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);

        const cardElement = elements.getElement(CardElement);
        try {
            const { paymentMethod, error: paymentMethodError } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (paymentMethodError) {
                toast.error(paymentMethodError.message);
                setLoading(false);
                return;
            }

            // Llamar al backend para procesar el pago
            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/estudiante/pago`,
                {
                    paymentMethodId: paymentMethod.id,
                    metodoPago: 'tarjeta',
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );

            toast.success(data.msg);
            setLoading(false);
            navigate('/dashboard/historial-pagos'); // o donde quieras enviar después del pago exitoso
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error procesando pago');
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <ToastContainer />
            <div className="h-20"></div>
            <main className="container mx-auto px-4 py-6 max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-blue-800">Pagar con tarjeta</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-4 border rounded">
                        <CardElement options={{ hidePostalCode: true }} />
                    </div>
                    <button
                        type="submit"
                        disabled={!stripe || loading}
                        className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-800 transition"
                    >
                        {loading ? 'Procesando...' : 'Pagar ahora'}
                    </button>
                </form>
            </main>
        </>
    );
};

export default Pagos;
