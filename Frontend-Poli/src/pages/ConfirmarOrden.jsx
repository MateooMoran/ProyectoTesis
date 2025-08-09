import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import storeAuth from '../context/storeAuth';
import Header from '../layout/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ConfirmarOrden = () => {
    const navigate = useNavigate();
    const { token } = storeAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [metodoPago, setMetodoPago] = useState('tarjeta'); 

    const handleCrearOrden = async () => {
        if (!token) {
            navigate('/login?redirect=/dashboard/pagos/confirmar');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/estudiante/orden`,
                { metodoPago },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Orden creada, vamos a pago
            navigate('/dashboard/pagos/pago');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error creando la orden');
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
                    <label className="block mb-2 font-semibold">Escoga el método de pago:</label>
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

                {error && <p className="text-red-600 mt-4">{error}</p>}

                <button
                    onClick={handleCrearOrden}
                    disabled={loading}
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition transform hover:scale-102"
                >
                    {loading ? 'Creando orden...' : 'Confirmar y continuar al pago'}
                </button>
            </div>
        </>
    );

};


export default ConfirmarOrden;
