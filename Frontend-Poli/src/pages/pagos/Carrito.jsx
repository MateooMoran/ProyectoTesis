import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storeCarrito from '../../context/storeCarrito';
import Header from '../../layout/Header';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Footer from '../../layout/Footer';


const Carrito = () => {
    const navigate = useNavigate();
    const { carrito, fetchCarrito, disminuirCantidad, eliminarProducto, vaciarCarrito, loading } =
        storeCarrito();

    useEffect(() => {
        fetchCarrito();
    }, []);

    if (loading)
        return (
            <p className="text-center mt-10 text-gray-500 text-lg animate-pulse">
                Cargando carrito...
            </p>
        );

    return (
        <>
            <Header />
            <ToastContainer />
            <div className="h-20 sm:h-7"></div>
            <main className="container mx-auto px-4 py-6 min-h-[60vh]">
                {!carrito || !carrito.productos?.length ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh]">
                        <p className="text-center text-gray-600 text-lg">
                            No tienes productos en el carrito.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-4 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
                        >
                            Empieza a comprar en PoliVentas
                        </button>
                    </div>


                ) : (
                    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                        <h2 className="text-3xl font-extrabold mb-6 text-gray-700 pb-2">
                            Tu Carrito
                        </h2>

                        <div className="flex flex-col gap-6">
                            {carrito.productos.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-0 pb-4"
                                >
                                    <div className="flex items-center gap-4 w-full sm:w-3/4">
                                        <img
                                            src={item.producto.imagen}
                                            alt={item.producto.nombreProducto}
                                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-md"
                                        />
                                        <div>
                                            <p className="font-semibold text-lg text-gray-800">
                                                {item.producto.nombreProducto}
                                            </p>
                                            <p className="text-indigo-600 font-medium mt-1">Cantidad: {item.cantidad}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Precio Unitario: ${item.precioUnitario.toFixed(2)} | Subtotal: $
                                                {item.subtotal.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-3 sm:mt-0 sm:flex-col w-full sm:w-auto justify-center">
                                        <button
                                            onClick={() => disminuirCantidad(item._id)}
                                            className="bg-yellow-400 text-yellow-900 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition"
                                            aria-label="Disminuir cantidad"
                                        >
                                            -
                                        </button>
                                        <button
                                            onClick={async () => {
                                                await eliminarProducto(item._id);
                                                toast.success('Producto eliminado del carrito');
                                                fetchCarrito();
                                            }}
                                            className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
                                            aria-label="Eliminar producto"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mt-8 pt-6 font-extrabold text-xl text-gray-900">
                            <span>Total:</span>
                            <span>${carrito.total.toFixed(2)}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            <button
                                onClick={vaciarCarrito}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105"
                            >
                                Vaciar carrito
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/orden-pendiente')}
                                className="flex-1 bg-blue-700 text-white py-3 rounded-xl shadow-lg hover:bg-blue-800 transition-transform transform hover:scale-105"
                            >
                                Proceder al pago
                            </button>
                        </div>
                    </div>
                )}
            </main>
            {/* Footer */}
            <Footer></Footer>
        </>
    );
};

export default Carrito;
