import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import useFetch from '../../hooks/useFetch';

const HistorialPagos = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroMetodo, setFiltroMetodo] = useState('todos');
    const [ordersPorPagina] = useState(6);
    const { fetchDataBackend } = useFetch();
    const navigate = useNavigate();

    // 🔥 PAGINADOR LOCAL POR TAB
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

    // 🔥 FILTRO COMBINADO (TAB + MANUAL)
    const getOrdersFiltradas = (estadoTab, metodoTab) => {
        return orders.filter(order =>
            (estadoTab === 'todos' || order.estado === estadoTab) &&
            (metodoTab === 'todos' || order.metodoPago === metodoTab) &&
            (filtroEstado === 'todos' || order.estado === filtroEstado) &&
            (filtroMetodo === 'todos' || order.metodoPago === filtroMetodo)
        );
    };

    // 🔥 CANTIDADES PARA TABS
    const totalTodas = orders.length;
    const totalPagadas = orders.filter(o => o.estado === 'pagado').length;
    const totalPendientes = orders.filter(o => o.estado === 'pendiente').length;
    const totalEfectivo = orders.filter(o => o.metodoPago === 'efectivo').length;
    const totalTarjeta = orders.filter(o => o.metodoPago === 'tarjeta').length;

    // 🔥 PAGINADOR LOCAL
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

    const renderOrdersTab = (estadoTab, metodoTab, titulo, icon) => {
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
                            className="bg-blue-900 text-white py-3 px-6 rounded-xl hover:bg-blue-800 transition-all"
                        >
                            🛒 Explorar Productos
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 🔥 FILTROS POR TAB */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <span className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                                        {icon} Total: {totalItems} {titulo.toLowerCase()}
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

                        {/* 🔥 CARDS ORDENES */}
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
                                                }`}
                                        >
                                            {order.estado === 'pagado' ? '✅ Pagado' : '⏳ Pendiente'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/dashboard/productos/${order.productos[0]?.producto?._id}`)}
                                        className="bg-gradient-to-r from-blue-900 to-blue-900 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-800 hover:to-blue-800 transform hover:scale-105 transition-all"
                                    >
                                        👁️ Ver Producto
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* 🔥 PAGINADOR ESTABLE */}
                        {totalPaginas > 1 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 border flex justify-center gap-2">
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
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent text-center mb-12">
                        💳 Historial de Compras
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
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                            <Tabs>
                                <TabList className="flex border-b border-gray-200">
                                    <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-blue-800 focus:outline-none">
                                        <span className="text-2xl mb-1">📋</span>
                                        Todas ({totalTodas})
                                    </Tab>
                                    <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-green-600 focus:outline-none">
                                        <span className="text-2xl mb-1">✅</span>
                                        Pagadas ({totalPagadas})
                                    </Tab>
                                    <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-yellow-600 focus:outline-none">
                                        <span className="text-2xl mb-1">⏳</span>
                                        Pendientes ({totalPendientes})
                                    </Tab>
                                    <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-green-600 focus:outline-none">
                                        <span className="text-2xl mb-1">💵</span>
                                        Efectivo ({totalEfectivo})
                                    </Tab>
                                    <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-blue-600 focus:outline-none">
                                        <span className="text-2xl mb-1">💳</span>
                                        Tarjeta ({totalTarjeta})
                                    </Tab>
                                </TabList>

                                {renderOrdersTab('todos', 'todos', 'Todas', '📋')}
                                {renderOrdersTab('pagado', 'todos', 'Pagadas', '✅')}
                                {renderOrdersTab('pendiente', 'todos', 'Pendientes', '⏳')}
                                {renderOrdersTab('todos', 'efectivo', 'Efectivo', '💵')}
                                {renderOrdersTab('todos', 'tarjeta', 'Tarjeta', '💳')}
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