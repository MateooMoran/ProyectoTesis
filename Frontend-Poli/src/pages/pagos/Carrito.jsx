import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import storeCarrito from '../../context/storeCarrito';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import { toast, ToastContainer } from 'react-toastify';
import { Minus, Trash2, ShoppingCart, CreditCard, DollarSign } from 'lucide-react';

const Carrito = () => {
    const navigate = useNavigate();
    const { carrito, fetchCarrito, disminuirCantidad, eliminarProducto, vaciarCarrito, loading } = storeCarrito();

    useEffect(() => {
        fetchCarrito();
    }, []);

    if (loading) {
        return (
            <>
                <Header />
                <div className="h-10 sm:h-7 mb-6" />
                <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                    <div className="text-center">
                        <svg className="animate-spin h-12 w-12 text-blue-800 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-700 text-lg">Cargando carrito...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="h-10 sm:h-7 mb-6" />
            <ToastContainer />

            <main className="py-10 bg-blue-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4">
                    {/* 🔥 TÍTULO GRADIENTE */}
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-800 bg-clip-text text-transparent text-center mb-12">
                        🛒Carrito de Compras
                    </h2>

                    {!carrito || !carrito.productos?.length ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200 max-w-2xl mx-auto">
                            <div className="flex items-center justify-center mb-6">
                                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 3.5A2 2 0 006.5 17h11a2 2 0 001.6-1.5l-1.5-3.5" />
                                </svg>
                            </div>
                            <p className="text-gray-600 text-xl mb-6">Tu carrito está vacío</p>
                            <p className="text-gray-500 mb-8">¡Aún no has agregado productos a tu carrito!</p>
                            <Link
                                to="/dashboard/listarProd"
                                className="inline-block bg-gradient-to-r from-blue-800 to-blue-900 text-white py-4 px-8 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-blue-800 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
                            >
                                 Empezar a Comprar
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* 🔥 LISTA PRODUCTOS */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                        Productos en tu Carrito ({carrito.productos.length})
                                    </h3>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {carrito.productos.map((item) => (
                                        <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                                                {/* IMAGEN */}
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={item.producto.imagen}
                                                        alt={item.producto.nombreProducto}
                                                        className="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded-xl shadow-lg"
                                                    />
                                                </div>

                                                {/* INFO PRODUCTO */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                                                        {item.producto.nombreProducto}
                                                    </h4>

                                                    <div className="space-y-2 mb-4">
                                                        <p className="text-lg text-gray-600">
                                                            <span className="font-semibold">Cantidad:</span> {item.cantidad}
                                                        </p>
                                                        <p className="text-lg font-bold text-gray-600">
                                                            Precio Unitario: ${item.precioUnitario.toFixed(2)}
                                                        </p>
                                                        <p className="text-lg font-bold text-gray-600">
                                                            Subtotal: ${item.subtotal.toFixed(2)}
                                                        </p>
                                                    </div>

                                                    {/* DESCRIPCIÓN */}
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                                        {item.producto.descripcion}
                                                    </p>
                                                </div>

                                                {/* BOTONES ACCIONES */}
                                                <div className="flex flex-col sm:flex-row gap-3 items-center lg:flex-col lg:gap-4 w-full lg:w-auto">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => disminuirCantidad(item._id)}
                                                            className="w-10 h-10 bg-yellow-400 text-yellow-900 rounded-xl flex items-center justify-center font-bold text-lg hover:bg-yellow-500 transition-all transform hover:scale-110 shadow-md"
                                                            aria-label="Disminuir cantidad"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="text-lg font-bold text-gray-800 px-4 py-2 bg-gray-100 rounded-xl">
                                                            {item.cantidad}
                                                        </span>
                                                        <button
                                                            onClick={async () => {
                                                                await eliminarProducto(item._id);
                                                                toast.success('Producto eliminado del carrito');
                                                                fetchCarrito();
                                                            }}
                                                            className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-all transform hover:scale-110 shadow-md"
                                                            aria-label="Eliminar producto"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 🔥 TOTAL Y BOTONES */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800">Resumen del Carrito</h3>
                                    <span className="text-3xl font-bold text-gray-800">
                                        Total: ${carrito.total.toLocaleString('es-CO')}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={vaciarCarrito}
                                        className="flex-1 h-14 bg-gradient-to-r from-red-800 to-red-900 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all shadow-lg"
                                    >
                                        <Trash2 className="w-5 h-5" /> Vaciar Carrito
                                    </button>
                                    <Link
                                        to="/dashboard/orden-pendiente"
                                        className="flex-1 h-14 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-blue-800 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
                                    >
                                        <CreditCard className="w-5 h-5" /> Proceder al Pago
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
};

export default Carrito;