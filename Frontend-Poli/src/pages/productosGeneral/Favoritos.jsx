import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import storeAuth from '../../context/storeAuth';
import storeProductos from '../../context/storeProductos';
import useFetch from '../../hooks/useFetch';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import { FaHeart, FaTrash, FaEye } from 'react-icons/fa';

const Favoritos = () => {
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = storeAuth();
    const { fetchDataBackend } = useFetch();
    const { productos, fetchProductos } = storeProductos();
    const navigate = useNavigate();

    useEffect(() => {
        const loadProductos = async () => {
            if (productos.length === 0) {
                await fetchProductos();
            }
        };
        loadProductos();
    }, [fetchProductos]);

    useEffect(() => {
        const fetchFavoritos = async () => {
            setLoading(true);
            try {
                if (token) {
                    // Usuario autenticado → traer desde backend
                    const data = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/favoritos`, {
                        method: 'GET',
                        config: { headers: { Authorization: `Bearer ${token}` } }
                    });
                    setFavoritos(data.favoritos || []);
                } else {
                    // Usuario sin sesión → traer desde localStorage
                    const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
                    const favProducts = productos.filter(p => localFavs.includes(p._id));
                    setFavoritos(favProducts);
                }
            } catch (err) {
                setError('Error al cargar favoritos');
            } finally {
                setLoading(false);
            }
        };

        // ✅ Ejecutar solo cuando haya usuario autenticado o productos listos
        if (token || (!token && productos.length > 0)) {
            fetchFavoritos();
        }

        // 🚨 No pongas `productos` ni `fetchDataBackend` como dependencias,
        // ya que cambian en cada render y causan el bucle infinito.
    }, []);

    const handleRemoveFavorite = async (productoId) => {
        if (token) {
            try {
                await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/favorito/${productoId}`, {
                    method: 'DELETE',
                    config: { headers: { Authorization: `Bearer ${token}` } }
                });
                setFavoritos(favoritos.filter(fav => fav._id !== productoId));
                toast.success('Producto removido de favoritos');
            } catch (err) {
                // Error manejado por useFetch
            }
        } else {
            let localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
            localFavs = localFavs.filter(id => id !== productoId);
            localStorage.setItem('favorites', JSON.stringify(localFavs));
            setFavoritos(favoritos.filter(fav => fav._id !== productoId));
            toast.success('Producto removido de favoritos');
        }
    };

    const handleVaciarFavoritos = async () => {
        if (token) {
            // Si hay una ruta en el backend para vaciar todos los favoritos
            try {
                // await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/favoritos`, {
                //     method: 'DELETE',
                //     config: { headers: { Authorization: `Bearer ${token}` } }
                // });
                setFavoritos([]);
                toast.success('Favoritos vaciados');
            } catch (err) {
                // Error manejado por useFetch
            }
        } else {
            localStorage.removeItem('favorites');
            setFavoritos([]);
            toast.success('Favoritos vaciados');
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500 text-lg">Cargando favoritos...</p></div>;
    if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-red-600 text-lg">{error}</p></div>;

    return (
        <>
            <Header />
            <div className="pt-20 min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-700 mb-8">Mis Favoritos</h1>

                    {favoritos.length === 0 ? (
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
                                    {favoritos.map((producto) => (
                                        <div key={producto._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
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
                                                {producto.stock > 0 ? (
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
                                                    onClick={() => handleRemoveFavorite(producto._id)}
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
                                    onClick={handleVaciarFavoritos}
                                    className="bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Vaciar favoritos
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Favoritos;