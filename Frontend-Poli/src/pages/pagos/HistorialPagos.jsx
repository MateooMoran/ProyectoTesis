import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import useFetch from '../../hooks/useFetch';
import {
    ClipboardList,
    CheckCircle,
    Clock,
    Banknote,
    CreditCard,
    ShoppingCart,
} from 'lucide-react';

const HistorialPagos = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('todos');
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

    const getOrdersFiltradas = (estadoTab, metodoTab) => {
        return orders.filter(order =>
            (estadoTab === 'todos' || order.estado === estadoTab) &&
            (metodoTab === 'todos' || order.metodoPago === metodoTab) &&
            (filtroEstado === 'todos' || order.estado === filtroEstado) &&
            (filtroMetodo === 'todos' || order.metodoPago === filtroMetodo)
        );
    };

    const totalTodas = orders.length;
    const totalPagadas = orders.filter(o => o.estado === 'pagado').length;
    const totalPendientes = orders.filter(o => o.estado === 'pendiente').length;
    const totalEfectivo = orders.filter(o => o.metodoPago === 'efectivo').length;
    const totalTarjeta = orders.filter(o => o.metodoPago === 'tarjeta').length;

    const getCurrentPage = (estadoTab, metodoTab) => {
        const key = `${estadoTab}-${metodoTab}`;
        return currentPage[key] || 1;
    };

    const setCurrentPageLocal = (pagina, estadoTab, metodoTab) => {
        const key = `${estadoTab}-${metodoTab}`;
        setCurrentPage(prev => ({ ...prev, [key]: pagina }));
    };

    const getOrdersActuales = (estadoTab, metodoTab) => {
        const filtradas = getOrdersFiltradas(estadoTab, metodoTab);
        const pagina = getCurrentPage(estadoTab, metodoTab);
        const indexUltima = pagina * ordersPorPagina;
        const indexPrimera = indexUltima - ordersPorPagina;
        return filtradas.slice(indexPrimera, indexUltima);
    };

    const getTotalPaginas = (estadoTab, metodoTab) => {
        const filtradas = getOrdersFiltradas(estadoTab, metodoTab);
        return Math.ceil(filtradas.length / ordersPorPagina);
    };

    const handlePageChange = (nuevaPagina, estadoTab, metodoTab) => {
        const totalPaginas = getTotalPaginas(estadoTab, metodoTab);
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            setCurrentPageLocal(nuevaPagina, estadoTab, metodoTab);
        }
    };

    const renderOrdersTab = (estadoTab, metodoTab, titulo, Icon) => {
        const ordersActuales = getOrdersActuales(estadoTab, metodoTab);
        const totalPaginas = getTotalPaginas(estadoTab, metodoTab);
        const totalItems = getOrdersFiltradas(estadoTab, metodoTab).length;
        const paginaActual = getCurrentPage(estadoTab, metodoTab);

        return (
            <TabPanel>
                {totalItems === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-xl mb-4">No hay {titulo.toLowerCase()} en tu historial</p>
                        <button
                            onClick={() => navigate('/dashboard/listarProd')}
                            className="bg-blue-900 text-white py-3 px-6 rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={20} /> Explorar Productos
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <span className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                                        <Icon size={20} /> Total: {totalItems} {titulo.toLowerCase()}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        Página {paginaActual} de {totalPaginas}
                                    </span>
                                </div>
                                <div className="flex gap-4 flex-wrap">
                                    <select
                                        value={filtroEstado}
                                        onChange={(e) => {
                                            setFiltroEstado(e.target.value);
                                            setCurrentPageLocal(1, estadoTab, metodoTab);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                                    >
                                        <option value="todos">Todos los estados</option>
                                        <option value="pagado">Pagadas</option>
                                        <option value="pendiente">Pendientes</option>
                                    </select>
                                    <select
                                        value={filtroMetodo}
                                        onChange={(e) => {
                                            setFiltroMetodo(e.target.value);
                                            setCurrentPageLocal(1, estadoTab, metodoTab);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                                    >
                                        <option value="todos">Todos los métodos</option>
                                        <option value="efectivo">Efectivo</option>
                                        <option value="tarjeta">Tarjeta</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            {ordersActuales.map((order) => (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-2xl shadow-lg p-6 flex flex-col lg:flex-row items-start lg:items-center gap-4 border border-gray-200 hover:shadow-xl transition-all"
                                >
                                    <img
                                        src={order.productos[0]?.producto?.imagen || 'https://via.placeholder.com/100'}
                                        alt={order.productos[0]?.producto?.nombreProducto || 'Producto'}
                                        className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
                                            {order.productos[0]?.producto?.nombreProducto || 'Producto sin nombre'}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                            <p><span className="font-semibold">ID:</span> {order._id}</p>
                                            <p><span className="font-semibold">Fecha:</span> {formatDate(order.createdAt)}</p>
                                            <p><span className="font-semibold">Total:</span> ${order.total.toLocaleString('es-CO')}</p>
                                            <p><span className="font-semibold">Método:</span> {order.metodoPago.toUpperCase()}</p>
                                        </div>
                                        <span
                                            className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${order.estado === 'pagado'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                } flex items-center gap-1`}
                                        >
                                            {order.estado === 'pagado' ? (
                                                <CheckCircle size={16} />
                                            ) : (
                                                <Clock size={16} />
                                            )}
                                            {order.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`productos/${order.productos[0]?.producto?._id}`)}
                                        className="bg-gradient-to-r from-blue-900 to-blue-900 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-800 hover:to-blue-800 transform hover:scale-105 transition-all"
                                    >
                                        Ver Producto
                                    </button>
                                </div>
                            ))}
                        </div>

                        {totalPaginas > 1 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6  flex justify-center gap-2">
                                <button
                                    onClick={() => handlePageChange(paginaActual - 1, estadoTab, metodoTab)}
                                    disabled={paginaActual === 1}
                                    className="px-4 py-2 bg-blue-800 text-white rounded-xl disabled:bg-gray-400 font-semibold"
                                >
                                    ← Anterior
                                </button>
                                {[...Array(totalPaginas)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1, estadoTab, metodoTab)}
                                        className={`px-3 py-2 rounded-xl font-semibold ${paginaActual === i + 1 ? 'bg-blue-800 text-white' : 'bg-gray-200 hover:bg-blue-100'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(paginaActual + 1, estadoTab, metodoTab)}
                                    disabled={paginaActual === totalPaginas}
                                    className="px-4 py-2 bg-blue-800 text-white rounded-xl disabled:bg-gray-400 font-semibold"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </TabPanel>
        );
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="h-10 sm:h-5 mb-6" />
                <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                    <div className="text-center">
                        <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-700 text-lg">Cargando historial...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <ToastContainer />
            <Header />
            <div className="h-10 sm:h-5 mb-6" />

            <main className="py-10 bg-blue-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-700 bg-clip-text text-transparent text-center mb-12 flex items-center justify-center gap-2">
                        <CreditCard size={32} /> Historial de Compras
                    </h2>

                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                            <p className="text-red-700 text-lg mb-4">{error}</p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 transition-all"
                            >
                                ← Volver al Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="rounded-2xl shadow-lg">
                            <Tabs>
                                <TabList className="flex border-b border-gray-200">
                                    <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-blue-800 focus:outline-none">
                                        <ClipboardList className="inline-block mb-1 mr-1" /> Todas ({totalTodas})
                                    </Tab>
                                    <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-green-600 focus:outline-none">
                                        <CheckCircle className="inline-block mb-1 mr-1" /> Pagadas ({totalPagadas})
                                    </Tab>
                                    <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-yellow-600 focus:outline-none">
                                        <Clock className="inline-block mb-1 mr-1" /> Pendientes ({totalPendientes})
                                    </Tab>
                                    <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-green-600 focus:outline-none">
                                        <Banknote className="inline-block mb-1 mr-1" /> Efectivo ({totalEfectivo})
                                    </Tab>
                                    <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-blue-600 focus:outline-none">
                                        <CreditCard className="inline-block mb-1 mr-1" /> Tarjeta ({totalTarjeta})
                                    </Tab>
                                </TabList>

                                {renderOrdersTab('todos', 'todos', 'Todas', ClipboardList)}
                                {renderOrdersTab('pagado', 'todos', 'Pagadas', CheckCircle)}
                                {renderOrdersTab('pendiente', 'todos', 'Pendientes', Clock)}
                                {renderOrdersTab('todos', 'efectivo', 'Efectivo', Banknote)}
                                {renderOrdersTab('todos', 'tarjeta', 'Tarjeta', CreditCard)}
                            </Tabs>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
};

export default HistorialPagos;
