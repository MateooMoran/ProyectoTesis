import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle, Trash2, Bell, BellDot, Sparkles, UserCircle2, Settings, AlertCircle, Info, CheckCheck } from "lucide-react";
import useFetch from "../../hooks/useFetch";
import { useSocket } from "../../context/SocketContext";

export default function NotificacionesAdmin() {
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const { fetchDataBackend } = useFetch();
  const { nuevaNotificacion, contadorNotificaciones, decrementarContadorNotificaciones, resetearContadorNotificaciones } = useSocket();

  const storedUser = JSON.parse(localStorage.getItem("auth-token"));
  const token = storedUser?.state?.token || "";
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

  // Función para cargar notificaciones
  const obtenerNotificaciones = async () => {
    try {
      const url = `${API_URL}/notificaciones`;
      const data = await fetchDataBackend(url, {
        method: "GET",
        config: {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      });

      if (Array.isArray(data)) {
        setNotificaciones(data);
      } else if (data && Array.isArray(data.data)) {
        setNotificaciones(data.data);
      } else if (data && Array.isArray(data.notificaciones)) {
        setNotificaciones(data.notificaciones);
      } else {
        setNotificaciones([]);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:");
      setNotificaciones([]);
    }
  };

  // Cerrar dropdown si clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    obtenerNotificaciones();
  }, []);

  useEffect(() => {
    if (open) {
      setLoading(true);
      obtenerNotificaciones().finally(() => setLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (nuevaNotificacion) {
      console.log('🔔 Agregando nueva notificación:', nuevaNotificacion);
      setNotificaciones(prev => [nuevaNotificacion, ...prev]);
    }
  }, [nuevaNotificacion]);

  const marcarLeida = async (id) => {
    try {
      const url = `${API_URL}/notificaciones/leida/${id}`;
      await fetchDataBackend(url, {
        method: "PUT",
        config: {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      });
      setNotificaciones((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, leido: true } : n))
      );
      decrementarContadorNotificaciones();
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const eliminarNotificacion = async (id) => {
    try {
      const notif = notificaciones.find(n => (n._id === id || n.id === id));
      const url = `${API_URL}/notificaciones/${id}`;
      await fetchDataBackend(url, {
        method: "DELETE",
        config: {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      });
      setNotificaciones((prev) => prev.filter((n) => n._id !== id && n.id !== id));
      if (notif && !notif.leido) {
        decrementarContadorNotificaciones();
      }
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
  };

  // Nuevo handler: marcar todas como leídas
  const marcarTodas = async () => {
    if (!window.confirm('¿Marcar todas las notificaciones como leídas?')) return;
    try {
      const url = `${API_URL}/notificaciones/marcar-todas`;
      await fetchDataBackend(url, {
        method: "PUT",
        config: {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      });

      // Actualizar UI localmente
      setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
      resetearContadorNotificaciones();
      setOpen(false);
    } catch (error) {
      console.error("Error marcando todas las notificaciones:", error);
    }
  };

  const getIconoTipo = (tipo) => {
    const iconos = {
      sistema: <Settings className="w-4 h-4" />,
      alerta: <AlertCircle className="w-4 h-4" />,
      info: <Info className="w-4 h-4" />,
      exito: <CheckCircle className="w-4 h-4" />,
    };
    return iconos[tipo] || <Bell className="w-4 h-4" />;
  };

  const getColorTipo = (tipo) => {
    const colores = {
      sistema: 'from-blue-500 to-blue-600',
      alerta: 'from-amber-500 to-orange-600',
      info: 'from-cyan-500 to-blue-500',
      exito: 'from-green-500 to-emerald-600',
    };
    return colores[tipo] || 'from-gray-500 to-gray-600';
  };

  const noLeidasCount = contadorNotificaciones;

  return (
    <div
      className="fixed top-3 right-5 z-50 flex flex-col items-end"
      ref={dropdownRef}
    >
      {/* Botón de notificaciones mejorado */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-3 rounded-full bg-white shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Mostrar notificaciones"
      >
        <Bell className="w-7 h-7 text-blue-600" />
        {noLeidasCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {noLeidasCount}
          </span>
        )}
      </button>

      {/* Dropdown mejorado */}
      {open && (
        <div className="mt-3 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-xl">
          {/* Header mejorado */}
          <div className="p-5 bg-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-blue-800">
                  Notificaciones
                </h3>
                <span className="px-3 py-1 text-sm font-semibold text-gray-700 bg-white rounded-lg shadow-sm">
                  {notificaciones.length} {notificaciones.length === 1 ? 'mensaje' : 'mensajes'}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {notificaciones.length > 0 && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={marcarTodas}
                  className="flex-1 px-4 py-2 text-sm font-medium text-green-700 bg-white hover:bg-green-50 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar todas
                </button>

                <button
                  onClick={async () => {
                    if (!window.confirm('¿Eliminar todas las notificaciones?')) return;
                    try {
                      const url = `${API_URL}/notificaciones`;
                      await fetchDataBackend(url, {
                        method: 'DELETE',
                        config: {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                        },
                      });
                      setNotificaciones([]);
                      resetearContadorNotificaciones();
                      setOpen(false);
                    } catch (error) {
                      console.error('Error eliminando todas las notificaciones:', error);
                    }
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-white hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer "
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar todas
                </button>
              </div>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-[480px] overflow-y-auto">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-gray-500">Cargando notificaciones...</p>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="p-12 flex flex-col items-center text-center">
                <div className="p-4 rounded-2xl mb-4">
                  <Bell className="h-12 w-12 text-blue-600" />
                </div>
                <p className="font-semibold text-gray-700 text-lg">No tienes notificaciones</p>
                <p className="text-sm text-gray-500 mt-2 max-w-[280px]">Aquí aparecerán todas tus notificaciones nuevas.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificaciones.map((n) => (
                  <div
                    key={n._id || n.id}
                    className={`p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-200`}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Contenido */}
                      <p className={`text-sm leading-relaxed ${n.leido ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {n.mensaje}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${n.tipo === 'sistema' ? 'bg-blue-100 text-blue-700' :
                            n.tipo === 'alerta' ? 'bg-amber-100 text-amber-700' :
                              n.tipo === 'mensaje' ? 'bg-zinc-200 text-zinc-700' :
                                'bg-green-100 text-green-700'
                          }`}>
                          {getIconoTipo(n.tipo)}
                          {n.tipo}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(n.createdAt).toLocaleString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                        {!n.leido && (
                          <button
                            onClick={() => marcarLeida(n._id || n.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Marcar leída
                          </button>
                        )}
                        <button
                          onClick={() => eliminarNotificacion(n._id || n.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}