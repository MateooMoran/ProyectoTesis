import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useFetch from '../../hooks/useFetch';
import storeAuth from '../../context/storeAuth';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Slider from 'react-slick';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// HOOK DE FAVORITOS
const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const { token } = storeAuth();
  const { fetchDataBackend } = useFetch();

  useEffect(() => {
    const loadFavorites = async () => {
      if (token) {
        try {
          const data = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/favoritos`, {
            method: 'GET',
            config: { headers: { Authorization: `Bearer ${token}` } }
          });
          setFavorites(data.favoritos || []);
        } catch { }
      } else {
        const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(localFavs);
      }
    };
    loadFavorites();
  }, [token]);

  const toggleFavorite = async (productId) => {
    if (token) {
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
        toast.success('Producto removido de favoritos');
      } else {
        localFavs.push(productId);
        toast.success('Producto agregado a favoritos');
      }
      localStorage.setItem('favorites', JSON.stringify(localFavs));
      setFavorites(localFavs);
    }
  };

  const isFavorite = (productId) => {
    if (token) {
      return favorites.some(fav => fav._id === productId);
    } else {
      return favorites.includes(productId);
    }
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
    toast.success(`Producto ${producto.nombreProducto} seleccionado`);
  };

  return (
    <>
      <Header />
      <div className="h-15 sm:h-7 mb-6" />
      <section className="py-10 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-semibold text-gray-700 text-center mb-6">
            Productos en <span className="text-gray-700 font-bold">{categoriaNombre}</span>
          </h3>

          {loading && <p className="text-center text-gray-700">Cargando productos...</p>}
          {error && <p className="text-center text-red-700">{error}</p>}
          {!loading && !error && productos.length === 0 && (
            <p className="text-center text-gray-700">No hay productos disponibles.</p>
          )}
          {!loading && !error && productos.length > 0 && (
            <div className="relative mx-[-10px]">
              <Slider {...settings}>
                {productos.map((producto) => {
                  const fav = isFavorite(producto._id);
                  return (
                    <div key={producto._id} className="px-2">
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4">
                        {/* IMAGEN + STOCK */}
                        <Link to={getProductoLink(producto._id)} className="block mb-3">
                          <img
                            src={producto.imagen}
                            alt={producto.nombreProducto}
                            className="w-full h-48 object-contain rounded-md hover:shadow-md transition-shadow duration-300"
                          />
                        </Link>

                        {/* Nombre (link) */}
                        <Link
                          to={getProductoLink(producto._id)}
                          className="block mb-3 hover:text-blue-600 transition-colors text-center"
                        >
                          <h3 className="text-base font-light text-gray-900 line-clamp-1">
                            {producto.nombreProducto}
                          </h3>
                        </Link>

                        {/* PRECIO */}
                        <div className="mb-3">
                          <p className="text-xl font-extrabold text-gray-600">${producto.precio.toFixed(2)}</p>
                          {producto.descuento && (
                            <p className="text-sm text-gray-500 line-through">${(producto.precio * 1.2).toFixed(2)}</p>
                          )}
                        </div>

                        {/* BOTONES */}
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => handleClickProducto(producto)}
                            className="flex-1 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1 hover:scale-105 transition-all duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 3.5A2 2 0 006.5 17h11a2 2 0 001.6-1.5l-1.5-3.5" />
                            </svg>
                            Añadir al Carrito
                          </button>

                          <button
                            onClick={() => toggleFavorite(producto._id)}
                            className={`p-2 rounded-md transition-all duration-300 hover:scale-110 ${fav
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-gray-200 hover:bg-red-500 hover:text-white text-gray-700'
                              }`}
                          >
                            {fav ? <FaHeart className="w-5 h-5" /> : <FaRegHeart className="w-5 h-5" />}
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
      <Footer />
    </>
  );
};

export default CategoriaProductos;
