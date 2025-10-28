import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import storeCarrito from '../../context/storeCarrito';
import { toast, ToastContainer } from 'react-toastify';
import { Trash2, ShoppingCart, CreditCard } from 'lucide-react';

const Carrito = () => {
    const navigate = useNavigate();
    const { carrito, fetchCarrito, disminuirCantidad, eliminarProducto, vaciarCarrito, loading } = storeCarrito();

    useEffect(() => {
        fetchCarrito();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center py-4 lg:py-10">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-blue-800 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-700 text-base lg:text-lg">Cargando carrito...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer />
            <div className="mt-40 md:mt-18"></div>
            <main className="py-4 lg:py-10 bg-blue-50 min-h-screen ">
                <div className="max-w-7xl mx-auto px-3 lg:px-4">
                    {/* TÍTULO Y DESCRIPCIÓN */}
                    <div className="text-center mb-6 lg:mb-12">
                        <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                            <h1 className="text-2xl lg:text-4xl font-bold text-gray-800">
                                Carrito de Compras
                            </h1>
                        </div>
                        <p className="text-sm lg:text-base text-gray-600">
                            Revisa tus productos seleccionados antes de proceder al pago
                        </p>
                    </div>

                    {!carrito || !carrito.productos?.length ? (
                        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-12 text-center border border-gray-200 max-w-2xl mx-auto">
                            <div className="flex items-center justify-center mb-4 lg:mb-6">
                                <ShoppingCart className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-lg lg:text-xl mb-3 lg:mb-6">Tu carrito está vacío</p>
                            <p className="text-gray-500 text-sm lg:text-base mb-6 lg:mb-8">¡Aún no has agregado productos a tu carrito!</p>
                            <Link
                                to="/dashboard/listarProd"
                                className="flex:1 bg-gradient-to-r from-blue-800 to-blue-900 text-white py-2.5 lg:py-4 px-6 lg:px-8 rounded-lg lg:rounded-xl font-bold text-sm lg:text-lg flex items-center justify-center gap-2 lg:gap-3 hover:from-blue-800 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
                            >
                                <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                                Empezar a Comprar
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4 lg:space-y-6">
                            {/* LISTA PRODUCTOS */}
                            <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-200">
                                <div className="p-4 lg:p-6 border-b border-gray-200">
                                    <h3 className="text-lg lg:text-2xl font-bold text-gray-800">
                                        Productos en tu Carrito ({carrito.productos.length})
                                    </h3>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {carrito.productos.map((item) => (
                                        <div key={item._id} className="p-3 lg:p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col lg:flex-row items-start gap-3 lg:gap-6">
                                                {/* IMAGEN */}
                                                <div className="flex-shrink-0 w-full lg:w-auto">
                                                    <img
                                                        src={item.producto.imagen}
                                                        alt={item.producto.nombreProducto}
                                                        className="w-full lg:w-32 h-32 lg:h-32 object-cover rounded-lg lg:rounded-xl shadow-md"
                                                    />
                                                </div>

                                                {/* INFO PRODUCTO */}
                                                <div className="flex-1 min-w-0 w-full">
                                                    <h4 className="text-base lg:text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                                                        {item.producto.nombreProducto}
                                                    </h4>

                                                    <div className="space-y-1 lg:space-y-2 mb-3 lg:mb-4">
                                                        <p className="text-sm lg:text-lg text-gray-600">
                                                            <span className="font-semibold">Cantidad:</span> {item.cantidad}
                                                        </p>
                                                        <p className="text-sm lg:text-lg font-bold text-gray-600">
                                                            Precio: ${item.precioUnitario.toFixed(2)}
                                                        </p>
                                                        <p className="text-sm lg:text-lg font-bold text-blue-600">
                                                            Subtotal: ${item.subtotal.toFixed(2)}
                                                        </p>
                                                    </div>

                                                    {/* DESCRIPCIÓN */}
                                                    <p className="text-xs lg:text-sm text-gray-600 line-clamp-2 mb-3 lg:mb-4">
                                                        {item.producto.descripcion}
                                                    </p>

                                                    {/* BOTÓN ELIMINAR */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                await eliminarProducto(item._id);
                                                                toast.success('Producto eliminado del carrito');
                                                                fetchCarrito();
                                                            }}
                                                            className="flex items-center gap-1.5 lg:gap-2 bg-red-500 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 text-xs lg:text-sm font-medium"
                                                            aria-label="Eliminar producto"
                                                        >
                                                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                                                            <span className="hidden sm:inline">Eliminar</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* TOTAL Y BOTONES */}
                            <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-200">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-6 mb-4 lg:mb-6">
                                    <h3 className="text-lg lg:text-2xl font-bold text-gray-800">Resumen del Carrito</h3>
                                    <span className="text-2xl lg:text-3xl font-bold text-blue-600">
                                        ${carrito.total.toLocaleString('es-CO')}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 justify-center">
                                    <button
                                        onClick={vaciarCarrito}
                                        className="flex-1 h-10 lg:h-14 bg-gradient-to-r from-red-800 to-red-900 text-white rounded-lg lg:rounded-xl font-bold text-xs lg:text-lg flex items-center justify-center gap-1.5 lg:gap-3 hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all shadow-lg"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                                        <span className="hidden sm:inline">Vaciar Carrito</span>
                                        <span className="sm:hidden">Vaciar</span>
                                    </button>
                                    <Link
                                        to="/dashboard/orden-pendiente"
                                        className="flex-1 h-10 lg:h-14 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg lg:rounded-xl font-bold text-xs lg:text-lg flex items-center justify-center gap-1.5 lg:gap-3 hover:from-blue-800 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
                                    >
                                        <CreditCard className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                                        <span className="hidden sm:inline">Proceder al Pago</span>
                                        <span className="sm:hidden">Pagar</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
};

export default Carrito;