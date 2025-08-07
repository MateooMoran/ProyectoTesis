import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import comida from '../assets/comidas-rapidas.jpg';
import ropa from '../assets/Ropa.jpeg';
import pantalon from '../assets/pantalon.avif';
import Zapatos from '../assets/zapatos.jpg';
import Chaqueta from '../assets/chaqueta.jpg';
import libro from '../assets/Libros.jpeg';
import logo from '../assets/logo.png';
import storeProfile from '../context/storeProfile';
import storeAuth from '../context/storeAuth';
import { User, LogOut } from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

const productosMasVendidos = [
  { id: 1, nombre: 'Chompa', precio: '$10', imagen: Chaqueta },
  { id: 2, nombre: 'Sanduches', precio: '$2.50', imagen: comida },
  { id: 3, nombre: 'Zapatos Adidas', precio: '$12', imagen: Zapatos },
  { id: 4, nombre: 'Libro de Inglés', precio: '$25', imagen: libro },
  { id: 5, nombre: 'Hoodie', precio: '$15', imagen: ropa },
];

export const Productos = () => {
  const { user } = storeProfile();
  const { clearToken } = storeAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
          {/* Logo */}
          <img src={logo} alt="logo" className="w-36 h-12 object-cover mr-4" />
          {/* Navegación */}
          <nav className="mb-4 sm:mb-0">
            <ul className="flex flex-col sm:flex-row items-center gap-3 sm:gap-8 text-blue-900 font-semibold">
              <li><Link to="/" className="hover:text-red-600">Inicio</Link></li>
              <li><Link to="/about" className="hover:text-red-700">Nosotros</Link></li>
              <li><Link to="/products" className="hover:text-red-700">Productos</Link></li>
              <li><Link to="/contact" className="hover:text-red-700">Contacto</Link></li>
            </ul>
          </nav>
          {/* Perfil (Menú Desplegable) */}
          <div className="relative mt-2 sm:mt-0">
            <button
              className="flex items-center gap-2 text-blue-900 font-bold text-lg hover:text-red-700"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <User className="w-5 h-5" />
              <span>{user?.nombre ? `Hola, ${user.nombre}` : "Bienvenido"}</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 text-sm text-blue-900 border-b">
                  <p><strong>Nombre:</strong> {user?.nombre || "Usuario"}</p>
                  <p><strong>Rol:</strong> {user?.rol ? user.rol.toUpperCase() : "N/A"}</p>
                </div>
                <Link
                  to="/perfil"
                  className="block px-4 py-2 text-blue-900 hover:bg-blue-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Mi Perfil
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-blue-900 hover:bg-blue-100"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Espacio para el header fijo */}
      <div className="h-20 sm:h-16"></div>

      {/* Hero Section */}
      <main className="bg-blue-50 py-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-blue-900 mb-4">
            Bienvenido a <span className="text-red-700">PoliVentas</span>
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Poliventas es una plataforma creada por y para estudiantes. Aquí puedes publicar, descubrir y comprar productos de otros compañeros de tu universidad de forma fácil, segura y rápida. ¡Conecta, apoya y emprende dentro de tu comunidad estudiantil!
          </p>
        </div>
      </main>

      {/* Categorías */}
      <section className="bg-white py-10">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-blue-900 text-center mb-6">Explora nuestras categorías</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Categoría: Ropa */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
              <h4 className="text-2xl font-semibold text-blue-900 mb-4">Vístete con Estilo</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <img src={ropa} alt="Camiseta" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Camiseta</p>
                </div>
                <div className="text-center">
                  <img src={pantalon} alt="Pantalón" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Pantalón</p>
                </div>
                <div className="text-center">
                  <img src={Chaqueta} alt="Chaqueta" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Chaqueta</p>
                </div>
                <div className="text-center">
                  <img src={Zapatos} alt="Zapatos" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Zapatos</p>
                </div>
              </div>
              <Link to="/products/ropa" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                Ver Más
              </Link>
            </div>

            {/* Categoría: Libros */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
              <h4 className="text-2xl font-semibold text-blue-900 mb-4">Libros y Cursos</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <img src={libro} alt="Matemáticas" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Matemáticas</p>
                </div>
                <div className="text-center">
                  <img src={libro} alt="Historia" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Historia</p>
                </div>
                <div className="text-center">
                  <img src={libro} alt="Ciencia" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Ciencia</p>
                </div>
                <div className="text-center">
                  <img src={libro} alt="Arte" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Arte</p>
                </div>
              </div>
              <Link to="/products/libros" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                Ver Más
              </Link>
            </div>

            {/* Categoría: Comida */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
              <h4 className="text-2xl font-semibold text-blue-900 mb-4">Poli Comida</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <img src={comida} alt="Pizza" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Pizza</p>
                </div>
                <div className="text-center">
                  <img src={comida} alt="Hamburguesa" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Hamburguesa</p>
                </div>
                <div className="text-center">
                  <img src={comida} alt="Tacos" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Tacos</p>
                </div>
                <div className="text-center">
                  <img src={comida} alt="Sushi" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Sushi</p>
                </div>
              </div>
              <Link to="/products/comida" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                Ver Más
              </Link>
            </div>

            {/* Categoría: Tecnología */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
              <h4 className="text-2xl font-semibold text-blue-900 mb-4">Tecnología y accesorios</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <img src={comida} alt="Comida 1" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Pizza</p>
                </div>
                <div className="text-center">
                  <img src={comida} alt="Comida 2" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Hamburguesa</p>
                </div>
                <div className="text-center">
                  <img src={comida} alt="Comida 3" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Tacos</p>
                </div>
                <div className="text-center">
                  <img src={comida} alt="Comida 4" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Sushi</p>
                </div>
              </div>
              <Link to="/products/comida" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                Ver Más
              </Link>
            </div>

            {/* Categoría: Joyería */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
              <h4 className="text-2xl font-semibold text-blue-900 mb-4">Joyería</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <img src={comida} alt="Comida 1" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Pizza</p>
                </div>
                <div className="text-center">
                  <img src={comida} alt="Comida 2" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Hamburguesa</p>
                </div>
                <div className="text-center">
                  <img src={comida} alt="Comida 3" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Tacos</p>
                </div>
                <div className="text-center">
                  <img src={comida} alt="Comida 4" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Sushi</p>
                </div>
              </div>
              <Link to="/products/comida" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                Ver Más
              </Link>
            </div>

            {/* Categoría: Nuevo */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
              <h4 className="text-2xl font-semibold text-blue-900 mb-4">Nuevo En PoliVentas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <img src={comida} alt="Comida 1" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Pizza</p>
                </div>
                <div className="text-center">
                  <img src={comida} alt="Comida 2" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Hamburguesa</p>
                </div>
                <div className="text-center">
                  <img src={comida} alt="Comida 3" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Tacos</p>
                </div>
                <div className="text-center">
                  <img src={comida} alt="Comida 4" className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm text-gray-700 text-left">Sushi</p>
                </div>
              </div>
              <Link to="/products/comida" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                Ver Más
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Carrusel de productos más vendidos */}
      <section className="bg-blue-50 py-10">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-blue-900 text-center mb-6">Lo más vendido en PoliVentas</h3>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {productosMasVendidos.map((producto) => (
              <SwiperSlide key={producto.id}>
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <h4 className="text-lg font-semibold text-blue-900">{producto.nombre}</h4>
                  <p className="text-gray-700 pb-2">{producto.precio}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 mt-10">
        <div className="container mx-auto text-center">
          <p className="text-gray-700 font-semibold">
            © 2025 PoliVentas - Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="text-blue-900 hover:text-red-700">Facebook</a>
            <a href="#" className="text-blue-900 hover:text-red-700">Instagram</a>
            <a href="#" className="text-blue-900 hover:text-red-700">Twitter</a>
          </div>
        </div>
      </footer>
    </>
  );
};
export default Productos;