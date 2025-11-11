// src/pages/HistorialPagos.jsx
import  { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import useFetch from '../../hooks/useFetch';
import storeAuth from '../../context/storeAuth';
import BotonRecibirProducto from '../../pages/pagos/BotonRecibirProducto';
import BotonCancelarOrden from '../../pages/pagos/BotonCancelarOrden';
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
    AlertCircle,
    FileCheck
} from 'lucide-react';

const HistorialPagos = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroMetodo, setFiltroMetodo] = useState('todos');
    const [paginaActual, setPaginaActual] = useState(1);
    const ordersPorPagina = 5;

    const { fetchDataBackend } = useFetch();
    const navigate = useNavigate();
    const token = storeAuth((state) => state.token);

    // Cargar historial
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
        switch (tipo?.toLowerCase()) {
            case 'transferencia': return <Banknote className="w-4 h-4" />;
            case 'tarjeta': return <CreditCard className="w-4 h-4" />;
            case 'retiro': return <MapPin className="w-4 h-4" />;
            default: return <DollarSign className="w-4 h-4" />;
        }
    };

    // Badge de estado
    const getEstadoBadge = (estado) => {
        const config = {
            completada: { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3 h-3" />, texto: 'COMPLETADA' },
            pago_confirmado_vendedor: { color: 'bg-blue-100 text-blue-700', icon: <CreditCard className="w-3 h-3" />, texto: 'PAGO CONFIRMADO' },
            comprobante_subido: { color: 'bg-yellow-100 text-yellow-700', icon: <Package className="w-3 h-3" />, texto: 'COMPROBANTE SUBIDO' },
            pendiente_pago: { color: 'bg-orange-100 text-orange-700', icon: <Clock className="w-3 h-3" />, texto: 'PENDIENTE PAGO' },
            cancelada: { color: 'bg-red-100 text-red-700', icon: <X className="w-3 h-3" />, texto: 'CANCELADA' }
        };
        const data = config[estado] || { color: 'bg-gray-100 text-gray-700', icon: <AlertCircle className="w-3 h-3" />, texto: estado?.toUpperCase() || 'DESCONOCIDO' };
        return (
            <span className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0 ${data.color}`}>
                {data.icon}
                <span className="hidden sm:inline">{data.texto}</span>
            </span>
        );
    };

    // Filtro
    const getOrdersFiltradas = (estadoTab) => {
        return orders.filter(order => {
            const estadosPermitidos = Array.isArray(estadoTab) ? estadoTab : [estadoTab];
            const matchEstado = estadoTab === 'todos' || estadosPermitidos.includes(order.estado);
            const tipoOrden = order.tipoPago || order.metodoPagoVendedor?.tipo;
            const matchMetodo = filtroMetodo === 'todos' || tipoOrden?.toLowerCase() === filtroMetodo.toLowerCase();
            return matchEstado && matchMetodo;
        });
    };

    // Paginación
    const getPaginacion = (ordenesFiltradas) => {
        const totalOrdenes = ordenesFiltradas.length;
        const totalPaginas = Math.ceil(totalOrdenes / ordersPorPagina);
        const indexInicio = (paginaActual - 1) * ordersPorPagina;
        const indexFin = indexInicio + ordersPorPagina;
        const ordenesPaginadas = ordenesFiltradas.slice(indexInicio, indexFin);
        return { ordenesPaginadas, totalOrdenes, totalPaginas };
    };

    // Contadores
    const totalTodas = orders.length;
    const totalCompletadas = orders.filter(o => o.estado === 'completada').length;
    const totalPagoConfirmado = orders.filter(o => o.estado === 'pago_confirmado_vendedor').length;
    const totalPendientes = orders.filter(o => ['pendiente_pago', 'comprobante_subido'].includes(o.estado)).length;
    const totalCanceladas = orders.filter(o => o.estado === 'cancelada').length;

    // Render panel
    const renderTabPanel = (tabKey, titulo) => {
        const ordenesFiltradas = getOrdersFiltradas(tabKey);
        const { ordenesPaginadas, totalOrdenes, totalPaginas } = getPaginacion(ordenesFiltradas);

        return (
            <TabPanel>
                {/* Filtro + resumen */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg lg:rounded-xl p-3 lg:p-6 mb-4 lg:mb-6 border border-blue-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
                        <div className="flex items-center gap-2 lg:gap-3">
                            <div className="bg-blue-600 p-2 lg:p-3 rounded-lg">
                                <Package className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs lg:text-sm text-gray-600">Total {titulo}</p>
                                <p className="text-xl lg:text-2xl font-bold text-gray-800">{totalOrdenes}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
                            <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
                            <select
                                value={filtroMetodo}
                                onChange={(e) => {
                                    setFiltroMetodo(e.target.value);
                                    setPaginaActual(1);
                                }}
                                className="flex-1 sm:flex-none px-2 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium shadow-sm"
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
                {totalOrdenes === 0 ? (
                    <div className="text-center py-8 lg:py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-full mb-3 lg:mb-4">
                            <ShoppingCart className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-base lg:text-lg font-medium">
                            No hay {titulo.toLowerCase()} registradas
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 mb-4 lg:mb-6">
                            {ordenesPaginadas.map((order) => {
                                const metodo = order.metodoPagoVendedor;
                                const tipoPago = order.tipoPago || metodo?.tipo;

                                return (
                                    <div key={order._id} className="bg-white rounded-lg lg:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
                                        {/* Header */}
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 lg:p-4 border-b border-gray-200">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500 mb-0.5">Vendedor</p>
                                                    <p className="font-semibold text-sm lg:text-base text-gray-800 truncate">
                                                        {order.vendedor?.nombre} {order.vendedor?.apellido}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{order.vendedor?.email}</p>
                                                </div>
                                                {getEstadoBadge(order.estado)}
                                            </div>
                                        </div>

                                        {/* Producto */}
                                        <div className="p-3 lg:p-4">
                                            <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-gray-50 rounded-lg">
                                                <img
                                                    src={order.producto?.imagen || 'https://via.placeholder.com/100'}
                                                    alt={order.producto?.nombreProducto}
                                                    className="w-14 h-14 lg:w-16 lg:h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-xs lg:text-base text-gray-800 truncate">
                                                        {order.producto?.nombreProducto}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Cantidad: {order.cantidad}</p>
                                                    <p className="text-xs text-gray-500">Precio: ${order.producto?.precio || 0}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-xs text-gray-500">Subtotal</p>
                                                    <p className="font-bold text-sm lg:text-base text-gray-800">
                                                        ${order.total?.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="px-3 lg:px-4 pb-3 lg:pb-4">
                                            <div className="flex justify-between items-center pt-2 lg:pt-3 border-t border-gray-200 mb-2 lg:mb-3">
                                                <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-gray-600">
                                                    {getMetodoIcon(tipoPago)}
                                                    <span className="capitalize font-medium truncate">
                                                        {tipoPago || "Sin especificar"}
                                                    </span>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-xs text-gray-500">Total</p>
                                                    <p className="text-lg lg:text-xl font-bold text-blue-600">
                                                        ${order.total?.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Detalles pago */}
                                            {metodo && (
                                                <div className="bg-blue-50 rounded-lg p-2 mb-2 text-xs">
                                                    <p className="font-semibold text-blue-800 mb-1">Instrucciones:</p>
                                                    {metodo.banco && <p className="text-gray-700">Banco: {metodo.banco}</p>}
                                                    {metodo.numeroCuenta && <p className="text-gray-700">Cuenta: {metodo.numeroCuenta}</p>}
                                                    {metodo.lugares?.length > 0 && <p className="text-gray-700">Lugares: {metodo.lugares.join(", ")}</p>}
                                                </div>
                                            )}

                                            {/* Lugar de retiro */}
                                            {order.lugarRetiroSeleccionado && (
                                                <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="font-semibold">Entrega:</span> {order.lugarRetiroSeleccionado}
                                                </p>
                                            )}

                                            {/* Comprobante */}
                                            {order.comprobantePago && (
                                                <a
                                                    href={order.comprobantePago}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full bg-purple-100 text-purple-700 py-1.5 lg:py-2 px-3 lg:px-4 rounded-lg font-medium text-xs lg:text-sm hover:bg-purple-200 transition-colors flex items-center justify-center gap-1 lg:gap-2 mb-2"
                                                >
                                                    <FileCheck className="w-3 h-3 lg:w-4 lg:h-4" />
                                                    Ver Comprobante
                                                </a>
                                            )}

                                            {/* Botón Cancelar Orden (solo si está pendiente o con comprobante subido) */}
                                            {(order.estado === 'pendiente_pago' || order.estado === 'comprobante_subido') && (
                                                <BotonCancelarOrden
                                                    ordenId={order._id}
                                                    onSuccess={fetchHistorial}
                                                />
                                            )}

                                            {/* Botón Recibir */}
                                            {order.estado === 'pago_confirmado_vendedor' && (
                                                <BotonRecibirProducto
                                                    ordenId={order._id}
                                                    onSuccess={fetchHistorial}
                                                />
                                            )}

                                            {/* Fecha completada */}
                                            {order.estado === 'completada' && order.fechaCompletada && (
                                                <p className="text-xs text-emerald-600 text-center mt-2">
                                                    Entrega confirmada: {formatDate(order.fechaCompletada)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Paginación */}
                        {totalPaginas > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-4 mt-6 lg:mt-8 bg-white p-3 lg:p-4 rounded-lg shadow-md border border-gray-200">
                                <div className="text-xs lg:text-sm text-gray-600 text-center sm:text-left">
                                    Mostrando {((paginaActual - 1) * ordersPorPagina) + 1} - {Math.min(paginaActual * ordersPorPagina, totalOrdenes)} de {totalOrdenes}
                                </div>
                                <div className="flex items-center gap-1 lg:gap-2 flex-wrap justify-center">
                                    <button
                                        onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                                        disabled={paginaActual === 1}
                                        className="px-2 lg:px-4 py-1.5 lg:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs lg:text-sm font-medium"
                                    >
                                        <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span className="hidden sm:inline">Anterior</span>
                                    </button>
                                    <div className="flex gap-0.5 lg:gap-1">
                                        {[...Array(totalPaginas)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPaginaActual(i + 1)}
                                                className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg font-semibold text-xs lg:text-sm transition-all ${paginaActual === i + 1
                                                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                                                    : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                                        disabled={paginaActual === totalPaginas}
                                        className="px-2 lg:px-4 py-1.5 lg:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs lg:text-sm font-medium"
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
            <div className="min-h-screen flex items-center justify-center bg-blue-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 text-sm lg:text-base">Cargando historial...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-50">
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
        <>
            <ToastContainer />
            <div className="mt-8 sm:mt-10"></div>

            <main className="py-4 lg:py-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-3 lg:px-4">
                    {/* Header */}
                    <div className="text-center mb-4 lg:mb-8">
                        <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-2 lg:mb-3">
                            Historial de Compras
                        </h1>
                        <p className="text-xs lg:text-base text-gray-600">Revisa todas tus órdenes y su estado actual</p>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 lg:gap-4 mb-4 lg:mb-8">
                        <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-3 lg:p-6 border border-gray-200">
                            <div className="flex items-center gap-2 lg:gap-4">
                                <div className="bg-blue-100 p-2 lg:p-4 rounded-lg flex-shrink-0">
                                    <Package className="w-5 h-5 lg:w-8 lg:h-8 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs lg:text-sm text-gray-600">Total</p>
                                    <p className="text-xl lg:text-3xl font-bold text-gray-800">{totalTodas}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-3 lg:p-6 border border-gray-200">
                            <div className="flex items-center gap-2 lg:gap-4">
                                <div className="bg-orange-100 p-2 lg:p-4 rounded-lg flex-shrink-0">
                                    <Clock className="w-5 h-5 lg:w-8 lg:h-8 text-orange-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs lg:text-sm text-gray-600">Pendientes</p>
                                    <p className="text-xl lg:text-3xl font-bold text-gray-800">{totalPendientes}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-3 lg:p-6 border border-gray-200">
                            <div className="flex items-center gap-2 lg:gap-4">
                                <div className="bg-blue-100 p-2 lg:p-4 rounded-lg flex-shrink-0">
                                    <CreditCard className="w-5 h-5 lg:w-8 lg:h-8 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs lg:text-sm text-gray-600">Confirmadas</p>
                                    <p className="text-xl lg:text-3xl font-bold text-gray-800">{totalPagoConfirmado}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-3 lg:p-6 border border-gray-200">
                            <div className="flex items-center gap-2 lg:gap-4">
                                <div className="bg-emerald-100 p-2 lg:p-4 rounded-lg flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 lg:w-8 lg:h-8 text-emerald-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs lg:text-sm text-gray-600">Completadas</p>
                                    <p className="text-xl lg:text-3xl font-bold text-gray-800">{totalCompletadas}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-3 lg:p-6 border border-gray-200">
                            <div className="flex items-center gap-2 lg:gap-4">
                                <div className="bg-red-100 p-2 lg:p-4 rounded-lg flex-shrink-0">
                                    <X className="w-5 h-5 lg:w-8 lg:h-8 text-red-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs lg:text-sm text-gray-600">Canceladas</p>
                                    <p className="text-xl lg:text-3xl font-bold text-gray-800">{totalCanceladas}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg lg:rounded-2xl shadow-xl border border-gray-200 p-3 lg:p-6">
                        <Tabs onSelect={() => setPaginaActual(1)}>
                            <TabList className="flex border-b-2 border-gray-200 mb-4 lg:mb-6 gap-1 lg:gap-2 overflow-x-auto">
                                <Tab className="flex-1 min-w-fit py-2 lg:py-3 px-2 lg:px-4 text-center font-semibold text-xs lg:text-sm text-gray-600 cursor-pointer hover:text-blue-600 hover:bg-blue-50 rounded-t-lg transition-colors whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1 lg:gap-2">
                                        <Package className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span>Todas ({totalTodas})</span>
                                    </div>
                                </Tab>
                                <Tab className="flex-1 min-w-fit py-2 lg:py-3 px-2 lg:px-4 text-center font-semibold text-xs lg:text-sm text-gray-600 cursor-pointer hover:text-orange-600 hover:bg-orange-50 rounded-t-lg transition-colors whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1 lg:gap-2">
                                        <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span>Pendientes ({totalPendientes})</span>
                                    </div>
                                </Tab>
                                <Tab className="flex-1 min-w-fit py-2 lg:py-3 px-2 lg:px-4 text-center font-semibold text-xs lg:text-sm text-gray-600 cursor-pointer hover:text-blue-600 hover:bg-blue-50 rounded-t-lg transition-colors whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1 lg:gap-2">
                                        <CreditCard className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span>Confirmadas ({totalPagoConfirmado})</span>
                                    </div>
                                </Tab>
                                <Tab className="flex-1 min-w-fit py-2 lg:py-3 px-2 lg:px-4 text-center font-semibold text-xs lg:text-sm text-gray-600 cursor-pointer hover:text-emerald-600 hover:bg-emerald-50 rounded-t-lg transition-colors whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1 lg:gap-2">
                                        <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span>Completadas ({totalCompletadas})</span>
                                    </div>
                                </Tab>
                                <Tab className="flex-1 min-w-fit py-2 lg:py-3 px-2 lg:px-4 text-center font-semibold text-xs lg:text-sm text-gray-600 cursor-pointer hover:text-red-600 hover:bg-red-50 rounded-t-lg transition-colors whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1 lg:gap-2">
                                        <X className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span>Canceladas ({totalCanceladas})</span>
                                    </div>
                                </Tab>
                            </TabList>

                            {renderTabPanel('todos', 'Órdenes')}
                            {renderTabPanel(['pendiente_pago', 'comprobante_subido'], 'Pendientes')}
                            {renderTabPanel('pago_confirmado_vendedor', 'Confirmadas')}
                            {renderTabPanel('completada', 'Completadas')}
                            {renderTabPanel('cancelada', 'Canceladas')}
                        </Tabs>
                    </div>
                </div>
            </main>
        </>
    );
};

export default HistorialPagos;