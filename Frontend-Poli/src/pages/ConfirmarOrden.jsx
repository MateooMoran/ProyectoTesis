import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import storeAuth from '../context/storeAuth';
import Header from '../layout/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFetch from '../hooks/useFetch';

const ConfirmarOrden = () => {
  const navigate = useNavigate();
  const { token } = storeAuth();
  const { fetchDataBackend } = useFetch();

  const [loading, setLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState('tarjeta');

  const handleCrearOrden = async () => {
    if (!token) {
      navigate('/login?redirect=/dashboard/pagos/confirmar');
      return;
    }

    setLoading(true);
    try {
      await fetchDataBackend(
        `${import.meta.env.VITE_BACKEND_URL}/estudiante/orden`,
        {
          method: 'POST',
          form: { metodoPago },
          config: { headers: { Authorization: `Bearer ${token}` } }
        }
      );

      // Si llega aquí, la orden se creó correctamente
      navigate('/dashboard/pagos/pago');
    } catch (error) {
      // El hook ya muestra toast.error, así que aquí no necesitas setError
      console.error('Error creando la orden:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 max-w-lg">
        <h2 className="text-2xl font-bold mb-4 mt-7">Confirmar Orden</h2>

        <div>
          <label className="block mb-2 font-semibold">
            Escoga el método de pago:
          </label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="tarjeta">Tarjeta</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        <button
          onClick={handleCrearOrden}
          disabled={loading}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition transform hover:scale-102"
        >
          {loading ? 'Creando orden...' : 'Confirmar y continuar al pago'}
        </button>
      </div>
      <ToastContainer />
    </>
  );
};

export default ConfirmarOrden;
