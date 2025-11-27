import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from '../../utils/alerts';
import useFetch from '../../hooks/useFetch';
import storeAuth from '../../context/storeAuth';
import Slider from 'react-slick';
import { Heart } from 'lucide-react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import getImageUrl from '../../utils/imageSrc';

// HOOK DE FAVORITOS
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
        } else if (response.msg.includes('removido')) {
          setFavorites(prev => prev.filter(p => p._id !== productId));
        }
      } catch { }
    } else {
      let localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (localFavs.includes(productId)) {
        localFavs = localFavs.filter(id => id !== productId);
      } else {
        localFavs.push(productId);
      }
      localStorage.setItem('favorites', JSON.stringify(localFavs));
      setFavorites(localFavs);
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

// FLECHAS PERSONALIZADAS
const SamplePrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${style} custom-arrow custom-prev-arrow`}
      onClick={onClick}
    />
  );
};

const SampleNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${style} custom-arrow custom-next-arrow`}
      onClick={onClick}
    />
  );
};

const CategoriaProductos = () => {
  const { id } = useParams();
  const { fetchDataBackend } = useFetch();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoriaNombre, setCategoriaNombre] = useState('');
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, token } = useFavorites();

  // Configuración carrusel
  const settings = {
    dots: false,
    infinite: productos.length > 4,
    speed: 700,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
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

  useEffect(() => {
    const fetchProductosPorCategoria = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/productos/categoria/${id}`;
        const response = await fetchDataBackend(url, { method: 'GET' });
        if (!response || response.length === 0) {
          setError('No se encontraron productos para esta categoría');
          setProductos([]);
          setCategoriaNombre('');
        } else {
          setProductos(response);
          setCategoriaNombre(response[0]?.categoria?.nombreCategoria || 'Categoría');
        }
      } catch (err) {
        const errorMessage = err.message || 'Error al cargar los productos';
        setError(errorMessage);
        setProductos([]);
        setCategoriaNombre('');
      } finally {
        setLoading(false);
      }
    };
    fetchProductosPorCategoria();
  }, [id]);

  const getProductoLink = (productoId) => {
    return token ? `/dashboard/productos/${productoId}` : `/productos/${productoId}`;
  };

  const handleClickProducto = (producto) => {
    navigate(getProductoLink(producto._id));
  };

  return (

    <>
      <Header />
      <div className="mt-20 md:mt-14"></div>
      <section className="py-4 lg:py-10 bg-blue-50">
        <div className="max-w-7xl mx-auto px-3 lg:px-4">
          <h3 className="text-xl lg:text-3xl font-semibold text-gray-700 text-center mb-4 lg:mb-6">
            Productos en <span className="text-gray-700 font-bold">{categoriaNombre}</span>
          </h3>

          {loading && <p className="text-center text-sm lg:text-base text-gray-700">Cargando productos...</p>}
          {error && <p className="text-center text-sm lg:text-base text-red-700">{error}</p>}
          {!loading && !error && productos.length === 0 && (
            <p className="text-center text-sm lg:text-base text-gray-700">No hay productos disponibles.</p>
          )}
          {!loading && !error && productos.length > 0 && (
            <div className="relative mx-[-8px] lg:mx-[-10px]">
              <Slider {...settings}>
                {productos.map((producto) => {
                  const fav = isFavorite(producto._id);
                  return (
                    <div key={producto._id} className="px-2">
                      <div className="bg-white border border-gray-200 rounded-lg lg:rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-3 lg:p-4 h-full flex flex-col">
                        {/* IMAGEN */}
                        <Link to={getProductoLink(producto._id)} className="block mb-2 lg:mb-3 flex-shrink-0">
                          <img
                            src={getImageUrl(producto) }
                            alt={producto.nombreProducto}
                            className="w-full h-32 lg:h-48 object-cover rounded-md hover:shadow-md transition-shadow duration-300"
                          />
                        </Link>

                        {/* Nombre (link) */}
                        <Link
                          to={getProductoLink(producto._id)}
                          className="block mb-2 lg:mb-3 hover:text-blue-600 transition-colors text-center flex-shrink-0"
                        >
                          <h3 className="text-xs lg:text-base font-light text-gray-900 line-clamp-1">
                            {producto.nombreProducto}
                          </h3>
                        </Link>

                        {/* PRECIO */}
                        <div className="mb-2 lg:mb-3 flex-shrink-0">
                          <p className="text-lg lg:text-xl font-extrabold text-gray-600">${producto.precio.toFixed(2)}</p>
                          {producto.descuento && (
                            <p className="text-xs lg:text-sm text-gray-500 line-through">${(producto.precio * 1.2).toFixed(2)}</p>
                          )}
                        </div>

                        {/* BOTONES */}
                        <div className="flex gap-1.5 lg:gap-2 mt-auto">
                          <button
                            onClick={() => handleClickProducto(producto)}
                            className="flex-1 bg-blue-800 hover:bg-blue-900 text-white text-xs lg:text-sm font-semibold py-1.5 lg:py-2 px-2 lg:px-3 rounded-md flex items-center justify-center gap-1 hover:scale-105 transition-all duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="hidden sm:inline">Ver detalles</span>
                          </button>

                          <button
                            onClick={() => toggleFavorite(producto._id)}
                            className={`p-1.5 lg:p-2 rounded-md transition-all duration-300 hover:scale-110 flex-shrink-0 ${fav
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-gray-200 hover:bg-red-500 hover:text-white text-gray-700'
                              }`}
                          >
                            <Heart className={`w-3 h-3 lg:w-5 lg:h-5 ${fav ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Slider>
            </div>
          )}
        </div>
      </section>
      {!token && <Footer />}
    </>
  );
};

export default CategoriaProductos;