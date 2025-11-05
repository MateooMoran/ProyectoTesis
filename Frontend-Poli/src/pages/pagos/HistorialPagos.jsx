// src/pages/HistorialPagos.jsx
import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useFetch from '../../hooks/useFetch';
import storeAuth from '../../context/storeAuth';
import BotonRecibirProducto from '../../pages/pagos/BotonRecibirProducto';
import {
    CheckCircle,
    Clock,
    Package,
    CreditCard,
    Banknote,
    MapPin,
    ShoppingCart,
    Filter,
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    DollarSign,
    X,
} from 'lucide-react';

const HistorialPagos = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroMetodo, setFiltroMetodo] = useState('todos');
    const [currentPage, setCurrentPage] = useState({});
    const ordersPorPagina = 4;

    const { fetchDataBackend } = useFetch();
    const navigate = useNavigate();
    const token = storeAuth((state) => state.token);

    // Función reutilizable para cargar datos
    const fetchHistorial = async () => {
        if (!token) {
            setError('Debes iniciar sesión');
            setLoading(false);
            return;
        }

        try {
            const data = await fetchDataBackend(
                `${import.meta.env.VITE_BACKEND_URL}/estudiante/historial-pagos`,
                {
                    method: 'GET',
                    config: { headers: { Authorization: `Bearer ${token}` } },
                }
            );
            setOrders(data || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Error al cargar el historial');
            toast.error(err.message || 'Error al cargar el historial');
        } finally {
            setLoading(false);
        }
    };

    // Cargar al montar
    useEffect(() => {
        fetchHistorial();
    }, [fetchDataBackend, token]);

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Ícono por método
    const getMetodoIcon = (tipo) => {
        switch (tipo) {
            case 'transferencia': return <Banknote className="w-4 h-4" />;
            case 'tarjeta': return <CreditCard className="w-4 h-4" />;
            case 'retiro': return <MapPin className="w-4 h-4" />;
            default: return <DollarSign className="w-4 h-4" />;
        }
    };

    // Configuración de estado
    const getEstadoConfig = (estado) => {
        const config = {
            completada: { label: 'Completada', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
            pago_confirmado_vendedor: { label: 'Pago Confirmado', color: 'bg-blue-100 text-blue-800', icon: CreditCard },
            comprobante_subido: { label: 'Comprobante Subido', color: 'bg-yellow-100 text-yellow-800', icon: Package },
            pendiente_pago: { label: 'Pendiente Pago', color: 'bg-orange-100 text-orange-800', icon: Clock },
            cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: X },
        };
        return config[estado] || { label: estado, color: 'bg-gray-100 text-gray-800', icon: Clock };
    };

    // Filtro que acepta string o array
    const getOrdersFiltradas = (estadoTab) => {
        return orders.filter(order => {
            const estadosPermitidos = Array.isArray(estadoTab) ? estadoTab : [estadoTab];
            const matchEstado = estadoTab === 'todos' || estadosPermitidos.includes(order.estado);
            const tipoOrden = order.tipoPago || order.metodoPagoVendedor?.tipo;
            const matchMetodo = filtroMetodo === 'todos' || tipoOrden === filtroMetodo;
            return matchEstado && matchMetodo;
        });
    };

    // Paginación
    const getCurrentPage = (tab) => currentPage[tab] || 1;
    const setCurrentPageLocal = (pagina, tab) => {
        setCurrentPage(prev => ({ ...prev, [tab]: pagina }));
    };
    const getOrdersPaginadas = (tab) => {
        const filtradas = getOrdersFiltradas(tab);
        const page = getCurrentPage(tab);
        const start = (page - 1) * ordersPorPagina;
        return filtradas.slice(start, start + ordersPorPagina);
    };
    const getTotalPaginas = (tab) => Math.ceil(getOrdersFiltradas(tab).length / ordersPorPagina);

    const handlePageChange = (nuevaPagina, tab) => {
        const total = getTotalPaginas(tab);
        if (nuevaPagina >= 1 && nuevaPagina <= total) {
            setCurrentPageLocal(nuevaPagina, tab);
        }
    };

    // Renderizar panel con recarga
    const renderTabPanel = (tabKey, titulo, Icon) => {
        const ordersActuales = getOrdersPaginadas(tabKey);
        const totalPaginas = getTotalPaginas(tabKey);
        const totalItems = getOrdersFiltradas(tabKey).length;
        const paginaActual = getCurrentPage(tabKey);

        return (
            <TabPanel>
                {totalItems === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg mb-4">No hay {titulo.toLowerCase()}</p>
                        <button
                            onClick={() => navigate('/dashboard/listarProd')}
                            className="bg-blue-900 text-white py-3 px-6 rounded-xl hover:bg-blue-800 transition-all flex items-center gap-2 mx-auto"
                        >
                            <ShoppingCart className="w-5 h-5" /> Explorar Productos
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Filtros */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                                        <Icon className="w-5 h-5" /> Total: {totalItems}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        Pág {paginaActual} de {totalPaginas}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Filter className="w-5 h-5 text-gray-600" />
                                    <select
                                        value={filtroMetodo}
                                        onChange={(e) => {
                                            setFiltroMetodo(e.target.value);
                                            setCurrentPageLocal(1, tabKey);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                                    >
                                        <option value="todos">Todos los métodos</option>
                                        <option value="transferencia">Transferencia</option>
                                        <option value="tarjeta">Tarjeta</option>
                                        <option value="retiro">Retiro en local</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Órdenes */}
                        <div className="space-y-4">
                            {ordersActuales.map((order) => {
                                const estado = getEstadoConfig(order.estado);
                                const metodo = order.metodoPagoVendedor;

                                return (
                                    <div key={order._id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-200 p-6">
                                        <div className="flex flex-col lg:flex-row gap-4">
                                            <img
                                                src={order.producto.imagen || 'https://via.placeholder.com/100'}
                                                alt={order.producto.nombreProducto}
                                                className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                                            />

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
                                                    {order.producto.nombreProducto}
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                                                    <p className="flex items-center gap-1">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                        <span className="font-bold">Vendedor:</span> {order.vendedor.nombre} {order.vendedor.apellido}
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        <span className="font-bold">Compra:</span> {formatDate(order.createdAt)}
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4 text-gray-500" />
                                                        <span className="font-bold">Total:</span> ${order.total.toFixed(2)}
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        {getMetodoIcon(order.tipoPago || metodo?.tipo)}
                                                        <span className="font-bold">Método:</span> {
                                                            (order.tipoPago || metodo?.tipo)?.charAt(0).toUpperCase() + 
                                                            (order.tipoPago || metodo?.tipo)?.slice(1)
                                                        }
                                                    </p>
                                                </div>

                                                {/* Estado + Fecha entrega */}
                                                <div className="flex flex-col gap-1">

                                                    {order.lugarRetiroSeleccionado && (
                                                        <span className="text-xs text-gray-600 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span className='font-bold text-sm '>Lugar de entrega: </span>
                                                            {order.lugarRetiroSeleccionado}
                                                        </span>
                                                    )}
                                                    {order.estado === 'completada' && order.fechaCompletada && (
                                                        <p className="text-sm text-emerald-600 flex items-center gap-1 mt-3">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Entrega confirmada el {formatDate(order.fechaCompletada)}
                                                        </p>
                                                    )}
                                                    <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold ${estado.color}`}>
                                                        <estado.icon className="w-4 h-4" />
                                                        {estado.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Botones */}
                                            <div className="flex flex-col gap-3 w-full lg:w-auto">
                                                <button
                                                    onClick={() => navigate(`/productos/${producto._id}`)}
                                                    className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 transform hover:scale-105 transition-all"
                                                >
                                                    Ver Producto
                                                </button>

                                                {order.estado === 'pago_confirmado_vendedor' && (
                                                    <BotonRecibirProducto
                                                        ordenId={order._id}
                                                        onSuccess={fetchHistorial}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {order.comprobantePago && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <a
                                                    href={order.comprobantePago}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                                >
                                                    Ver comprobante subido
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Paginación */}
                        {totalPaginas > 1 && (
                            <div className="mt-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <p className="text-sm text-gray-600">
                                        Mostrando {(paginaActual - 1) * ordersPorPagina + 1} - {Math.min(paginaActual * ordersPorPagina, totalItems)} de {totalItems}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(paginaActual - 1, tabKey)}
                                            disabled={paginaActual === 1}
                                            className="px-4 py-2 bg-blue-800 text-white rounded-xl disabled:bg-gray-400 hover:bg-blue-700 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Anterior
                                        </button>

                                        <div className="flex gap-1">
                                            {[...Array(totalPaginas)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => handlePageChange(i + 1, tabKey)}
                                                    className={`w-10 h-10 rounded-xl font-semibold transition-all ${paginaActual === i + 1
                                                        ? 'bg-blue-800 text-white shadow-lg'
                                                        : 'bg-gray-200 hover:bg-blue-100'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(paginaActual + 1, tabKey)}
                                            disabled={paginaActual === totalPaginas}
                                            className="px-4 py-2 bg-blue-800 text-white rounded-xl disabled:bg-gray-400 hover:bg-blue-700 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            Siguiente
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </TabPanel>
        );
    };

    // Contadores
    const totalTodas = orders.length;
    const totalCompletadas = orders.filter(o => o.estado === 'completada').length;
    const totalPagoConfirmado = orders.filter(o => o.estado === 'pago_confirmado_vendedor').length;
    const totalPendientes = orders.filter(o => ['pendiente_pago', 'comprobante_subido'].includes(o.estado)).length;

    // Renderizado condicional
    if (loading) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center py-10">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4">
                        <Package className="w-full h-full" />
                    </div>
                    <p className="text-gray-700 text-lg">Cargando historial...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center py-10">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md">
                    <p className="text-red-700 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-50 py-10 mt-24 md:mt-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">Historial de Compras</h1>
                    <p className="text-base text-gray-600">Revisa todas tus órdenes y su estado actual</p>
                </div>

                <Tabs onSelect={() => setCurrentPage({})}>
                    <TabList className="flex border-b-2 border-gray-300 gap-0 overflow-x-auto bg-white rounded-t-2xl">
                        <Tab className="flex-1 py-4 px-6 text-center font-semibold text-base text-gray-600 cursor-pointer transition-all hover:text-blue-800 hover:bg-blue-50 rounded-tl-2xl focus:outline-none">
                            <div className="flex items-center justify-center gap-2">
                                <Package className="w-5 h-5" />
                                Todas ({totalTodas})
                            </div>
                        </Tab>
                        <Tab className="flex-1 py-4 px-6 text-center font-semibold text-base text-gray-600 cursor-pointer transition-all hover:text-orange-600 hover:bg-orange-50 focus:outline-none">
                            <div className="flex items-center justify-center gap-2">
                                <Clock className="w-5 h-5" />
                                Pendientes ({totalPendientes})
                            </div>
                        </Tab>
                        <Tab className="flex-1 py-4 px-6 text-center font-semibold text-base text-gray-600 cursor-pointer transition-all hover:text-blue-600 hover:bg-blue-50 focus:outline-none">
                            <div className="flex items-center justify-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Pago Confirmado ({totalPagoConfirmado})
                            </div>
                        </Tab>
                        <Tab className="flex-1 py-4 px-6 text-center font-semibold text-base text-gray-600 cursor-pointer transition-all hover:text-emerald-600 hover:bg-emerald-50 rounded-tr-2xl focus:outline-none">
                            <div className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Completadas ({totalCompletadas})
                            </div>
                        </Tab>
                    </TabList>

                    {renderTabPanel('todos', 'órdenes', Package)}
                    {renderTabPanel(['pendiente_pago', 'comprobante_subido'], 'pendientes', Clock)}
                    {renderTabPanel('pago_confirmado_vendedor', 'pago confirmado', CreditCard)}
                    {renderTabPanel('completada', 'completadas', CheckCircle)}
                </Tabs>
            </div>
        </div>
    );
};

export default HistorialPagos;