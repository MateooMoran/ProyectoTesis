// src/components/orden/BotonRecibirProducto.jsx
import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import storeAuth from '../../context/storeAuth';
import { CheckCircle, Package } from 'lucide-react';

export default function BotonRecibirProducto({ ordenId, onSuccess }) {
    const { fetchDataBackend } = useFetch();
    const token = storeAuth((state) => state.token);
    const [loading, setLoading] = useState(false);

    const handleConfirmar = async () => {
        if (!window.confirm('¿Confirmas que recibiste el producto?')) return;

        setLoading(true);
        try {
            await fetchDataBackend(
                `${import.meta.env.VITE_BACKEND_URL}/estudiante/orden/${ordenId}/confirmar-entrega`,
                {
                    method: 'PUT',
                    config: {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                }
            );
            onSuccess?.(); 
        } catch (error) {
            console.error('Error al confirmar entrega:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleConfirmar}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
        >
            {loading ? (
                <>
                    <Package className="w-4 h-4 animate-spin" />
                    Confirmando...
                </>
            ) : (
                <>
                    <CheckCircle className="w-4 h-4" />
                    Recibí producto
                </>
            )}
        </button>
    );
}