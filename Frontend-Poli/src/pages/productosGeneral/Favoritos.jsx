import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../layout/Header';
import { FaTrash, FaEye } from 'react-icons/fa';
import useFavoritos from '../../hooks/useFavoritos';
import storeProductos from '../../context/storeProductos';
import storeAuth from '../../context/storeAuth';
import { Heart } from 'lucide-react';

const Favoritos = () => {
    const navigate = useNavigate();
    const { productos, fetchProductos } = storeProductos();
    const { token } = storeAuth();

    const {
        favoritos,
        favoritosIds,
        loading,
        eliminarFavorito,
        vaciarFavoritos,
        recargarFavoritos
    } = useFavoritos();

    const [productosFavoritos, setProductosFavoritos] = useState([]);

    // Cargar productos sólo si están vacíos
    useEffect(() => {
        if (productos.length === 0) fetchProductos();
    }, []);

    // Cargar favoritos del backend o localStorage
    useEffect(() => {
        recargarFavoritos();
    }, []);

    const handleNavigateProducto = (productoId) => {
        const storedData = JSON.parse(localStorage.getItem('auth-token'));
        const token = storedData?.state?.token;

        if (token) {
            navigate(`/dashboard/productos/${productoId}`);
        } else {
            navigate(`/productos/${productoId}`);
        }
    };

    // Combinar ❤️
    useEffect(() => {
        if (token) {
            setProductosFavoritos(favoritos);
        } else {
            if (productos.length > 0) {
                const favIds = Array.from(favoritosIds);
                const filtrados = productos.filter(p => favIds.includes(p._id));
                setProductosFavoritos(filtrados);
            }
        }
    }, [favoritos, favoritosIds, productos, token]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500 text-lg">Cargando favoritos...</p>
        </div>
    );

    return (
        <>
            <Header />
            <div className="pt-18 sm:pt-14 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-8">

                    {/* Header */}
                    <div className="text-center mb-4 lg:mb-8">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2 lg:mb-3">
                            Favoritos
                        </h1>
                        <p className="text-xs lg:text-base text-gray-600">
                            {productosFavoritos.length}{' '}
                            {productosFavoritos.length === 1 ? 'producto guardado' : 'productos guardados'}
                        </p>
                    </div>

                    {/* Sin favoritos */}
                    {productosFavoritos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6">
                            <Heart className="w-20 h-20 text-blue-600 mb-6 animate-bounce" />
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Sin favoritos aún</h2>
                            <p className="text-gray-500 text-center max-w-md mb-6">
                                Aún no tienes productos en tu lista de favoritos.
                                ¡Explora nuestro catálogo y agrega los que más te gusten!
                            </p>
                            <Link
                                to="/"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow-md transition transform hover:scale-105 "
                            >
                                Explorar productos
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">

                            {productosFavoritos.map(producto => (
                                <div
                                    key={producto._id}
                                    className="bg-white rounded-xl shadow-md border border-gray-200 p-5 flex items-center gap-5"
                                >
                                    {/* Imagen */}
                                    <div className="relative">
                                        <img
                                            src={producto.imagen}
                                            alt={producto.nombreProducto}
                                            className="w-28 h-28 object-cover rounded-xl border-2 border-gray-200 group-hover:border-blue-400 transition-all"
                                        />
                                        {/* Badge de estado en la imagen */}
                                        <span className={`absolute -top-2 -right-2 text-xs font-bold px-2 py-1 rounded-full shadow-md
                                            ${producto.estado === 'disponible'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-red-500 text-white'}
                                        `}>
                                            {producto.estado === 'disponible' ? '✓' : '✗'}
                                        </span>
                                    </div>

                                    {/* Información */}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            {producto.nombreProducto}
                                        </h3>
                                        <div className="flex flex-wrap gap-3 text-sm">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <span className="font-semibold">Categoría:</span>
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                                    {producto?.categoria?.nombreCategoria}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <span className="font-semibold">Stock:</span>
                                                <span className={`px-2 py-1 rounded-md font-bold ${producto.stock > 10
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-orange-50 text-orange-700'
                                                    }`}>
                                                    {producto.stock} unidades
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-blue-700 font-bold text-2xl mt-3">
                                            ${producto.precio.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleNavigateProducto(producto._id)}
                                            className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                                            title="Ver detalle"
                                        >
                                            <FaEye size={20} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Deseas eliminar este producto de favoritos?')) {
                                                    eliminarFavorito(producto._id);
                                                }
                                            }}
                                            className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                                            title="Eliminar de favoritos"
                                        >
                                            <FaTrash size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Botones */}
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl shadow-md hover:shadow-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Continuar Comprando
                                </button>

                                <button
                                    onClick={() => {
                                        if (window.confirm('¿Estás seguro de que deseas vaciar todos tus favoritos?')) {
                                            vaciarFavoritos();
                                        }
                                    }}
                                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl shadow-md hover:shadow-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <FaTrash size={18} />
                                    Vaciar Favoritos
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Favoritos;
