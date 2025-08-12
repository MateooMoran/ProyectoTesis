import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../layout/Header';
import useFetch from '../../hooks/useFetch';

const HistorialPagos = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { fetchDataBackend } = useFetch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const storedData = JSON.parse(localStorage.getItem('auth-token'));
                const token = storedData?.state?.token;

                if (!token) {
                    throw new Error('Debes iniciar sesión para ver el historial');
                }

                const data = await fetchDataBackend(
                    `${import.meta.env.VITE_BACKEND_URL}/estudiante/historial-pagos`,
                    {
                        method: 'GET',
                        config: {
                            headers: { Authorization: `Bearer ${token}` },
                        },
                    }
                );

                setOrders(data);
            } catch (err) {
                setError(err.message || 'Error al cargar el historial de pagos');
                toast.error(err.message || 'Error al cargar el historial de pagos');
            } finally {
                setLoading(false);
            }
        };

        fetchHistorial();
    }, [fetchDataBackend]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Header />
            <ToastContainer />
            <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">Historial de Compras</h2>

                    {loading ? (
                        <div className="flex justify-center items-center">
                            <svg
                                className="animate-spin h-8 w-8 text-blue-600"
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
                            <span className="ml-2 text-gray-700">Cargando historial...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                            <p>{error}</p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                                Volver al Dashboard
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                            <p className="text-gray-600 text-lg">No tienes pagos registrados.</p>
                            <button
                                onClick={() => navigate('/dashboard/listarProd')}
                                className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                                Explorar Productos
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-lg shadow-lg p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                                >
                                    <img
                                        src={order.productos[0]?.producto?.imagen || 'https://via.placeholder.com/100'}
                                        alt={order.productos[0]?.producto?.nombreProducto || 'Producto'}
                                        className="w-24 h-24 object-cover rounded-md"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {order.productos[0]?.producto?.nombreProducto || 'Producto sin nombre'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">ID Orden:</span> {order._id}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Fecha:</span> {formatDate(order.createdAt)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Total:</span> ${order.total.toLocaleString('es-CO')}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Método de Pago:</span>{' '}
                                            {order.metodoPago.charAt(0).toUpperCase() + order.metodoPago.slice(1)}
                                        </p>
                                        <p
                                            className={`text-sm font-medium ${
                                                order.estado === 'pagado'
                                                    ? 'text-green-600'
                                                    : order.estado === 'pendiente'
                                                    ? 'text-yellow-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            <span className="font-medium">Estado:</span>{' '}
                                            {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/dashboard/productos/${order.productos[0]?.producto?._id}`)}
                                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 transform hover:scale-105"
                                    >
                                        Ver Producto
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default HistorialPagos;