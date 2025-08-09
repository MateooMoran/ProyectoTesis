import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../layout/Header';
import storeProfile from '../context/storeProfile';
import storeAuth from '../context/storeAuth';
import storeProductos from '../context/storeProductos';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const placeholderImage = 'https://via.placeholder.com/150?text=Sin+Imagen';
const categoryImages = {
  Tecnologia: 'https://via.placeholder.com/300x150/1E3A8A?text=Tecnología',
  Libros: './assets/libros.jpg',
  Ropa: 'https://via.placeholder.com/300x150/1E3A8A?text=Ropa',
};

const Productos = () => {
  const { user } = storeProfile();
  const { token } = storeAuth();
  const { productos, categorias, loadingProductos, loadingCategorias, error, fetchProductos, fetchCategorias } = storeProductos();

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, [fetchProductos, fetchCategorias]);

  return (
    <>
      <Header />
      {/* Espacio para compensar header fijo */}
      <div className="h-20 sm:h-7"></div>

      <main className="bg-blue-50 py-10">
        <div className="container mx-auto px-4">

          {/* Hero Section */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-blue-800 mb-4">
              Bienvenido a <span className="text-red-700">PoliVentas</span>
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Descubre productos únicos creados por estudiantes para estudiantes. ¡Explora, compra y apoya a tu comunidad universitaria!
            </p>
          </div>

          {/* Productos Destacados */}
          <section className="mb-12">
            <h3 className="text-3xl font-bold text-blue-800 text-center mb-6">Productos Destacados</h3>
            {loadingProductos && <p className="text-center text-gray-700">Cargando productos...</p>}
            {error && <p className="text-center text-red-700">{error}</p>}
            {!loadingProductos && !error && productos.length === 0 && (
              <p className="text-center text-gray-700">No hay productos disponibles.</p>
            )}
            {!loadingProductos && !error && productos.length > 0 && (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={20}
                slidesPerView={2}
                autoplay={{ delay: 2000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 3 },
                  1024: { slidesPerView: 5 },
                }}
              >
                {productos.map((producto) => (
                  <SwiperSlide key={producto._id}>
                    <Link to={`/productos/${producto._id}`} className="block">
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 p-4">
                        <img
                          src={producto.imagen || placeholderImage}
                          alt={producto.nombreProducto}
                          className="w-full h-48 object-contain rounded-md mb-3"
                        />
                        {producto.stock <= 5 && (
                          <span className="absolute top-2 left-2 bg-red-800 text-white text-xs font-semibold px-2 py-1 rounded">
                            ¡Solo {producto.stock} disponibles!
                          </span>
                        )}
                        <h3 className="text-base font-semibold text-blue-800 line-clamp-2 h-12">{producto.nombreProducto}</h3>
                        <div className="mt-2">
                          <p className="text-lg font-bold text-red-700">${producto.precio.toFixed(2)}</p>
                          {producto.descuento && (
                            <p className="text-sm text-gray-500 line-through">${(producto.precio * 1.2).toFixed(2)}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 mt-1 line-clamp-2 mb-5">{producto.descripcion}</p>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </section>

          {/* Categorías */}
          <section className="bg-blue-100 py-12">
            <h3 className="text-3xl font-bold text-blue-800 text-center mb-6">Explora por Categorías</h3>
            {loadingCategorias && <p className="text-center text-gray-700">Cargando categorías...</p>}
            {error && (
              <p className="text-center text-red-700">
                {error}{' '}
                {error.includes('autenticado') && (
                  <Link to="/login" className="underline hover:text-blue-800">Inicia sesión</Link>
                )}
              </p>
            )}
            {!loadingCategorias && !error && categorias.length === 0 && (
              <p className="text-center text-gray-700">No hay categorías disponibles.</p>
            )}
            {!loadingCategorias && !error && categorias.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categorias.map((categoria) => (
                  <Link
                    key={categoria._id}
                    to={`/dashboard/productos/categoria/${categoria._id}`}
                    className="relative block bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                  >
                    <img
                      src={categoryImages[categoria.nombreCategoria] || placeholderImage}
                      alt={categoria.nombreCategoria}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-blue-800 text-center">{categoria.nombreCategoria}</h3>
                      <button className="mt-2 w-full bg-blue-800 text-white py-2 rounded-lg hover:bg-red-800 transition-colors">
                        Explorar
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Todos los Productos */}
          <section>
            <h3 className="text-3xl font-bold text-blue-800 text-center mb-6">Todos los Productos</h3>
            {loadingProductos && <p className="text-center text-gray-700">Cargando productos...</p>}
            {error && <p className="text-center text-red-700">{error}</p>}
            {!loadingProductos && !error && productos.length === 0 && (
              <p className="text-center text-gray-700">No hay productos disponibles.</p>
            )}
            {!loadingProductos && !error && productos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productos.map((producto) => (
                  <Link to={`/productos/${producto._id}`} className="block" key={producto._id}>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 p-4">
                      <img
                        src={producto.imagen || placeholderImage}
                        alt={producto.nombreProducto}
                        className="w-full h-48 object-contain rounded-md mb-3"
                      />
                      {producto.stock <= 5 && (
                        <span className="absolute top-2 left-2 bg-red-800 text-white text-xs font-semibold px-2 py-1 rounded">
                          ¡Solo {producto.stock} disponibles!
                        </span>
                      )}
                      <h3 className="text-base font-semibold text-blue-800 line-clamp-2 h-12">{producto.nombreProducto}</h3>
                      <div className="mt-2">
                        <p className="text-lg font-bold text-red-700">${producto.precio.toFixed(2)}</p>
                        {producto.descuento && (
                          <p className="text-sm text-gray-500 line-through">${(producto.precio * 1.2).toFixed(2)}</p>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">{producto.descripcion}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </>
  );
};

export default Productos;
