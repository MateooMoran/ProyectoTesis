import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '../utils/alerts';
import logo from '../assets/logo.png';
import storeProfile from '../context/storeProfile';
import storeAuth from '../context/storeAuth';
import storeProductos from '../context/storeProductos';
import Footer from '../layout/Footer';
import Carrusel from '../layout/CarruselBanner';
import CarruselProductos from '../pages/productosGeneral/CarruselProductos';
import Slider from 'react-slick';
import CarruselCategorias from './productosGeneral/CarruselCategorias';
import Header from '../layout/Header';
import { User, LogOut, Search } from 'lucide-react';

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
    fetchCategorias
  } = storeProductos();

  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const categoriesRef = useRef(null);
  const userDropdownRef = useRef(null);




  const scrollToCarousel = () => {
    navigate('/');
  };

  // Fetch de productos y categorías
  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, [fetchProductos, fetchCategorias]);


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
      {/* Header */}
      <header className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <Link to="/">
            <img src={logo} alt="PoliVentas" className="w-36 h-12 object-cover" />
          </Link>

          {/* Barra de Búsqueda */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4 w-full">
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
              <div className="flex gap-4 w-full justify-center sm:justify-start">
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

      {/* Contenido principal con padding para header fijo */}
      <div className="pt-40 sm:pt-24 md:pt-20 lg:pt-16">
        {/* Hero Section */}
        <Carrusel />

        {/* Main Section */}
        <main className="bg-white-50">
          <div className="container mx-auto px-4">
            <CarruselCategorias
              categorias={categorias}
              productos={productos}
              loadingCategorias={loadingCategorias}
              errorCategorias={errorCategorias}
            />

            {/* ✅ CARRUSEL 1: */}
            <CarruselProductos
              productos={productos}
              loading={loadingProductos}
              error={error}
              title="Descubre lo Nuevo"
              showDots={false}
            />

            {/* ✅ CARRUSEL 2: DESCUENTOS */}
            <CarruselProductos
              productos={productos.filter(p => p.stock <= 5)}
              loading={loadingProductos}
              error={error}
              title="Últimas Unidades"
              showDots={false}
            />

          </div>

        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;