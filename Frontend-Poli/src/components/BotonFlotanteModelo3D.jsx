import React, { useEffect, useRef } from 'react';
import { X, Package, CheckCircle } from 'lucide-react';
import storeModelo3D from '../context/storeModelo3D';
import { alert } from '../utils/alerts';
import useFetch from '../hooks/useFetch';

function BotonFlotanteModelo3D() {
    const { fetchDataBackend } = useFetch();
    const { generando, progreso, estado, productoId, productoNombre, actualizarProgreso, completarGeneracion, cancelarGeneracion } = storeModelo3D();
    const intervalRef = useRef(null);
    const notificadoRef = useRef(false);

    const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    useEffect(() => {
        if (!generando || !productoId) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Polling del progreso
        const checkProgress = async () => {
            try {
                const progressUrl = `${import.meta.env.VITE_BACKEND_URL}/vendedor/producto/${productoId}/progreso-modelo`;
                console.log('🔄 [Flotante] Consultando progreso:', progressUrl);
                
                const progressData = await fetchDataBackend(progressUrl, {
                    method: 'GET',
                    config: { headers },
                });

                console.log('📊 [Flotante] Progreso recibido:', progressData);
                const { status, progress = 0, modelo_url } = progressData;

                actualizarProgreso(progress, getEstadoMensaje(status, progress));
                console.log(`📈 [Flotante] Estado actualizado: ${status} - ${progress}%`);

                // Solo considerar completado si tiene modelo_url
                if (modelo_url) {
                    console.log('✅ [Flotante] Modelo completado con URL:', modelo_url);
                    completarGeneracion();
                    
                    // Notificar solo una vez
                    if (!notificadoRef.current) {
                        notificadoRef.current = true;
                        alert({ 
                            icon: 'success', 
                            title: `Modelo 3D de "${productoNombre}" generado correctamente`,
                            text: 'Ya puedes visualizarlo en tus productos.'
                        });
                        
                        // Reproducir sonido de notificación (opcional)
                        try {
                            const audio = new Audio('/notification.mp3');
                            audio.play().catch(() => {});
                        } catch (e) {}
                        
                        // Emitir evento personalizado para que ProductosVendedor recargue
                        window.dispatchEvent(new CustomEvent('modelo3DCompletado', { 
                            detail: { productoId, modelo_url } 
                        }));
                    }
                    
                    // Limpiar después de 5 segundos para que el usuario vea la notificación
                    setTimeout(() => {
                        cancelarGeneracion();
                        notificadoRef.current = false;
                    }, 5000);
                } else if (status === 'FAILED') {
                    console.log('❌ [Flotante] Generación falló');
                    cancelarGeneracion();
                    notificadoRef.current = false;
                    alert({ 
                        icon: 'error', 
                        title: 'Error al generar modelo 3D',
                        text: progressData.msg || 'Por favor intenta de nuevo.'
                    });
                } else if (status === 'NOT_STARTED') {
                    console.log('⚠️ [Flotante] Tarea no iniciada, reseteando...');
                    cancelarGeneracion();
                    notificadoRef.current = false;
                }
                // Si status === 'SUCCEEDED' pero no hay modelo_url aún, seguir esperando (proceso background)
            } catch (error) {
                console.error('Error verificando progreso:', error);
            }
        };

        // Iniciar polling
        intervalRef.current = setInterval(checkProgress, 5000);
        checkProgress(); // Ejecutar inmediatamente

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [generando, productoId]);

    const getEstadoMensaje = (status, progress) => {
        if (status === 'PENDING') return 'Pendiente...';
        if (status === 'IN_PROGRESS') {
            if (progress < 30) return 'Procesando imagen...';
            if (progress < 60) return 'Generando geometría 3D...';
            if (progress < 90) return 'Aplicando texturas...';
            return 'Casi listo...';
        }
        if (status === 'SUCCEEDED' && progress === 100) return 'Finalizando subida...';
        if (status === 'SUCCEEDED') return '¡Completado!';
        return estado;
    };

    if (!generando && progreso < 100) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-200 p-4 w-80 max-w-[calc(100vw-2rem)]">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                        {progreso === 100 ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                            <Package className="w-5 h-5 text-blue-500 animate-pulse flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-800 truncate">
                                Modelo 3D
                            </h4>
                            <p className="text-xs text-gray-600 truncate">{productoNombre}</p>
                        </div>
                    </div>
                    <button
                        onClick={cancelarGeneracion}
                        className="text-gray-400 hover:text-gray-600 transition flex-shrink-0 ml-2"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">{estado}</span>
                        <span className="font-bold text-blue-600">{progreso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ease-out rounded-full ${
                                progreso === 100
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                    : 'bg-gradient-to-r from-blue-500 via-blue-700 to-blue-900 animate-pulse'
                            }`}
                            style={{ width: `${progreso}%` }}
                        />
                    </div>
                </div>

                {progreso === 100 && (
                    <p className="text-xs text-green-600 text-center font-semibold mt-2">
                        ✓ Modelo generado exitosamente
                    </p>
                )}
            </div>
        </div>
    );
}

export default BotonFlotanteModelo3D;
