import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import { FaHeart, FaTrash, FaEye } from 'react-icons/fa';
import useFavoritos from '../../hooks/useFavoritos';
import storeProductos from '../../context/storeProductos';
import storeAuth from '../../context/storeAuth';

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

    useEffect(() => {
        const loadProductos = async () => {
            if (productos.length === 0) {
                await fetchProductos();
            }
        };
        loadProductos();
    }, [fetchProductos, productos.length]);

    // Solo recargar favoritos cuando el componente se monta
    useEffect(() => {
        recargarFavoritos();
    }, []); // Array vacío - solo al montar

    // Combinar favoritos del backend o localStorage con productos completos
    useEffect(() => {
        if (token) {
            // Usuario autenticado: usar favoritos del backend (ya vienen con datos completos)
            console.log('✅ Usuario autenticado, favoritos del backend:', favoritos);
            setProductosFavoritos(favoritos);
        } else {
            // Usuario sin autenticación: combinar IDs de localStorage con productos
            if (productos.length > 0) {
                const favIds = Array.from(favoritosIds);
                const productosFiltrados = productos.filter(p => favIds.includes(p._id));
                console.log('🔄 IDs de favoritos:', favIds);
                console.log('🔄 Productos totales disponibles:', productos.length);
                console.log('🔄 Productos favoritos encontrados:', productosFiltrados);
                setProductosFavoritos(productosFiltrados);
            }
        }
    }, [favoritos, favoritosIds, productos, token]);

    if (loading && productos.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 text-lg">Cargando favoritos...</p>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="mt-24 md:mt-2"></div>
            <div className="pt-20 min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-700 mb-8">Mis Favoritos</h1>

                    {productosFavoritos.length === 0 ? (
                        <div className="text-center text-gray-600 py-12">
                            <FaHeart className="w-16 h-16 mx-auto mb-4 text-red-300" />
                            <p className="text-lg mb-4">No tienes productos en favoritos.</p>
                            <Link to="/" className="text-blue-600 hover:underline">Explora productos</Link>
                        </div>
                    ) : (
                        <>
                            {/* Tabla de Favoritos */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                {/* Header de la tabla */}
                                <div className="bg-gray-700 text-white grid grid-cols-12 gap-4 px-6 py-4 font-semibold">
                                    <div className="col-span-6">Producto</div>
                                    <div className="col-span-3 text-center">Estado</div>
                                    <div className="col-span-3 text-center">Acciones</div>
                                </div>

                                {/* Contenido de la tabla */}
                                <div className="divide-y divide-gray-200">
                                    {productosFavoritos.map((producto) => (
                                        <div 
                                            key={producto._id} 
                                            className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
                                        >
                                            {/* Columna Producto */}
                                            <div className="col-span-6 flex items-center gap-4">
                                                <img
                                                    src={producto.imagen}
                                                    alt={producto.nombreProducto}
                                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 mb-1">
                                                        {producto.nombreProducto}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Precio: ${producto.precio || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Columna Estado */}
                                            <div className="col-span-3 flex justify-center">
                                                {producto.estado === 'disponible' ? (
                                                    <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
                                                        DISPONIBLE
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-medium">
                                                        AGOTADO
                                                    </span>
                                                )}
                                            </div>

                                            {/* Columna Acciones */}
                                            <div className="col-span-3 flex justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/productos/${producto._id}`)}
                                                    className="bg-blue-800 hover:bg-blue-900 text-white p-2 rounded-full transition-colors"
                                                    title="Ver detalle"
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => eliminarFavorito(producto._id)}
                                                    className="bg-red-800 hover:bg-red-900 text-white p-2 rounded-full transition-colors"
                                                    title="Eliminar de favoritos"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex justify-between mt-6">
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Continuar comprando
                                </button>
                                <button
                                    onClick={vaciarFavoritos}
                                    className="bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Vaciar favoritos
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Favoritos;