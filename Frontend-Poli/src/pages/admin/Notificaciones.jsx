import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle, Trash2, Bell } from "lucide-react";
import useFetch from "../../hooks/useFetch";

export default function NotificacionesAdmin() {
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const { fetchDataBackend } = useFetch();

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
      } else if (data && Array.isArray(data.notificaciones)) {
        setNotificaciones(data.notificaciones);
      } else {
        setNotificaciones([]);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
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

  // Cargar una vez al montar para mostrar numerito
  useEffect(() => {
    obtenerNotificaciones();
  }, []);

  // Recargar cuando se abre el dropdown
  useEffect(() => {
    if (open) {
      setLoading(true);
      obtenerNotificaciones().finally(() => setLoading(false));
    }
  }, [open]);

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
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const eliminarNotificacion = async (id) => {
    try {
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
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
  };

  const noLeidasCount = notificaciones.filter((n) => !n.leido).length;

  return (
    <div
      className="fixed top-3 right-5 z-50 flex flex-col items-end"
      ref={dropdownRef}
    >
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

      {open && (
        <div className="mt-3 flex flex-col space-y-3 max-h-[400px] overflow-y-auto w-80 bg-white rounded-lg shadow-lg border border-gray-300">
          <div className="flex items-center justify-between p-4 ">
            <h3 className="text-lg font-semibold text-gray-700">Notificaciones</h3>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="p-1 rounded hover:bg-gray-200"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {loading ? (
            <p className="p-4 text-center text-gray-500">Cargando...</p>
          ) : notificaciones.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No hay notificaciones</p>
          ) : (
            notificaciones.map((n) => (
              <div
                key={n._id || n.id}
                className={`relative rounded-lg p-4 shadow-md transition-colors duration-300
                  ${
                    n.leido
                      ? "bg-white text-gray-800"
                      : "bg-gray-200/50 text-blue-900 font-semibold"
                  }`}
                style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              >
                {!n.leido && (
                  <button
                    onClick={() => marcarLeida(n._id || n.id)}
                    aria-label="Marcar como leída"
                    className="absolute top-2 right-8 text-green-600 hover:text-green-800"
                    title="Marcar como leída"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}
                <button
                  onClick={() => eliminarNotificacion(n._id || n.id)}
                  aria-label="Eliminar notificación"
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                  title="Eliminar notificación"
                >
                  <Trash2 size={18} />
                </button>
                <p className="whitespace-normal text-sm">{n.mensaje}</p>
                <div className="mt-2 flex justify-between items-center text-xs text-gray-600">
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      n.tipo === "sistema"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {n.tipo}
                  </span>
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
