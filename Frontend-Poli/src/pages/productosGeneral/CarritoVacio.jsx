import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, UserPlus, LogIn } from 'lucide-react';
import Header from '../../layout/Header';

const CarritoVacio = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Espacio para compensar header fijo */}
      <div className="h-10 sm:h-7" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center bg-gray-50 pt-20">
        <ShoppingCart className="w-20 h-20 text-gray-400 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Para empezar a comprar en PoliVentas, crea una cuenta o inicia sesión. Así podrás agregar productos a tu carrito y disfrutar de las mejores ofertas.
        </p>

        <div className="flex gap-6 justify-center flex-wrap pb-8">
          <Link
            to="/register"
            className="flex items-center gap-2 bg-red-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Crear Cuenta
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 border border-blue-700 text-blue-700 hover:bg-red-700 hover:text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors "
          >
            <LogIn className="w-5 h-5" />
            Iniciar Sesión
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 py-4 mt-auto">
        <div className="text-center">
          <p className="text-white underline mb-2">
            © 2025 PoliVentas - Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="#"
              className="text-white hover:text-red-400 transition-colors"
            >
              Facebook
            </a>
            <a
              href="#"
              className="text-white hover:text-red-400 transition-colors"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-white hover:text-red-400 transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CarritoVacio;
