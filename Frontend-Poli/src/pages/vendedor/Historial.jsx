import React, { useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import useFetch from "../../hooks/useFetch";
import { toast, ToastContainer } from "react-toastify";
import Header from "../../layout/Header";
import Footer from "../../layout/Footer";

export default function HistorialVentas() {
    const { fetchDataBackend } = useFetch();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [ventasPorPagina] = useState(5);
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [filtroPago, setFiltroPago] = useState("todos");

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
            toast.success("Venta marcada como pagada ✅");
        } catch {
            toast.error("No se pudo actualizar la venta");
        }
    };

    // 🔥 Filtros combinados
    const getVentasFiltradas = (estadoTab) => {
        return ventas.filter(
            (v) =>
                (estadoTab === "todos" || v.estado === estadoTab) &&
                (filtroEstado === "todos" || v.estado === filtroEstado) &&
                (filtroPago === "todos" ||
                    v.metodoPago.toLowerCase() === filtroPago.toLowerCase())
        );
    };

    // 🔢 Paginación
    const getVentasActuales = (estadoTab) => {
        const filtradas = getVentasFiltradas(estadoTab);
        const indexUltima = currentPage * ventasPorPagina;
        const indexPrimera = indexUltima - ventasPorPagina;
        return filtradas.slice(indexPrimera, indexUltima);
    };

    const getTotalPaginas = (estadoTab) => {
        const filtradas = getVentasFiltradas(estadoTab);
        return Math.ceil(filtradas.length / ventasPorPagina);
    };

    const handlePageChange = (nuevaPagina, estadoTab) => {
        if (nuevaPagina >= 1 && nuevaPagina <= getTotalPaginas(estadoTab)) {
            setCurrentPage(nuevaPagina);
        }
    };

    const renderVentasTab = (estadoTab, titulo, icono) => {
        const ventasActuales = getVentasActuales(estadoTab);
        const totalPaginas = getTotalPaginas(estadoTab);
        const totalVentas = getVentasFiltradas(estadoTab).length;

        return (
            <TabPanel>
                {/* 🔥 FILTROS — SIEMPRE VISIBLES */}
                <div className="bg-white rounded-2xl shadow-md p-6 border mb-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                            Total: {totalVentas} {titulo.toLowerCase()}
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            <select
                                value={filtroEstado}
                                onChange={(e) => {
                                    setFiltroEstado(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                            >
                                <option value="todos">Todos los estados</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="pagado">Pagado</option>
                            </select>

                            <select
                                value={filtroPago}
                                onChange={(e) => {
                                    setFiltroPago(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                            >
                                <option value="todos">Todos los métodos</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="tarjeta">Tarjeta</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 🔥 LISTADO O MENSAJE */}
                {totalVentas === 0 ? (
                    <p className="text-center text-gray-700 text-lg py-12">
                        No hay {titulo.toLowerCase()} registradas.
                    </p>
                ) : (
                    <>
                        <div className="grid gap-6">
                            {ventasActuales.map((venta) => (
                                <div
                                    key={venta._id}
                                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
                                >
                                    <div className="flex justify-between items-center pb-4 mb-4 border-b">
                                        <div>
                                            <p className="text-sm text-gray-500">Comprador</p>
                                            <p className="text-lg font-semibold">
                                                {venta.comprador?.nombre} {venta.comprador?.apellido}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${venta.estado === "pagado"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {venta.estado.toUpperCase()}
                                            </span>
                                            {venta.estado === "pendiente" && (
                                                <button
                                                    onClick={() => marcarComoPagado(venta._id)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-blue-700 transition"
                                                >
                                                    Marcar como pagado
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {venta.productos?.map(
                                        ({ producto, cantidad, precioUnitario, subtotal }) => (
                                            <div
                                                key={producto?._id}
                                                className="flex items-center gap-4 pb-3 last:pb-0"
                                            >
                                                <img
                                                    src={producto?.imagen || "/placeholder.png"}
                                                    alt={producto?.nombreProducto || "Producto"}
                                                    className="w-16 h-16 rounded-lg object-cover border"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium">{producto?.nombreProducto}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Cantidad: {cantidad} | ${precioUnitario}
                                                    </p>
                                                </div>
                                                <div className="text-right font-semibold">${subtotal}</div>
                                            </div>
                                        )
                                    )}

                                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                        <p className="text-sm text-gray-500">
                                            Método de pago:{" "}
                                            <span className="font-bold capitalize">
                                                {venta.metodoPago}
                                            </span>
                                        </p>
                                        <p className="text-lg font-bold text-blue-800">
                                            Total: ${venta.total}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 🔥 PAGINADOR */}
                        {totalPaginas > 1 && (
                            <div className="flex justify-center gap-3 mt-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1, estadoTab)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-blue-800 text-white rounded-xl disabled:bg-gray-400"
                                >
                                    ← Anterior
                                </button>
                                {[...Array(totalPaginas)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1, estadoTab)}
                                        className={`px-3 py-2 rounded-xl ${currentPage === i + 1
                                                ? "bg-blue-800 text-white"
                                                : "bg-gray-200 hover:bg-blue-100"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1, estadoTab)}
                                    disabled={currentPage === totalPaginas}
                                    className="px-4 py-2 bg-blue-800 text-white rounded-xl disabled:bg-gray-400"
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

    if (loading)
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-gray-500">Cargando historial...</p>
                </div>
                <Footer />
            </>
        );

    return (
        <>
            <Header />
            <ToastContainer />
            <div className="h-16" />

            <main className="py-10 bg-blue-50 min-h-screen">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                        💰 Historial de Ventas
                    </h2>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-10 p-6">
                        <Tabs>
                            <TabList className="flex border-b border-gray-200 mb-6">
                                <Tab className="flex-1 py-4 text-center font-semibold text-gray-600 cursor-pointer hover:text-blue-700">
                                    Todas ({ventas.length})
                                </Tab>
                                <Tab className="flex-1 py-4 text-center font-semibold text-gray-600 cursor-pointer hover:text-yellow-600">
                                    Pendientes ({ventas.filter((v) => v.estado === "pendiente").length})
                                </Tab>
                                <Tab className="flex-1 py-4 text-center font-semibold text-gray-600 cursor-pointer hover:text-green-700">
                                    Pagadas ({ventas.filter((v) => v.estado === "pagado").length})
                                </Tab>
                            </TabList>

                            {renderVentasTab("todos", "Todas", "🧾")}
                            {renderVentasTab("pendiente", "Pendientes", "⏳")}
                            {renderVentasTab("pagado", "Pagadas", "✅")}
                        </Tabs>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
