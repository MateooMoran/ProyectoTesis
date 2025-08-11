import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storeCarrito from '../../context/storeCarrito';
import Header from '../../layout/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Carrito = () => {
    const navigate = useNavigate();
    const { carrito, fetchCarrito, disminuirCantidad, eliminarProducto, vaciarCarrito, loading } =
        storeCarrito();

    useEffect(() => {
        fetchCarrito();
    }, []);

    if (loading) return <p className="text-center">Cargando carrito...</p>;

    return (
        <>
            <Header />
            <ToastContainer />
            <div className="h-20 sm:h-7"></div>
            <main className="container mx-auto px-4 py-6">
                {(!carrito || !carrito.productos?.length) ? (
                    <p className="text-center mt-6">No tienes productos en el carrito.</p>
                ) : (
                    <div className="max-w-4xl mx-auto mt-6 p-4 bg-white rounded-lg shadow">
                        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tu Carrito</h2>

                        {carrito.productos.map((item) => (
                            <div key={item._id} className="flex items-center justify-between border-b py-3">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={item.producto.imagen}
                                        alt={item.producto.nombreProducto}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div>
                                        <p className="font-semibold">{item.producto.nombreProducto}</p>
                                        <p className="text-gray-600">Cantidad: {item.cantidad}</p>
                                        <p className="text-sm text-gray-500">
                                            Precio Unitario: ${item.precioUnitario} | Subtotal: ${item.subtotal}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => disminuirCantidad(item._id)}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                                    >
                                        -
                                    </button>
                                    <button
                                        onClick={async () => {
                                            await eliminarProducto(item._id);
                                            fetchCarrito();  // refrescar carrito después de eliminar
                                        }}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between mt-4 font-bold">
                            <span>Total:</span>
                            <span>${carrito.total.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={vaciarCarrito}
                            className="mt-4 w-full bg-red-700 text-white py-2 rounded hover:bg-red-800 transition-transform transform hover:scale-102"
                        >
                            Vaciar carrito
                        </button>

                        <button
                            onClick={() => navigate('/dashboard/orden-pendiente')}
                            className="mt-4 w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-800 transition-transform transform hover:scale-102"
                        >
                            Proceder al pago
                        </button>
                    </div>
                )}
            </main>
        </>
    );
};

export default Carrito;
