import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import useFetch from '../../hooks/useFetch';
import storeAuth from '../../context/storeAuth';
import { alert } from '../../utils/alerts';
import getImageUrl from '../../utils/imageSrc';

const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const { token, rol } = storeAuth();
    const { fetchDataBackend } = useFetch();

    useEffect(() => {
        const loadFavorites = async () => {
            // Favoritos sólo para estudiantes autenticados
            if (token && rol === 'estudiante') {
                try {
                    const data = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/favoritos`, {
                        method: 'GET',
                        config: { headers: { Authorization: `Bearer ${token}` } }
                    });
                    setFavorites(data.favoritos || []);
                } catch { }
            } else if (!token) {
                const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
                setFavorites(localFavs);
            } else {
                // usuario autenticado pero no estudiante (ej. vendedor/admin): no favorites
                setFavorites([]);
            }
        };
        loadFavorites();
    }, [token, rol]);

    const toggleFavorite = async (productId) => {
        // Only call backend for estudiantes
        if (token && rol === 'estudiante') {
            try {
                const response = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/favorito/${productId}`, {
                    method: 'PATCH',
                    config: { headers: { Authorization: `Bearer ${token}` } }
                });
                if (response.msg.includes('agregado')) {
                    setFavorites(prev => [...prev, { _id: productId }]);
                    try { alert({ icon: 'success', title: 'Agregado a favoritos' }); } catch {}
                } else if (response.msg.includes('removido')) {
                    setFavorites(prev => prev.filter(p => p._id !== productId));
                    try { alert({ icon: 'info', title: 'Eliminado de favoritos' }); } catch {}
                }
            } catch { }
        } else {
            let localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
            const already = localFavs.includes(productId);
            if (already) {
                localFavs = localFavs.filter(id => id !== productId);
                localStorage.setItem('favorites', JSON.stringify(localFavs));
                setFavorites(localFavs);
                try { alert({ icon: 'info', title: 'Eliminado de favoritos' }); } catch {}
            } else {
                localFavs.push(productId);
                localStorage.setItem('favorites', JSON.stringify(localFavs));
                setFavorites(localFavs);
                try { alert({ icon: 'success', title: 'Agregado a favoritos' }); } catch {}
            }
        }
    };

    const isFavorite = (productId) => {
        if (token && rol === 'estudiante') {
            return favorites.some(fav => fav._id === productId);
        } else if (!token) {
            return favorites.includes(productId);
        }
        return false;
    };

    return { favorites, isFavorite, toggleFavorite, token };
};

const ProductCarousel = ({
    productos,
    loading,
    error,
    title = "Productos",
    slidesPerView = 5,
    showDots = false,
    className = "my-12"
}) => {
    const { isFavorite, toggleFavorite, token } = useFavorites();
    const { rol } = storeAuth();
    const navigate = useNavigate();

    const getProductoLink = (productoId) => {
        return token ? `/dashboard/productos/${productoId}` : `/productos/${productoId}`;
    };

    console.log(productos);


    const settings = {
        dots: showDots,
        infinite: productos.length > slidesPerView,
        speed: 700,
        slidesToShow: slidesPerView,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: true,
        pauseOnHover: true,
        prevArrow: <SamplePrevArrow />,
        nextArrow: <SampleNextArrow />,
        responsive: [
            { breakpoint: 1536, settings: { slidesToShow: 5 } },
            { breakpoint: 1280, settings: { slidesToShow: 4 } },
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 640, settings: { slidesToShow: 1 } }
        ]
    };

    return (
        <section className={className}>
            <h3 className="text-2xl font-semibold text-gray-700 text-center mb-6">{title}</h3>
            {loading && <p className="text-center text-gray-700">Cargando productos...</p>}
            {error && <p className="text-center text-red-700">{error}</p>}
            {!loading && !error && productos.length === 0 && (
                <p className="text-center text-gray-700">No hay productos disponibles.</p>
            )}
            {!loading && !error && productos.length > 0 && (
                <div className="relative">
                    <Slider {...settings} className="mx-[-10px]">
                        {productos.map((producto) => {
                            const fav = isFavorite(producto._id);
                            const productLink = getProductoLink(producto._id);

                            return (
                                <div key={producto._id} className="px-2">
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4">
                                        <div className="relative mb-3">
                                            <Link to={productLink} className="block">
                                                    <img
                                                        src={getImageUrl(producto)}
                                                        alt={producto.nombreProducto}
                                                        className="w-full h-48 object-cover rounded-md hover:shadow-md transition-shadow duration-300"
                                                    />
                                            </Link>
                                            {producto.stock <= 5 && (
                                                <span className="absolute top-2 left-2 bg-red-800 text-white text-xs font-semibold px-2 py-1 rounded">
                                                    ¡Solo {producto.stock} Disponibles!
                                                </span>
                                            )}
                                        </div>

                                        <Link to={productLink} className="block mb-3 hover:text-blue-600 transition-colors">
                                            <h3 className="text-base font-light text-gray-900 line-clamp-1 text-center">
                                                {producto.nombreProducto}
                                            </h3>
                                        </Link>

                                        <div className="mb-3">
                                            <p className="text-xl font-extrabold text-gray-600">${producto.precio.toFixed(2)}</p>
                                            {producto.descuento && (
                                                <p className="text-sm text-gray-500 line-through">${(producto.precio * 1.2).toFixed(2)}</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mb-3">
                                            <Link
                                                to={getProductoLink(producto._id)}
                                                className="flex-1 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1 hover:scale-105 transition-all duration-300"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Ver Detalles
                                            </Link>

                                            {rol !== 'vendedor' && (
                                                <button
                                                    onClick={() => toggleFavorite(producto._id)}
                                                    className={`p-2 rounded-md transition-all duration-300 hover:scale-110 ${fav ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 hover:bg-red-500 hover:text-white'}`}
                                                >
                                                    {fav ? <FaHeart className="w-5 h-5" /> : <FaRegHeart className="w-5 h-5" />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </Slider>
                </div>
            )}
        </section>
    );
};

const SamplePrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div className={`${className} ${style} custom-arrow custom-prev-arrow`} onClick={onClick} />
    );
};

const SampleNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div className={`${className} ${style} custom-arrow custom-next-arrow`} onClick={onClick} />
    );
};

export default ProductCarousel;
