import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../layout/Header';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrdenPendiente = () => {
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const crearOrdenPendiente = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/estudiante/orden`,
                { metodoPago },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            toast.success(data.msg);
            setLoading(false);
            if (metodoPago === 'tarjeta') {
                navigate('/dashboard/pagos');
            } else {
                navigate('/dashboard/historial-pagos');
            }
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.msg || 'Error creando orden');
        }
    };

    return (
        <>
            <Header />
            <ToastContainer />
            <div className="h-7"></div>
            <main className="container mx-auto px-4 py-6 max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-blue-800">Selecciona método de pago</h2>
                <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-6"
                >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta (Stripe)</option>
                </select>

                <button
                    disabled={loading}
                    onClick={crearOrdenPendiente}
                    className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-800 transition"
                >
                    {loading ? 'Procesando...' : 'Crear Orden'}
                </button>
            </main>
        </>
    );
};

export default OrdenPendiente;
