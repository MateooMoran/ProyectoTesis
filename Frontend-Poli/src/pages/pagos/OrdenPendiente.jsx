import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../layout/Header';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PagosForm = ({ onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            setTimeout(() => onSuccess(), 1000);
        } catch (error) {
            setError(error.response?.data?.msg || error.message || 'Error al procesar el pago');
            toast.error(error.response?.data?.msg || error.message || 'Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 max-w-md w-full bg-white rounded-lg shadow-lg p-8">
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
    );
};

const OrdenPendiente = () => {
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [loading, setLoading] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (metodoPago === 'tarjeta') {
                setShowPaymentForm(true);
            } else {
                const storedData = JSON.parse(localStorage.getItem('auth-token'));
                const token = storedData?.state?.token;

                if (!token) {
                    toast.error("Debes iniciar sesión antes de continuar");
                    setLoading(false);
                    return;
                }

                const { data } = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/estudiante/orden`,
                    { metodoPago },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success(data.msg);
                navigate('/dashboard/historial-pagos');
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error procesando');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setShowPaymentForm(false);
        navigate('/dashboard/pagos/exito');
    };

    return (
        <Elements stripe={stripePromise}>
            <Header />
            <ToastContainer />
            <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Selecciona método de pago</h2>
                    <select
                        value={metodoPago}
                        onChange={(e) => {
                            setMetodoPago(e.target.value);
                            setShowPaymentForm(false); // Reset form visibility on method change
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition mb-6"
                        aria-label="Método de pago"
                    >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta (Stripe)</option>
                    </select>
                    <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        aria-label={loading ? 'Procesando' : 'Continuar'}
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
                            'Continuar'
                        )}
                    </button>
                    {showPaymentForm && <PagosForm onSuccess={handlePaymentSuccess} />}
                </div>
            </div>
        </Elements>
    );
};

export default OrdenPendiente;