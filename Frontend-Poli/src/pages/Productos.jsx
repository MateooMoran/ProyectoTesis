import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import storeProfile from '../context/storeProfile';
import storeAuth from '../context/storeAuth';
import storeProductos from '../context/storeProductos';
import { User, LogOut, ShoppingCart, Search, Star } from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const placeholderImage = 'https://via.placeholder.com/300?text=Sin+Imagen';
const categoryImages = {
  Tecnologia: 'https://via.placeholder.com/300x150/1E3A8A?text=Tecnología',
  Libros: 'https://via.placeholder.com/300x150/1E3A8A?text=Libros',
  Ropa: 'https://via.placeholder.com/300x150/1E3A8A?text=Ropa',
  // Agrega más imágenes por categoría si están disponibles
};

const Productos = () => {
  const { user } = storeProfile();
  const { token, clearToken } = storeAuth();
  const { productos, categorias, loadingProductos, loadingCategorias, error, fetchProductos, fetchCategorias } = storeProductos();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const categoriesRef = useRef(null);
  const userDropdownRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    console.log('Productos: Iniciando fetchProductos y fetchCategorias');
    fetchProductos();
    fetchCategorias();
  }, [fetchProductos, fetchCategorias]);

  useEffect(() => {
    console.log('Productos: Estado actual - productos:', productos, 'categorias:', categorias, 'loadingProductos:', loadingProductos, 'loadingCategorias:', loadingCategorias, 'error:', error);
  }, [productos, categorias, loadingProductos, loadingCategorias, error]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Buscar:', searchQuery);
      navigate(`/productos/buscar?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const scrollToCarousel = () => {
    carouselRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-blue-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-lg py-4 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/productos">
            <img src={logo} alt="PoliVentas" className="w-32 h-10 object-contain" />
          </Link>

          {/* Barra de Búsqueda */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos en PoliVentas..."
                className="w-full py-2 px-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 transition-colors text-gray-700"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-blue-800" />
              </button>
            </div>
          </form>

          {/* Botones */}
          <div className="flex items-center gap-6">
            {/* Botón Destacado */}
            <button
              onClick={scrollToCarousel}
              className="flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors"
            >
              <Star className="w-5 h-5" />
              Destacado
            </button>
            <div className="relative" ref={categoriesRef}>

              {isCategoriesOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                  {loadingCategorias && (
                    <p className="px-4 py-2 text-gray-500 text-sm">Cargando categorías...</p>
                  )}
                  {error && (
                    <p className="px-4 py-2 text-red-700 text-sm">{error}</p>
                  )}
                  {!loadingCategorias && !error && categorias.length === 0 && (
                    <p className="px-4 py-2 text-gray-500 text-sm">No hay categorías disponibles.</p>
                  )}
                  {!loadingCategorias && !error && categorias.length > 0 && (
                    categorias.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/productos/categoria/${cat._id}`}
                        className="block px-4 py-2 text-blue-800 hover:bg-red-100 hover:text-red-700 text-sm"
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        {cat.nombreCategoria}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Carrito */}
            {token && user?.rol === 'estudiante' && (
              <Link
                to="/estudiante/carrito"
                className="relative flex items-center gap-1 text-blue-800 font-semibold hover:text-red-800 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>Carrito</span>
              </Link>
            )}


            {/* Perfil */}
            {token ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  className="flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <User className="w-5 h-5" />
                  <span>{user?.nombre ? user.nombre : 'Usuario'}</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-blue-800 border-b">
                      <p><strong>Nombre:</strong> {user?.nombre || 'Usuario'}</p>
                      <p><strong>Rol:</strong> {user?.rol ? user.rol.toUpperCase() : 'N/A'}</p>
                    </div>
                    <Link
                      to="/perfil"
                      className="block px-4 py-2 text-blue-800 hover:bg-blue-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-blue-800 hover:bg-blue-100"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Salir
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <Link
                  to="/login"
                  className="bg-blue-800 text-white py-2 px-4 rounded-full font-semibold hover:bg-red-800 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="bg-blue-800 text-white py-2 px-4 rounded-full font-semibold hover:bg-red-800 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Espacio para el header fijo */}
      <div className="h-16 sm:h-20"></div>

      {/* Carrusel de productos destacados */}
      <section ref={carouselRef} className="bg-blue-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-blue-900 text-center mb-8">Productos Destacados</h2>
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
              slidesPerView={1}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {productos.slice(0, 6).map((producto) => (
                <SwiperSlide key={producto._id}>
                  <Link to={`/producto/${producto._id}`} className="block">
                    <div className="relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <img
                        src={producto.imagen || placeholderImage}
                        alt={producto.nombreProducto}
                        className="w-full h-64 object-contain"
                      />
                      {producto.stock <= 5 && (
                        <span className="absolute top-4 left-4 bg-red-800 text-white text-xs font-semibold px-3 py-1 rounded-lg">
                          ¡Solo {producto.stock} disponibles!
                        </span>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-blue-900 line-clamp-2">{producto.nombreProducto}</h3>
                        <p className="text-red-700 text-lg font-bold mt-2">${producto.precio.toFixed(2)}</p>
                        <p className="text-sm text-gray-900 mt-1 font-semibold  ">{producto.categoria?.nombreCategoria || 'N/A'}</p>
                        <p className="text-xx text-gray-700 mt-1 line-clamp-2 mb-5">{producto.descripcion}</p>
                        <button className="mt-4 w-full bg-blue-800 text-white py-2 rounded-lg hover:bg-red-800 transition-colors mb-5">
                          Ver Producto
                        </button>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      {/* Categorías */}
      <section className="bg-blue-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-blue-900 text-center mb-8">Explora por Categorías</h2>
          {loadingCategorias && <p className="text-center text-gray-700">Cargando categorías...</p>}
          {error && (
            <p className="text-center text-red-700">
              {error}{' '}
              {error.includes('autenticado') && (
                <Link to="/login" className="underline hover:text-blue-800">
                  Inicia sesión
                </Link>
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
                  to={`/productos/categoria/${categoria._id}`}
                  className="relative block rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    src={categoryImages[categoria.nombreCategoria] || placeholderImage}
                    alt={categoria.nombreCategoria}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white">{categoria.nombreCategoria}</h3>
                      <button className="mt-4 bg-blue-800 text-white py-2 px-6 rounded-lg hover:bg-red-800 transition-colors">
                        Explorar
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Productos en cuadrícula */}
      <section className="bg-blue-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-blue-900 text-center mb-8">Nuestros Productos</h2>
          {loadingProductos && <p className="text-center text-gray-700">Cargando productos...</p>}
          {error && <p className="text-center text-red-700">{error}</p>}
          {!loadingProductos && !error && productos.length === 0 && (
            <p className="text-center text-gray-700">No hay productos disponibles.</p>
          )}
          {!loadingProductos && !error && productos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productos.map((producto) => (
                <Link
                  key={producto._id}
                  to={`/producto/${producto._id}`}
                  className="block bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={producto.imagen || placeholderImage}
                      alt={producto.nombreProducto}
                      className="w-full h-48 object-contain rounded-t-xl"
                    />
                    {producto.stock <= 5 && (
                      <span className="absolute top-4 left-4 bg-red-800 text-white text-xs font-semibold px-3 py-1 rounded-lg">
                        ¡Solo {producto.stock} disponibles!
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-blue-900 line-clamp-2 h-12">{producto.nombreProducto}</h3>
                    <p className="text-red-700 font-bold text-lg mt-2">${producto.precio.toFixed(2)}</p>
                    <p className="text-sm text-gray-800 mt-1 line-clamp-2">{producto.descripcion}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}

    </div>
  );
};

export default Productos;