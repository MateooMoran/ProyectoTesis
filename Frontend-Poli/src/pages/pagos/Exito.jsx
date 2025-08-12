import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../layout/Header';


const Exito = () => (
  <>
  <div className="h-50 sm:h-7" />

  <div className="container mx-auto p-6 max-w-lg text-center mt-25 bg-white rounded-lg shadow-md ">
    <h2 className="text-3xl font-bold mb-4 text-gray-700">Pago realizado con éxito!</h2>
    <p className="mb-6">Gracias por tu compra. Puedes ver tu historial de pedidos en tu perfil.</p>
    <Link to="/dashboard/estudiante/historial-pagos" className="text-blue-700 hover:underline">
      Ver historial de compras
    </Link>
  </div>
  <Header />
  </>
);

export default Exito;
