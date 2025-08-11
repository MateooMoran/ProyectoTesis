import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../layout/Header';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PagosForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handlePago = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const storedData = JSON.parse(localStorage.getItem('auth-token'));
        const token = storedData?.state?.token;

        if (!token) {
            setError("No se encontró el token. Inicia sesión nuevamente.");
            toast.error("Debes iniciar sesión antes de pagar");
            setLoading(false);
            return;
        }

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            });
            if (error) throw error;

            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/estudiante/pago`,
                { paymentMethodId: paymentMethod.id, metodoPago: 'tarjeta' },
                { headers: { Authorization: `Bearer ${token}` } },
            );

            toast.success(data.msg, { autoClose: 3000 });
            setTimeout(() => navigate('/dashboard/pagos/exito'), 1000);
        } catch (error) {
            setError(error.response?.data?.msg || error.message || 'Error al procesar el pago');
            toast.error(error.response?.data?.msg || error.message || 'Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    };



    return (
        <>
            <Header />
            <ToastContainer />
            <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Pagar con Tarjeta</h2>
                    <form onSubmit={handlePago} className="space-y-6">
                        <div>
                            <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
                                Detalles de la Tarjeta
                            </label>
                            <div className="p-3 border border-gray-300 rounded-md bg-gray-50 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600 transition">
                                <CardElement
                                    id="card-element"
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: '16px',
                                                color: '#1f2937',
                                                '::placeholder': { color: '#9ca3af' },
                                            },
                                            invalid: { color: '#dc2626' },
                                        },
                                    }}
                                    className="w-full"
                                />
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-600" role="alert">
                                    {error}
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={!stripe || loading}
                            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                            aria-label={loading ? 'Procesando pago' : 'Pagar ahora'}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                                        ></path>
                                    </svg>
                                    Procesando...
                                </>
                            ) : (
                                'Pagar'
                            )}
                        </button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Pagos seguros con{' '}
                        <a
                            href="https://stripe.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            Stripe
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
};

const Pagos = () => (
    <Elements stripe={stripePromise}>
        <PagosForm />
    </Elements>
);

export default Pagos;