import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import storeCarrito from '../../context/storeCarrito';

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
    const [currentStep, setCurrentStep] = useState(1);
    const [pickupInUniversity, setPickupInUniversity] = useState(false);
    const navigate = useNavigate();
    const { carrito, fetchCarrito, loading: carritoLoading } = storeCarrito();

    useEffect(() => {
        fetchCarrito();
    }, [fetchCarrito]);

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
                setCurrentStep(3);
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error procesando');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setShowPaymentForm(false);
        setCurrentStep(3);
    };

    const renderStepper = () => (
        <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    1
                </div>
                <span className="ml-2 text-lg font-medium">Carrito</span>
            </div>
            <hr className="flex-1 mx-4 border-t border-gray-300" />
            <div className="flex items-center">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    2
                </div>
                <span className="ml-2 text-lg font-medium">Datos facturación y envío</span>
            </div>
            <hr className="flex-1 mx-4 border-t border-gray-300" />
            <div className="flex items-center">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep >= 3 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    3
                </div>
                <span className="ml-2 text-lg font-medium">Confirmación</span>
            </div>
        </div>
    );

    const renderStepContent = () => {
        if (carritoLoading) {
            return <p className="text-center text-gray-700">Cargando carrito...</p>;
        }

        if (!carrito || !carrito.productos?.length) {
            return (
                <div className="text-center">
                    <p className="text-gray-700 mb-4">No tienes productos en el carrito.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                        Empieza a comprar
                    </button>
                </div>
            );
        }

        if (currentStep === 1) {
            return (
                <div>
                    <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Carrito</h2>
                    <div className="space-y-4 mb-6">
                        {carrito.productos.map((item) => (
                            <div key={item._id} className="flex items-center justify-between pb-4">
                                <div className="flex items-center gap-4">
                                    <img src={item.producto.imagen} alt={item.producto.nombreProducto} className="w-16 h-16 object-cover rounded" />
                                    <div>
                                        <p className="font-semibold">{item.producto.nombreProducto}</p>
                                        <p className="text-gray-600">Cantidad: {item.cantidad}</p>
                                    </div>
                                </div>
                                <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-bold text-lg mb-6">
                        <span>Subtotal</span>
                        <span>${carrito.total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={() => setCurrentStep(2)}
                        className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-700  transition-transform transform hover:scale-105"
                    >
                        Siguiente
                    </button>
                </div>
            );
        }

        if (currentStep === 2) {
            return (
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-800 mb-6">Datos facturación y envío</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={pickupInUniversity}
                                        onChange={(e) => setPickupInUniversity(e.target.checked)}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span>Retiro dentro de la universidad</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
                                <select
                                    value={metodoPago}
                                    onChange={(e) => {
                                        setMetodoPago(e.target.value);
                                        setShowPaymentForm(false);
                                    }}
                                    className="w-full p-3 border rounded-md"
                                >
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="tarjeta">Tarjeta (Stripe)</option>
                                </select>
                            </div>
                            {metodoPago === 'transferencia' && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Datos de la cuenta del vendedor</h3>
                                    <p>Banco: </p>
                                    <p>Número de cuenta: </p>
                                    <p>Número de Cedula</p>
                                    <p>Titular: </p>
                                    
                                </div>
                            )}
                            {showPaymentForm && <PagosForm onSuccess={handlePaymentSuccess} />}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-blue-800 mb-6">Tu pedido</h2>
                        <div className="space-y-4">
                            {carrito.productos.map((item) => (
                                <div key={item._id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img src={item.producto.imagen} alt={item.producto.nombreProducto} className="w-12 h-12 object-cover rounded" />
                                        <div>
                                            <p className="font-semibold">{item.producto.nombreProducto}</p>
                                            <p className="text-gray-600">x {item.cantidad}</p>
                                        </div>
                                    </div>
                                    <p>${item.subtotal.toFixed(2)}</p>
                                </div>
                            ))}
                            <hr className="my-4" />
                            <div className="flex justify-between font-bold">
                                <span>Subtotal</span>
                                <span>${carrito.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${carrito.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition"
                        >
                            Anterior
                        </button>
                        <button
                            disabled={loading}
                            onClick={handleSubmit}
                            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? 'Procesando...' : 'Continuar'}
                        </button>
                    </div>
                </div>
            );
        }

        if (currentStep === 3) {
            return (
                <div>
                    <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Confirmación</h2>
                    <p className="text-center text-gray-700 mb-6">¡Tu orden ha sido procesada exitosamente!</p>
                    <button
                        onClick={() => navigate('/dashboard/estudiante/historial-pagos')}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Ver historial de pagos
                    </button>
                </div>
            );
        }
    };

    return (
        <Elements stripe={stripePromise}>
            <Header />
            <div className="h-20 sm:h-7" />
            <ToastContainer />
            <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl w-full mx-auto bg-white rounded-lg shadow-lg p-8">
                    {renderStepper()}
                    {renderStepContent()}
                </div>
            </div>
            <Footer />
        </Elements>
    );
};

export default OrdenPendiente;