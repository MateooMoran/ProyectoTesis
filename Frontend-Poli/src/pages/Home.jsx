import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import logo from '../assets/logo.png';
import storeProfile from '../context/storeProfile';
import storeAuth from '../context/storeAuth';
import storeProductos from '../context/storeProductos';
import { User, LogOut, ShoppingCart, Search } from 'lucide-react';
import Footer from '../layout/Footer';
import Carrusel from '../layout/CarruselBanner';
import CarruselProductos from '../pages/productosGeneral/CarruselProductos';

import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const placeholderImage = 'https://via.placeholder.com/150?text=Sin+Imagen';

export const Home = () => {
  const { user } = storeProfile();
  const { token, clearToken } = storeAuth();
  const {
    productos,
    loadingProductos,
    error,
    fetchProductos,
    categorias,
    loadingCategorias,
    error: errorCategorias,
    fetchCategorias,
    agregarProducto
  } = storeProductos();

  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const categoriesRef = useRef(null);
  const userDropdownRef = useRef(null);


  const handleAgregarAlCarrito = (producto, cantidad = 1) => {
    agregarProducto(producto._id, cantidad);
    if (!token) {
      navigate(`/carrito/vacio`);
    } else {
      navigate(`/dashboard/productos/${producto._id}`);
      toast.success(`Producto ${producto.nombreProducto} agregado al carrito`);
    }
  };

  // Fetch de productos y categorías
  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, [fetchProductos, fetchCategorias]);

  // Cerrar dropdowns al hacer clic fuera
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
      navigate(`/productos/buscar?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <ToastContainer />

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
                placeholder="Buscar productos en PoliVentas..."
                className="w-full py-2 px-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 transition-colors text-gray-700"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </form>

          {/* Botones */}
          <div className="flex items-center gap-2 flex-col sm:flex-row w-full sm:w-auto text-center">

            {/* Botón Carrito */}
            {token && user?.rol === 'estudiante' && (
              <Link to="/estudiante/carrito" className="relative">
                <ShoppingCart className="w-6 h-6 text-blue-800 hover:text-red-800 transition-colors" />
              </Link>
            )}

            {/* Autenticación */}
            {token ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  className="flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <User className="w-5 h-5" />
                  <span>{user?.nombre ? `Hola, ${user.nombre}` : "Usuario"}</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-blue-800 border-b">
                      <p><strong>Nombre:</strong> {user?.nombre || "Usuario"}</p>
                      <p><strong>Rol:</strong> {user?.rol ? user.rol.toUpperCase() : "N/A"}</p>
                    </div>
                    <Link to="perfil" className="block px-4 py-2 text-blue-800 hover:bg-blue-50" onClick={() => setIsDropdownOpen(false)}>
                      Mi Perfil
                    </Link>
                    <button className="block w-full text-left px-4 py-2 text-blue-800 hover:bg-blue-50" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 inline mr-2" /> Salir
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="bg-blue-800 text-white py-2 px-6 rounded-xl font-semibold hover:bg-red-800 transition-all duration-300">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="bg-blue-800 text-white py-2 px-6 rounded-xl font-semibold hover:bg-red-800 transition-all duration-300">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Espacio para header fijo */}
      <div className="h-20 sm:h-24"></div>
      {/* Hero Section */}
      <div className="text-center mb-2">
        <h2 className="text-4xl font-extrabold text-blue-900 mb-2 ">
          Bienvenido a <span className="text-red-700">PoliVentas</span>
        </h2>
        <p className="text-lg text-gray-700 mb-6">
          Descubre productos únicos creados por estudiantes para estudiantes.
        </p>
      </div>
      <Carrusel />
      {/* Main Section */}
      <main className="bg-white-50">
        <div className="container mx-auto px-4">
          
          {/* ✅ CARRUSEL 1: */}
          <CarruselProductos
            productos={productos}
            loading={loadingProductos}
            error={error}
            title="Descubre lo Nuevo"
            showDots={false}
            onAddToCart={handleAgregarAlCarrito}
          />

          {/* ✅ CARRUSEL 2: DESCUENTOS */}
          <CarruselProductos
            productos={productos.filter(p => p.stock <= 5)}
            loading={loadingProductos}
            error={error}
            title="Últimas Unidades"
            showDots={false}
            onAddToCart={handleAgregarAlCarrito} 
          />

          {/* 🔥 BOTONES DE CATEGORÍAS - DISEÑO HERMOSO */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-700 text-center mb-8">Explora por Categorías</h3>

            {loadingCategorias && <p className="text-center text-gray-700">Cargando categorías...</p>}
            {errorCategorias && <p className="text-center text-red-700">{errorCategorias}</p>}
            {!loadingCategorias && !errorCategorias && categorias.length === 0 && (
              <p className="text-center text-gray-700">No hay categorías disponibles.</p>
            )}

            {!loadingCategorias && !errorCategorias && categorias.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {categorias.map((categoria) => (
                  <Link
                    key={categoria._id}
                    to={`/productos/categoria/${categoria._id}`}
                    className="group bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-6 text-center hover:from-blue-100 hover:to-indigo-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Ícono de Categoría */}
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-2xl text-white font-bold">
                        {categoria.icono || '🛍️'}
                      </span>
                    </div>

                    {/* Nombre Categoría */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                      {categoria.nombreCategoria}
                    </h3>

                    {/* Cantidad de Productos */}
                    <p className="text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full inline-block">
                      {productos.filter(p => p.categoria?._id === categoria._id).length} productos
                    </p>

                    {/* Flecha Animada */}
                    <div className="mt-3 text-blue-600 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </Link>
                ))}

                {/* Botón "TODOS" */}
                <Link
                  to="/productos"
                  className="group bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-6 text-center hover:from-gray-100 hover:to-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl text-white font-bold">⭐</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                    Ver Todos
                  </h3>
                  <p className="text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full inline-block">
                    {productos.length} productos
                  </p>
                  <div className="mt-3 text-blue-600 group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Home;