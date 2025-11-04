import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, UserPlus, LogIn } from 'lucide-react';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';


const PrePagoProceso = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Espacio para compensar header fijo */}
      <div className="h-10 sm:h-7" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center bg-gray-50 pt-20">
        <Lock className="w-20 h-20 text-blue-600 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Inicia sesión para continuar</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Para proceder al pago y realizar tu compra en PoliVentas, necesitas iniciar sesión o crear una cuenta. Así podrás gestionar tus pedidos de forma segura.
        </p>

        <div className="flex gap-6 justify-center flex-wrap pb-8">
          <Link
            to="/login"
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Iniciar Sesión
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-2 border border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Crear Cuenta
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer></Footer>
    </div>
  );
};

export default PrePagoProceso;