import React, { useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import useFetch from "../../hooks/useFetch";
import { toast, ToastContainer } from "react-toastify";
import { 
    ShoppingBag, 
    Clock, 
    CheckCircle, 
    Filter,
    DollarSign,
    CreditCard,
    Banknote,
    Package,
    TrendingUp,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

export default function HistorialVentas() {
    const { fetchDataBackend } = useFetch();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroPago, setFiltroPago] = useState("todos");
    const [paginaActual, setPaginaActual] = useState(1);
    const ventasPorPagina = 5;

    const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const cargarVentas = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/historial-ventas`;
                const data = await fetchDataBackend(url, {
                    method: "GET",
                    config: { headers },
                });
                setVentas(data);
            } catch {
                toast.error("Error al cargar historial de ventas");
            } finally {
                setLoading(false);
            }
        };
        cargarVentas();
    }, []);

    const marcarComoPagado = async (idVenta) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/ventas/${idVenta}/pagar`;
            await fetchDataBackend(url, {
                method: "PUT",
                config: { headers },
            });
            setVentas((prev) =>
                prev.map((v) => (v._id === idVenta ? { ...v, estado: "pagado" } : v))
            );
            toast.success("Venta marcada como pagada");
        } catch {
            toast.error("No se pudo actualizar la venta");
        }
    };

    const getVentasFiltradas = (estadoTab) => {
        const filtradas = ventas.filter(
            (v) =>
                (estadoTab === "todos" || v.estado === estadoTab) &&
                (filtroPago === "todos" ||
                    v.metodoPago.toLowerCase() === filtroPago.toLowerCase())
        );
        
        return filtradas;
    };

    const getPaginacion = (ventasFiltradas) => {
        const totalVentas = ventasFiltradas.length;
        const totalPaginas = Math.ceil(totalVentas / ventasPorPagina);
        const indexInicio = (paginaActual - 1) * ventasPorPagina;
        const indexFin = indexInicio + ventasPorPagina;
        const ventasPaginadas = ventasFiltradas.slice(indexInicio, indexFin);

        return { ventasPaginadas, totalVentas, totalPaginas };
    };

    const getMetodoPagoIcon = (metodo) => {
        const iconos = {
            efectivo: <Banknote className="w-4 h-4" />,
            transferencia: <CreditCard className="w-4 h-4" />,
            tarjeta: <CreditCard className="w-4 h-4" />
        };
        return iconos[metodo.toLowerCase()] || <DollarSign className="w-4 h-4" />;
    };

    const calcularEstadisticas = () => {
        const total = ventas.reduce((sum, v) => sum + v.total, 0);
        const pagadas = ventas.filter(v => v.estado === "pagado").length;
        const pendientes = ventas.filter(v => v.estado === "pendiente").length;
        
        return { total, pagadas, pendientes };
    };

    const stats = calcularEstadisticas();

    const renderVentasTab = (estadoTab, titulo) => {
        const ventasFiltradas = getVentasFiltradas(estadoTab);
        const { ventasPaginadas, totalVentas, totalPaginas } = getPaginacion(ventasFiltradas);

        return (
            <TabPanel>
                {/* Filtro y resumen */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg lg:rounded-xl p-3 lg:p-6 mb-4 lg:mb-6 border border-blue-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
                        <div className="flex items-center gap-2 lg:gap-3">
                            <div className="bg-blue-600 p-2 lg:p-3 rounded-lg">
                                <Package className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs lg:text-sm text-gray-600">Total {titulo}</p>
                                <p className="text-xl lg:text-2xl font-bold text-gray-800">{totalVentas}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
                            <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
                            <select
                                value={filtroPago}
                                onChange={(e) => {
                                    setFiltroPago(e.target.value);
                                    setPaginaActual(1);
                                }}
                                className="flex-1 sm:flex-none px-2 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium shadow-sm"
                            >
                                <option value="todos">Todos los métodos</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="tarjeta">Tarjeta</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Listado de ventas */}
                {totalVentas === 0 ? (
                    <div className="text-center py-8 lg:py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-full mb-3 lg:mb-4">
                            <ShoppingBag className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-base lg:text-lg font-medium">
                            No hay {titulo.toLowerCase()} registradas
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 mb-4 lg:mb-6">
                            {ventasPaginadas.map((venta) => (
                                <div
                                    key={venta._id}
                                    className="bg-white rounded-lg lg:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden"
                                >
                                    {/* Header de la venta */}
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 lg:p-4 border-b border-gray-200">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 mb-0.5">Comprador</p>
                                                <p className="font-semibold text-sm lg:text-base text-gray-800 truncate">
                                                    {venta.comprador?.nombre} {venta.comprador?.apellido}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0 ${
                                                    venta.estado === "pagado"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                                {venta.estado === "pagado" ? (
                                                    <CheckCircle className="w-3 h-3" />
                                                ) : (
                                                    <Clock className="w-3 h-3" />
                                                )}
                                                <span className="hidden sm:inline">{venta.estado.toUpperCase()}</span>
                                                <span className="sm:hidden">{venta.estado === "pagado" ? "Pagado" : "Pendiente"}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Productos */}
                                    <div className="p-3 lg:p-4 space-y-2 lg:space-y-3">
                                        {venta.productos?.map(
                                            ({ producto, cantidad, precioUnitario, subtotal }) => (
                                                <div
                                                    key={producto?._id}
                                                    className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <img
                                                        src={producto?.imagen || "/placeholder.png"}
                                                        alt={producto?.nombreProducto || "Producto"}
                                                        className="w-10 h-10 lg:w-14 lg:h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-xs lg:text-base text-gray-800 truncate">
                                                            {producto?.nombreProducto}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {cantidad}x ${precioUnitario}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-bold text-xs lg:text-base text-gray-800">${subtotal}</p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    {/* Footer de la venta */}
                                    <div className="px-3 lg:px-4 pb-3 lg:pb-4">
                                        <div className="flex justify-between items-center pt-2 lg:pt-3 border-t border-gray-200 mb-2 lg:mb-3">
                                            <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-gray-600">
                                                {getMetodoPagoIcon(venta.metodoPago)}
                                                <span className="capitalize font-medium truncate">
                                                    {venta.metodoPago}
                                                </span>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs text-gray-500">Total</p>
                                                <p className="text-lg lg:text-xl font-bold text-blue-600">
                                                    ${venta.total}
                                                </p>
                                            </div>
                                        </div>

                                        {venta.estado === "pendiente" && (
                                            <button
                                                onClick={() => marcarComoPagado(venta._id)}
                                                className="w-full bg-blue-600 text-white py-1.5 lg:py-2 px-3 lg:px-4 rounded-lg font-medium text-xs lg:text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 lg:gap-2"
                                            >
                                                <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                                                Marcar pagado
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Paginador */}
                        {totalPaginas > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-4 mt-6 lg:mt-8 bg-white p-3 lg:p-4 rounded-lg shadow-md border border-gray-200">
                                <div className="text-xs lg:text-sm text-gray-600 text-center sm:text-left">
                                    Mostrando {((paginaActual - 1) * ventasPorPagina) + 1} - {Math.min(paginaActual * ventasPorPagina, totalVentas)} de {totalVentas}
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
                                        {[...Array(totalPaginas)].map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setPaginaActual(index + 1)}
                                                className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg font-semibold text-xs lg:text-sm transition-all ${
                                                    paginaActual === index + 1
                                                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                                                        : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                                                }`}
                                            >
                                                {index + 1}
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

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 text-sm lg:text-base">Cargando historial...</p>
                </div>
            </div>
        );

    return (
        <>
            <ToastContainer />
            <div className="mt-30 md:mt-8"></div>

            <main className="py-4 lg:py-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-3 lg:px-4">
                    {/* Header con estadísticas */}
                    <div className="text-center mb-4 lg:mb-8">
                        <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                            <h1 className="text-2xl lg:text-4xl font-bold text-gray-800">
                                Historial de Ventas
                            </h1>
                        </div>
                        <p className="text-xs lg:text-base text-gray-600">Gestiona y visualiza todas tus transacciones</p>
                    </div>

                    {/* Tarjetas de estadísticas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6 mb-4 lg:mb-8">
                        <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-3 lg:p-6 border border-gray-200">
                            <div className="flex items-center gap-3 lg:gap-4">
                                <div className="bg-blue-100 p-2 lg:p-4 rounded-lg flex-shrink-0">
                                    <ShoppingBag className="w-5 h-5 lg:w-8 lg:h-8 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs lg:text-sm text-gray-600">Total Ventas</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-gray-800">{ventas.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-3 lg:p-6 border border-gray-200">
                            <div className="flex items-center gap-3 lg:gap-4">
                                <div className="bg-yellow-100 p-2 lg:p-4 rounded-lg flex-shrink-0">
                                    <Clock className="w-5 h-5 lg:w-8 lg:h-8 text-yellow-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs lg:text-sm text-gray-600">Pendientes</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.pendientes}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-3 lg:p-6 border border-gray-200">
                            <div className="flex items-center gap-3 lg:gap-4">
                                <div className="bg-green-100 p-2 lg:p-4 rounded-lg flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 lg:w-8 lg:h-8 text-green-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs lg:text-sm text-gray-600">Completadas</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-gray-800">{stats.pagadas}</p>
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
                                        <ShoppingBag className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span>Todas ({ventas.length})</span>
                                    </div>
                                </Tab>
                                <Tab className="flex-1 min-w-fit py-2 lg:py-3 px-2 lg:px-4 text-center font-semibold text-xs lg:text-sm text-gray-600 cursor-pointer hover:text-yellow-600 hover:bg-yellow-50 rounded-t-lg transition-colors whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1 lg:gap-2">
                                        <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span>Pendientes ({ventas.filter((v) => v.estado === "pendiente").length})</span>
                                    </div>
                                </Tab>
                                <Tab className="flex-1 min-w-fit py-2 lg:py-3 px-2 lg:px-4 text-center font-semibold text-xs lg:text-sm text-gray-600 cursor-pointer hover:text-green-600 hover:bg-green-50 rounded-t-lg transition-colors whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1 lg:gap-2">
                                        <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span>Pagadas ({ventas.filter((v) => v.estado === "pagado").length})</span>
                                    </div>
                                </Tab>
                            </TabList>

                            {renderVentasTab("todos", "Ventas")}
                            {renderVentasTab("pendiente", "Pendientes")}
                            {renderVentasTab("pagado", "Pagadas")}
                        </Tabs>
                    </div>
                </div>
            </main>
        </>
    );
}