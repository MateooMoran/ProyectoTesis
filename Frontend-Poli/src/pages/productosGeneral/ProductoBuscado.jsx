import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useFetch from '../../hooks/useFetch';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

const ProductosBuscados = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const { fetchDataBackend } = useFetch();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ CONFIGURACIÓN CARRUSEL (EXACTA)
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
    const fetchProductosBuscados = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/productos/buscar?query=${encodeURIComponent(query)}`, {
          method: 'GET',
        });
        console.log('Productos buscados:', response);
        setProductos(response);
      } catch (err) {
        setError(err.message || 'Error al buscar productos');
      } finally {
        setLoading(false);
      }
    };
    if (query.trim()) {
      fetchProductosBuscados();
    }
  }, [query]);


  const handleClickProducto = (producto) => {
    const storedData = JSON.parse(localStorage.getItem('auth-token'));
    const token = storedData?.state?.token;

    if (token) {
      toast.success(`Producto ${producto.nombreProducto} seleccionado`);
    }
    else{
      Navigate(`/carrito/vacio`);
    }
  };

  return (
    <>
      <Header />
      <div className="h-15 sm:h-7 mb-6" />

      {/* 🔥 DISEÑO EXACTO QUE PEDISTE */}
      <section className="py-10 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-semibold text-gray-700 text-center mb-6">
            Resultados para <span className="text-red-600 font-bold">"{query}"</span>
          </h3>

          {loading && <p className="text-center text-gray-700">Cargando productos...</p>}
          {error && <p className="text-center text-red-700">{error}</p>}
          {!loading && !error && productos.length === 0 && (
            <p className="text-center text-gray-700">No se encontraron productos para "{query}".</p>
          )}
          {!loading && !error && productos.length > 0 && (
            <div className="relative mx-[-10px]">
              <Slider {...settings}>
                {productos.map((producto) => (
                  <div key={producto._id} className="px-2">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4">
                      {/* IMAGEN + STOCK ARRIBA DERECHA */}
                      <div className="relative mb-3">
                        <Link to={`/dashboard/productos/${producto._id}`} className="block">
                          <img
                            src={producto.imagen || placeholderImage}
                            alt={producto.nombreProducto}
                            className="w-full h-48 object-contain rounded-md hover:shadow-md transition-shadow duration-300"
                          />
                        </Link>

                        {/* Alerta stock bajo */}
                        {producto.stock <= 5 && (
                          <span className="absolute top-2 left-2 bg-red-800 text-white text-xs font-semibold px-2 py-1 rounded">
                            ¡Solo {producto.stock} Disponibles!
                          </span>
                        )}
                      </div>

                      {/* Nombre (link) */}
                      <Link
                        to={`/dashboard/productos/${producto._id}`}
                        className="block mb-3 hover:text-blue-600 transition-colors"
                        onClick={() => handleClickProducto(producto)}
                      >
                        <h3 className="text-base font-light text-gray-900 line-clamp-1 text-center">
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
                        <Link
                          to={`/carrito/vacio`}
                          className="flex-1 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1 hover:scale-105 transition-all duration-300"
                          onClick={(e) => {
                            e.preventDefault();
                            handleClickProducto(producto);
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 3.5A2 2 0 006.5 17h11a2 2 0 001.6-1.5l-1.5-3.5" />
                          </svg>
                          Añadir al Carrito
                        </Link>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            console.log(`❤️ Añadir ${producto.nombreProducto} a favoritos`);
                          }}
                          className="p-2 bg-gray-200 hover:bg-red-500 hover:text-white text-gray-700 rounded-md transition-all duration-300 hover:scale-110"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ProductosBuscados;