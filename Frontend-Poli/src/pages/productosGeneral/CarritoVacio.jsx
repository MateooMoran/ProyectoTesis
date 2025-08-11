import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, UserPlus, LogIn } from 'lucide-react';
import Header from '../../layout/Header';

const CarritoVacio = () => {
  return (
    <>
      <Header />
      {/* Espacio para compensar header fijo */}
      <div className="h-20 sm:h-7" />

      <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-gray-50">
        <ShoppingCart className="w-20 h-20 text-gray-400 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Para empezar a comprar en PoliVentas, crea una cuenta o inicia sesión. Así podrás agregar productos a tu carrito y disfrutar de las mejores ofertas.
        </p>

        <div className="flex gap-6 justify-center">
          <Link
            to="/register"
            className="flex items-center gap-2 bg-red-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Crear Cuenta
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 border border-blue-700 text-blue-700 hover:bg-red-700 hover:text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Iniciar Sesión
          </Link>
        </div>
      </main>
    </>
  );
};

export default CarritoVacio;
