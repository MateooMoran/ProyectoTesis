// src/pages/Carrito.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCarritoStore from '../../context/storeCarrito';
import { toast, ToastContainer } from 'react-toastify';
import { Trash2, ShoppingCart, CreditCard, Minus, Plus } from 'lucide-react';

const Carrito = () => {
    const {
        carrito,
        loading,
        error,
        fetchCarrito,
        disminuirCantidad,
        aumentarCantidad,
        eliminarProducto,
        vaciarCarrito,
        hasProducts,
        getTotalItems,
        getTotalPrice
    } = useCarritoStore();

    // Cargar carrito al montar
    useEffect(() => {
        fetchCarrito();
    }, [fetchCarrito]);

    // Mostrar errores
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Loading inicial
    if (loading && !carrito) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center py-10">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-blue-800 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-700 text-lg">Cargando carrito...</p>
                </div>
            </div>
        );
    }

    // Carrito vacío
    if (!carrito || !hasProducts()) {
        return (
            <>
                <ToastContainer />
                <div className="mt-30 md:mt-18"></div>
                <main className="py-10 bg-blue-50 min-h-screen">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h1 className="text-3xl lg:text-5xl font-bold text-gray-800 flex items-center justify-center gap-3">
                                Carrito de Compras
                            </h1>
                            <p className="text-gray-600 mt-3 text-base lg:text-lg">
                                Revisa tus productos antes de proceder al pago
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-16 text-center border border-gray-200 max-w-2xl mx-auto">
                            <ShoppingCart className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-gray-700 mb-3">Tu carrito está vacío</h2>
                            <p className="text-gray-500 mb-8">
                                ¡Explora nuestros productos y encuentra lo que necesitas!
                            </p>
                            <Link
                                to="/dashboard/listarProd"
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-800 to-blue-900 text-white py-4 px-10 rounded-xl font-bold text-lg hover:from-blue-900 hover:to-blue-800 transform hover:scale-105 transition-all shadow-lg"
                            >
                                <ShoppingCart className="w-6 h-6" />
                                Empezar a Comprar
                            </Link>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
            />
            <div className="mt-30 md:mt-10"></div>
            <main className="py-10 bg-blue-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4">
                    {/* TÍTULO */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
                            Carrito de Compras
                        </h1>
                        <p className="text-gray-600 mt-3 text-base lg:text-lg">
                            Tienes {getTotalItems()} producto{getTotalItems() !== 1 ? 's' : ''} en tu carrito
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* LISTA DE PRODUCTOS */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="p-5 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                                    Productos en tu carrito
                                </h3>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {carrito.productos.map((item) => (
                                    <div
                                        key={item._id}
                                        className="p-5 lg:p-7 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
                                            {/* IMAGEN */}
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={item.producto.imagen || '/placeholder.jpg'}
                                                    alt={item.producto.nombreProducto}
                                                    className="w-full lg:w-36 h-36 lg:h-36 object-cover rounded-xl shadow-md"
                                                    onError={(e) => {
                                                        if (e.target.src !== '/placeholder.jpg') {
                                                            e.target.src = '/placeholder.jpg';
                                                        }
                                                    }}
                                                />
                                            </div>

                                            {/* INFO */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-lg lg:text-xl font-bold text-gray-800 line-clamp-2 mb-2">
                                                        {item.producto.nombreProducto}
                                                    </h4>

                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                                        {item.producto.descripcion || 'Sin descripción'}
                                                    </p>

                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <p className="text-sm text-gray-600">
                                                                Precio unitario
                                                            </p>
                                                            <p className="text-lg font-bold text-gray-800">
                                                                ${item.precioUnitario.toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-600">
                                                                Subtotal
                                                            </p>
                                                            <p className="text-xl font-bold text-blue-600">
                                                                ${item.subtotal.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* CONTROLES */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1">
                                                        {/* REDUCIR */}
                                                        <button
                                                            type="button"
                                                            onClick={() => disminuirCantidad(item._id)}
                                                            disabled={item.cantidad <= 1 || loading}
                                                            className={`
                                                                p-2 rounded-full transition-all duration-200
                                                                ${item.cantidad <= 1 || loading
                                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-red-500 hover:bg-red-600 text-white hover:scale-110 shadow-md'
                                                                }
                                                            `}
                                                            aria-label="Reducir cantidad"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>

                                                        <span className="text-lg font-bold text-gray-800 min-w-[2.5rem] text-center">
                                                            {item.cantidad}
                                                        </span>

                                                        {/* AUMENTAR */}
                                                        <button
                                                            type="button"
                                                            onClick={() => aumentarCantidad(item._id)}
                                                            disabled={loading}
                                                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white hover:scale-110 transition-all duration-200 shadow-md disabled:opacity-50"
                                                            aria-label="Aumentar cantidad"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* ELIMINAR */}
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarProducto(item._id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 border border-red-500 text-white font-medium rounded-lg hover:bg-red-800 transition-all transform hover:scale-105"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                        <span className="hidden sm:inline">Eliminar</span>
                                                    </button>


                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RESUMEN Y ACCIONES */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">Total a pagar</h3>
                                <span className="text-3xl lg:text-4xl font-bold text-blue-600">
                                    ${getTotalPrice().toLocaleString('es-CO')}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={vaciarCarrito}
                                    disabled={loading}
                                    className="flex-1 h-14 py-2 bg-gradient-to-r from-red-800 to-red-900 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50"
                                >
                                    <Trash2 className="w-6 h-6" />
                                    <span className="hidden sm:inline">Vaciar Carrito</span>
                                    <span className="sm:hidden">Vaciar</span>
                                </button>

                                <Link
                                    to="/dashboard/orden-pendiente"
                                    className="flex-1 h-14 py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-blue-800 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
                                >
                                    <CreditCard className="w-6 h-6" />
                                    <span className="hidden sm:inline">Proceder al Pago</span>
                                    <span className="sm:hidden">Pagar</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Carrito;