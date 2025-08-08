import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import storeProfile from '../context/storeProfile';
import storeAuth from '../context/storeAuth';
import storeProductos from '../context/storeProductos';
import { User, LogOut, ShoppingCart, Search } from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

const placeholderImage = 'https://via.placeholder.com/150?text=Sin+Imagen';

export const Home = () => {
  const { user } = storeProfile();
  const { token, clearToken } = storeAuth();
  const { productos, loadingProductos, error, fetchProductos, categorias, loadingCategorias, error: errorCategorias, fetchCategorias } = storeProductos();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  useEffect(() => {
    if (token) {
      fetchCategorias();
    }
  }, [token, fetchCategorias]);

  // Cerrar dropdown si clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
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
    console.log('Buscar:', searchQuery);
    // navigate(`/products?search=${searchQuery}`);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <Link to="/">
            <img src={logo} alt="PoliVentas" className="w-36 h-12 object-cover" />
          </Link>

          {/* Barra de Búsqueda */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:border-blue-600"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </form>

          {/* Botones */}
          <div className="flex items-center gap-4 relative">
            {/* Botón Categorías con dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
              ref={dropdownRef}
            >
              <button className="text-blue-800 font-semibold hover:text-red-800 transition-colors">
                Categorías
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                  {loadingCategorias && (
                    <p className="px-4 py-2 text-gray-500 text-sm">Cargando categorías...</p>
                  )}
                  {errorCategorias && (
                    <p className="px-4 py-2 text-red-700 text-sm">{errorCategorias}</p>
                  )}
                  {!loadingCategorias && !errorCategorias && categorias.length === 0 && (
                    <p className="px-4 py-2 text-gray-500 text-sm">No hay categorías.</p>
                  )}
                  {!loadingCategorias &&
                    categorias.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/products?categoria=${encodeURIComponent(cat.nombreCategoria)}`}
                        className="block px-4 py-2 text-blue-800 hover:bg-red-100 hover:text-red-700 cursor-pointer text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {cat.nombreCategoria}
                      </Link>
                    ))}
                </div>
              )}
            </div>

            {/* Botón Carrito (solo para estudiantes autenticados) */}
            {token && user?.rol === 'estudiante' && (
              <Link to="/estudiante/carrito" className="relative">
                <ShoppingCart className="w-6 h-6 text-blue-800 hover:text-red-800 transition-colors" />
              </Link>
            )}

            {/* Autenticación */}
            {token ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <User className="w-5 h-5" />
                  <span>{user?.nombre ? `Hola, ${user.nombre}` : "Usuario"}</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 text-sm text-blue-800 border-b">
                      <p><strong>Nombre:</strong> {user?.nombre || "Usuario"}</p>
                      <p><strong>Rol:</strong> {user?.rol ? user.rol.toUpperCase() : "N/A"}</p>
                    </div>
                    <Link
                      to="/perfil"
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

      {/* Hero Section */}
      <main className="bg-blue-50 py-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-blue-900 mb-4">
            Bienvenido a <span className="text-red-700">PoliVentas</span>
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Descubre productos únicos creados por estudiantes para estudiantes. ¡Explora, compra y apoya a tu comunidad universitaria!
          </p>

           {/* Productos Destacados */}
      <section className="bg-white py-10">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-blue-800 text-center mb-6">Productos Destacados</h3>
          {loadingProductos && <p className="text-center text-gray-700">Cargando productos...</p>}
          {error && (
            <p className="text-center text-red-800">
              {error}{' '}
              {error.includes('autenticado') && (
                <Link to="/login" className="underline hover:text-blue-800">
                  Inicia sesión
                </Link>
              )}
            </p>
          )}
          {!loadingProductos && !error && productos.length === 0 && (
            <p className="text-center text-gray-700">No hay productos disponibles.</p>
          )}
          {!loadingProductos && !error && productos.length > 0 && (
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={2}
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
                      <h3 className="text-base font-semibold text-gray-800 line-clamp-2 h-12">{producto.nombreProducto}</h3>
                      <div className="mt-2">
                        <p className="text-lg font-bold text-red-800">${producto.precio.toFixed(2)}</p>
                        {producto.descuento && (
                          <p className="text-sm text-gray-500 line-through">${(producto.precio * 1.2).toFixed(2)}</p>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2 mb-5">{producto.descripcion}</p>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

          {/* Aquí insertamos la cuadrícula de productos */}
          {loadingProductos && <p className="text-center text-gray-700">Cargando productos...</p>}
          {error && (
            <p className="text-center text-red-700">
              {error}{' '}
              {error.includes('autenticado') && (
                <Link to="/login" className="underline hover:text-blue-900">
                  Inicia sesión
                </Link>
              )}
            </p>
          )}
          {!loadingProductos && !error && productos.length === 0 && (
            <p className="text-center text-gray-700">No hay productos disponibles.</p>
          )}
          {!loadingProductos && !error && productos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
              {productos.map((producto) => (
                <div
                  key={producto._id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-4 flex flex-col items-center cursor-pointer"
                >
                  <div className="w-full aspect-square overflow-hidden rounded-lg mb-3">
                    <img
                      src={producto.imagen || placeholderImage}
                      alt={producto.nombreProducto}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-1 text-center line-clamp-2">
                    {producto.nombreProducto}
                  </h4>
                  <p className="text-red-700 font-bold text-xl">${producto.precio.toFixed(2)}</p>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3 text-center">
                    {producto.descripcion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

     
      {/* Footer */}
      <footer className="bg-blue-100 py-6 mt-10">
        <div className="container mx-auto text-center">
          <p className="text-gray-800 font-semibold">
            © 2025 PoliVentas - Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="text-gray-800 hover:text-red-800 transition-colors">
              Facebook
            </a>
            <a href="#" className="text-gray-800 hover:text-red-800 transition-colors">
              Instagram
            </a>
            <a href="#" className="text-gray-800 hover:text-red-800 transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
