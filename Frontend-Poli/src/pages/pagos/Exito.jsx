import React from 'react';
import { Link } from 'react-router-dom';

const Exito = () => (
  <div className="container mx-auto p-6 max-w-lg text-center">
    <h2 className="text-3xl font-bold mb-4 text-green-700">Pago realizado con éxito!</h2>
    <p className="mb-6">Gracias por tu compra. Puedes ver tu historial de pedidos en tu perfil.</p>
    <Link to="/dashboard/estudiante/historial-pagos" className="text-blue-700 hover:underline">
      Ver historial de pagos
    </Link>
  </div>
);

export default Exito;
