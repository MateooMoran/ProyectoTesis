import React, { useState } from 'react';
import { alert } from '../../utils/alerts';
import { Loader2, X } from 'lucide-react';
import storeAuth from '../../context/storeAuth';

const BotonCancelarOrden = ({ ordenId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { token } = storeAuth();

    const handleCancelar = async () => {
        const confirmado = window.confirm(
            "¿Estás seguro de cancelar esta orden? Esta acción no se puede deshacer. El stock será devuelto."
        );

        if (!confirmado) return;

        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/estudiante/orden/${ordenId}/cancelar`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Error al cancelar la orden');
            }

            alert({ icon: 'success', title: 'Orden cancelada correctamente' });

            // Llamar al callback para refrescar la lista
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            alert({ icon: 'error', title: error.message || 'Error al cancelar la orden' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCancelar}
            disabled={loading}
            className="w-full bg-red-100 text-red-700 py-1.5 lg:py-2 px-3 lg:px-4 rounded-lg font-medium text-xs lg:text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-1 lg:gap-2 disabled:opacity-50"
        >
            {loading ? (
                <>
                    <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                    Cancelando...
                </>
            ) : (
                <>
                    <X className="w-3 h-3 lg:w-4 lg:h-4" />
                    Cancelar Orden
                </>
            )}
        </button>
    );
};

export default BotonCancelarOrden;
