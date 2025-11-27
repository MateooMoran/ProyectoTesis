import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import getImageUrl from '../../utils/imageSrc';
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const { fetchDataBackend } = useFetch();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  useEffect(() => {
    const fetchProductosBuscados = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchDataBackend(
          `${import.meta.env.VITE_BACKEND_URL}/estudiante/productos/buscar?query=${encodeURIComponent(query)}`,
          { method: "GET" }
        );
        setProductos(response);
      } catch (err) {
        setError(err.message || "Error al buscar productos");
      } finally {
        setLoading(false);
      }
    };

    if (query.trim()) fetchProductosBuscados();
  }, [query]);

  const handleComprar = (producto) => {
    const storedData = JSON.parse(localStorage.getItem("auth-token"));
    const token = storedData?.state?.token;

    if (token) {
      navigate(`/dashboard/compra/${producto._id}`);
    } else {
      navigate(`/prepago`);
    }
  };

  return (
    <>
      <Header />
      <div className="h-15 sm:h-7 mb-6" />

      <section className="py-10 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-semibold text-gray-700 text-center mb-6">
            Resultados para <span className="text-red-600 font-bold">"{query}"</span>
          </h3>

          {loading && <p className="text-center text-gray-700">Cargando productos...</p>}
          {error && <p className="text-center text-red-700">{error}</p>}

          {!loading && !error && productos.length === 0 && (
            <p className="text-center text-gray-700">
              No se encontraron productos para "{query}".
            </p>
          )}

          {!loading && !error && productos.length > 0 && (
            <div className="relative mx-[-10px]">
              <Slider {...settings}>
                {productos.map((producto) => (
                  <div key={producto._id} className="px-2">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4">
                      {/* IMAGEN */}
                      <div className="relative mb-3">
                        <Link to={`/productos/${producto._id}`} className="block">
                            <img
                              src={getImageUrl(producto)}
                              alt={producto.nombreProducto}
                              className="w-full h-40 object-cover rounded-md hover:shadow-md transition-shadow duration-300"
                            />
                        </Link>

                        {producto.stock <= 5 && (
                          <span className="absolute top-2 left-2 bg-red-800 text-white text-xs font-semibold px-2 py-1 rounded">
                            ¡Solo {producto.stock} disponibles!
                          </span>
                        )}
                      </div>

                      {/* Nombre */}
                      <h3 className="text-base font-light text-gray-900 text-center line-clamp-1 mb-3">
                        {producto.nombreProducto}
                      </h3>

                      {/* Precio */}
                      <p className="text-xl font-extrabold text-gray-600 mb-3">
                        ${producto.precio.toFixed(2)}
                      </p>

                      {/* Botón */}
                      <button
                        onClick={() => handleComprar(producto)}
                        className="w-full bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1 hover:scale-105 transition-all duration-300"
                      >
                        Comprar Ahora
                      </button>
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
