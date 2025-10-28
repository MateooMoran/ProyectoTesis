import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import useFetch from '../../hooks/useFetch';
import {
    CheckCircle,
    Clock,
    Banknote,
    CreditCard,
    ShoppingCart,
    Filter,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const HistorialPagos = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroMetodo, setFiltroMetodo] = useState('todos');
    const [ordersPorPagina] = useState(4);
    const { fetchDataBackend } = useFetch();
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState({});

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

    const getOrdersFiltradas = (estadoTab) => {
        return orders.filter(order =>
            (estadoTab === 'todos' || order.estado === estadoTab) &&
            (filtroMetodo === 'todos' || order.metodoPago === filtroMetodo)
        );
    };

    const totalTodas = orders.length;
    const totalPagadas = orders.filter(o => o.estado === 'pagado').length;
    const totalPendientes = orders.filter(o => o.estado === 'pendiente').length;

    const getCurrentPage = (estadoTab) => {
        const key = estadoTab;
        return currentPage[key] || 1;
    };

    const setCurrentPageLocal = (pagina, estadoTab) => {
        const key = estadoTab;
        setCurrentPage(prev => ({ ...prev, [key]: pagina }));
    };

    const getOrdersActuales = (estadoTab) => {
        const filtradas = getOrdersFiltradas(estadoTab);
        const pagina = getCurrentPage(estadoTab);
        const indexUltima = pagina * ordersPorPagina;
        const indexPrimera = indexUltima - ordersPorPagina;
        return filtradas.slice(indexPrimera, indexUltima);
    };

    const getTotalPaginas = (estadoTab) => {
        const filtradas = getOrdersFiltradas(estadoTab);
        return Math.ceil(filtradas.length / ordersPorPagina);
    };

    const handlePageChange = (nuevaPagina, estadoTab) => {
        const totalPaginas = getTotalPaginas(estadoTab);
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            setCurrentPageLocal(nuevaPagina, estadoTab);
        }
    };

    const renderOrdersTab = (estadoTab, titulo, Icon) => {
        const ordersActuales = getOrdersActuales(estadoTab);
        const totalPaginas = getTotalPaginas(estadoTab);
        const totalItems = getOrdersFiltradas(estadoTab).length;
        const paginaActual = getCurrentPage(estadoTab);

        return (
            <TabPanel>
                {totalItems === 0 ? (
                    <div className="text-center py-8 lg:py-12">
                        <ShoppingCart className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
                        <p className="text-gray-500 text-base lg:text-xl mb-3 lg:mb-4">No hay {titulo.toLowerCase()} en tu historial</p>
                        <button
                            onClick={() => navigate('/dashboard/listarProd')}
                            className="bg-blue-900 text-white py-2 lg:py-3 px-4 lg:px-6 rounded-lg lg:rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-2 mx-auto text-sm lg:text-base"
                        >
                            <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" /> Explorar Productos
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg lg:rounded-2xl shadow-lg p-3 lg:p-6 mb-4 lg:mb-6 border border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
                                    <span className="text-sm lg:text-lg font-semibold text-blue-800 flex items-center gap-1.5 lg:gap-2">
                                        <Icon className="w-4 h-4 lg:w-5 lg:h-5" /> Total: {totalItems}
                                    </span>
                                    <span className="px-2 lg:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs lg:text-sm">
                                        Pág {paginaActual} de {totalPaginas}
                                    </span>
                                </div>
                                <div className="flex gap-2 lg:gap-4 items-center w-full sm:w-auto">
                                    <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 flex-shrink-0" />
                                    <select
                                        value={filtroMetodo}
                                        onChange={(e) => {
                                            setFiltroMetodo(e.target.value);
                                            setCurrentPageLocal(1, estadoTab);
                                        }}
                                        className="flex-1 sm:flex-none px-2 lg:px-4 py-1.5 lg:py-2 border border-gray-300 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm font-semibold"
                                    >
                                        <option value="todos">Todos los métodos</option>
                                        <option value="efectivo">Efectivo</option>
                                        <option value="tarjeta">Tarjeta</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">
                            {ordersActuales.map((order) => (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-lg lg:rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-200 p-3 lg:p-6"
                                >
                                    <div className="flex flex-col lg:flex-row items-start gap-3 lg:gap-4">
                                        {/* Imagen */}
                                        <img
                                            src={order.productos[0]?.producto?.imagen || 'https://via.placeholder.com/100'}
                                            alt={order.productos[0]?.producto?.nombreProducto || 'Producto'}
                                            className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-lg lg:rounded-xl flex-shrink-0"
                                        />

                                        {/* Información */}
                                        <div className="flex-1 min-w-0 w-full">
                                            <h3 className="text-sm lg:text-lg font-bold text-gray-800 mb-2 truncate">
                                                {order.productos[0]?.producto?.nombreProducto || 'Producto sin nombre'}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-4 text-xs lg:text-sm text-gray-600 mb-2 lg:mb-3">
                                                <p><span className="font-semibold">ID:</span> <span className="truncate">{order._id}</span></p>
                                                <p><span className="font-semibold">Fecha:</span> {formatDate(order.createdAt)}</p>
                                                <p><span className="font-semibold">Total:</span> ${order.total.toLocaleString('es-CO')}</p>
                                                <p><span className="font-semibold">Método:</span> {order.metodoPago.toUpperCase()}</p>
                                            </div>
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-bold ${order.estado === 'pagado'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {order.estado === 'pagado' ? (
                                                    <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                                                ) : (
                                                    <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                                                )}
                                                {order.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </div>

                                        {/* Botón */}
                                        <button
                                            onClick={() => navigate(`productos/${order.productos[0]?.producto?._id}`)}
                                            className="w-full lg:w-auto bg-gradient-to-r from-blue-900 to-blue-800 text-white py-2 lg:py-3 px-3 lg:px-6 rounded-lg lg:rounded-xl font-semibold text-xs lg:text-base hover:from-blue-800 hover:to-blue-700 transform hover:scale-105 transition-all flex-shrink-0"
                                        >
                                            Ver Producto
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Paginador */}
                        {totalPaginas > 1 && (
                            <div className="p-3 lg:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-4">
                                <div className="text-xs lg:text-sm text-gray-600 text-center sm:text-left">
                                    Mostrando {((paginaActual - 1) * ordersPorPagina) + 1} - {Math.min(paginaActual * ordersPorPagina, totalItems)} de {totalItems}
                                </div>

                                <div className="flex items-center gap-1 lg:gap-2 flex-wrap justify-center">
                                    <button
                                        onClick={() => handlePageChange(paginaActual - 1, estadoTab)}
                                        disabled={paginaActual === 1}
                                        className="px-2 lg:px-4 py-1.5 lg:py-2 bg-blue-800 text-white rounded-lg lg:rounded-xl disabled:bg-gray-400 font-semibold text-xs lg:text-base hover:bg-blue-700 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                    >
                                        <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span className="hidden sm:inline">Anterior</span>
                                    </button>

                                    <div className="flex gap-0.5 lg:gap-1">
                                        {[...Array(totalPaginas)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => handlePageChange(i + 1, estadoTab)}
                                                className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl font-semibold text-xs lg:text-base transition-all ${paginaActual === i + 1
                                                        ? 'bg-blue-800 text-white shadow-lg scale-110'
                                                        : 'bg-gray-200 hover:bg-blue-100'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(paginaActual + 1, estadoTab)}
                                        disabled={paginaActual === totalPaginas}
                                        className="px-2 lg:px-4 py-1.5 lg:py-2 bg-blue-800 text-white rounded-lg lg:rounded-xl disabled:bg-gray-400 font-semibold text-xs lg:text-base hover:bg-blue-700 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                    >
                                        <span className="hidden sm:inline">Siguiente</span>
                                        <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </TabPanel>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center py-4 lg:py-10">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-700 text-sm lg:text-lg">Cargando historial...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer />
            <div className="mt-40 md:mt-12"></div>

            <main className="py-4 lg:py-10 bg-blue-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-3 lg:px-4">
                    {/* Título y descripción */}
                    <div className="text-center mb-6 lg:mb-12">
                        <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                            <h1 className="text-2xl lg:text-4xl font-bold text-gray-800">
                                Historial de Compras
                            </h1>
                        </div>
                        <p className="text-xs lg:text-base text-gray-600">
                            Revisa todas tus compras y transacciones realizadas
                        </p>
                    </div>

                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg lg:rounded-2xl p-4 lg:p-6 text-center">
                            <p className="text-red-700 text-sm lg:text-lg mb-3 lg:mb-4">{error}</p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-red-600 text-white py-2 lg:py-3 px-4 lg:px-6 rounded-lg lg:rounded-xl hover:bg-red-700 transition-all text-sm lg:text-base"
                            >
                                ← Volver al Dashboard
                            </button>
                        </div>
                    ) : (
                        <Tabs onSelect={() => setCurrentPage({})}>
                            <TabList className="flex border-b-2 border-gray-300 gap-0 overflow-x-auto bg-transparent">
                                <Tab className="flex-1 py-3 lg:py-4 px-2 lg:px-6 text-center font-semibold text-xs lg:text-base text-gray-600 cursor-pointer transition-all hover:text-blue-800 hover:bg-blue-50 rounded-t-lg whitespace-nowrap focus:outline-none">
                                    <div className="flex items-center justify-center gap-1 lg:gap-2">
                                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                                        Todas ({totalTodas})
                                    </div>
                                </Tab>
                                <Tab className="flex-1 py-3 lg:py-4 px-2 lg:px-6 text-center font-semibold text-xs lg:text-base text-gray-600 cursor-pointer transition-all hover:text-yellow-600 hover:bg-yellow-50 rounded-t-lg whitespace-nowrap focus:outline-none">
                                    <div className="flex items-center justify-center gap-1 lg:gap-2">
                                        <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
                                        Pendientes ({totalPendientes})
                                    </div>
                                </Tab>
                                <Tab className="flex-1 py-3 lg:py-4 px-2 lg:px-6 text-center font-semibold text-xs lg:text-base text-gray-600 cursor-pointer transition-all hover:text-green-600 hover:bg-green-50 rounded-t-lg whitespace-nowrap focus:outline-none">
                                    <div className="flex items-center justify-center gap-1 lg:gap-2">
                                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                                        Pagadas ({totalPagadas})
                                    </div>
                                </Tab>

                            </TabList>

                            {renderOrdersTab('todos', 'Compras', CheckCircle)}
                            {renderOrdersTab('pagado', 'Pagadas', CheckCircle)}
                            {renderOrdersTab('pendiente', 'Pendientes', Clock)}
                        </Tabs>

                    )}
                </div>
            </main>
        </>
    );
};

export default HistorialPagos;