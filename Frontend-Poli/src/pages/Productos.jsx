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

const placeholderImage = 'https://via.placeholder.com/150?text=Sin+Imagen';
const categoryImages = {
  Tecnologia: 'https://via.placeholder.com/300x150/1E3A8A?text=Tecnología',
  Libros: 'https://via.placeholder.com/300x150/1E3A8A?text=Libros',
  Ropa: 'https://via.placeholder.com/300x150/1E3A8A?text=Ropa',
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
    <>
      {/* Header */}
      <header className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <Link to="/dashboard">
            <img src={logo} alt="PoliVentas" className="w-36 h-12 object-cover" />
          </Link>

          {/* Barra de Búsqueda */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos en PoliVentas..."
                className="w-full py-2 px-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 transition-colors text-gray-700"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </form>

          {/* Botones */}
          <div className="flex items-center gap-4">
            {/* Botón Destacado */}
            <button
              onClick={scrollToCarousel}
              className="flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors"
            >
              <Star className="w-5 h-5" />
              Destacado
            </button>

            {/* Botón Categorías con Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                className="text-blue-800 font-semibold hover:text-red-800 transition-colors"
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                Categorías
              </button>
              {isCategoriesOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200"
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                >
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

            {/* Botón Carrito */}
            {token && user?.rol === 'estudiante' && (
              <Link to="/estudiante/carrito" className="relative">
                <ShoppingCart className="w-6 h-6 text-blue-800 hover:text-red-800 transition-colors" />
              </Link>
            )}

            {/* Perfil */}
            {token ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  className="flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors"
                  onMouseEnter={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <User className="w-5 h-5" />
                  <span>{user?.nombre ? `Hola, ${user.nombre}` : 'Usuario'}</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-blue-800 border-b">
                      <p><strong>Nombre:</strong> {user?.nombre || 'Usuario'}</p>
                      <p><strong>Rol:</strong> {user?.rol ? user.rol.toUpperCase() : 'N/A'}</p>
                    </div>
                    <Link
                      to="/dashboard/perfil"
                      className="block px-4 py-2 text-blue-800 hover:bg-blue-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-blue-800 hover:bg-blue-50"
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
                  className="bg-blue-800 text-white py-2 px-6 rounded-xl font-semibold border hover:bg-red-800 transition-colors hover:scale-105 duration-300"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-800 text-white py-2 px-6 rounded-xl font-semibold border hover:bg-red-800 transition-colors hover:scale-105 duration-300"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Espacio para el header fijo */}
      <div className="h-20 sm:h-24"></div>

      {/* Main Section */}
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

          {/* Productos Destacados (Carrusel) */}
          <section ref={carouselRef} className="mb-12">
            <h3 className="text-3xl font-bold text-blue-800 text-center mb-6">Productos Destacados</h3>
            {loadingProductos && <p className="text-center text-gray-700">Cargando productos...</p>}
            {error && (
              <p className="text-center text-red-700">{error}</p>
            )}
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
                    <Link to={`/producto/${producto._id}`} className="block">
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 p-4">
                        <div className="relative">
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
                        </div>
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
            <div className="container mx-auto px-4">
              <h3 className="text-3xl font-bold text-blue-800 text-center mb-6">Explora por Categorías</h3>
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
            </div>
          </section>

          {/* Todos los Productos (Cuadrícula) */}
          <section>
            <h3 className="text-3xl font-bold text-blue-800 text-center mb-6">Todos los Productos</h3>
            {loadingProductos && <p className="text-center text-gray-700">Cargando productos...</p>}
            {error && (
              <p className="text-center text-red-700">{error}</p>
            )}
            {!loadingProductos && !error && productos.length === 0 && (
              <p className="text-center text-gray-700">No hay productos disponibles.</p>
            )}
            {!loadingProductos && !error && productos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productos.map((producto) => (
                  <Link to={`/producto/${producto._id}`} className="block" key={producto._id}>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 p-4">
                      <div className="relative">
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
                      </div>
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