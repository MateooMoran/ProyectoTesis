import React, { useState, useRef, useEffect } from "react";
import { Search, Send, X } from "lucide-react";
import useChat from "../../hooks/useChat";
import { ToastContainer } from 'react-toastify'
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

export default function ChatWindow({ onClose }) {
  const storedToken = JSON.parse(localStorage.getItem("auth-token"));
  const profile = JSON.parse(localStorage.getItem("profile-storage"));

  const token = storedToken?.state?.token || "";
  const usuarioActual = profile?.state?.user || null;

  // Estados para buscador
  const [nombreBuscar, setNombreBuscar] = useState("");
  const [apellidoBuscar, setApellidoBuscar] = useState("");
  const [resultados, setResultados] = useState([]);

  // Conversación activa
  const [conversandoCon, setConversandoCon] = useState(null);

  // Conversaciones recientes
  const [conversaciones, setConversaciones] = useState([]);

  // Extra: Para controlar qué conversación tiene mensaje nuevo sin leer y hacer background azul
  const [mensajesNuevos, setMensajesNuevos] = useState(new Set());

  const { roomId, mensajes, error, joinChat, sendMessage } = useChat(token, usuarioActual?._id);

  const mensajesRef = useRef(null);

  // Scroll automático cuando llegan mensajes
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Cargar conversaciones recientes (incluye ultimaLectura)
  const fetchConversaciones = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/chat/conversaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error cargando conversaciones");
      const data = await res.json();
      setConversaciones(data);

      // Actualizar set de mensajes nuevos (no leídos)
      const nuevosNoLeidos = new Set();
      data.forEach(conv => {
        if (tieneMensajesNoLeidos(conv)) {
          nuevosNoLeidos.add(conv.conversacionId);
        }
      });
      setMensajesNuevos(nuevosNoLeidos);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversaciones();
  }, [token]);

  // Marcar conversación como leída cuando se abre (roomId cambia)
  useEffect(() => {
    if (!roomId || !token) return;

    const marcarComoLeida = async () => {
      try {
        const res = await fetch(`${API_URL}/chat/conversacion/${roomId}/leer`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          console.warn("No se pudo marcar la conversación como leída");
        } else {
          // Recargar conversaciones para actualizar estado de lectura
          fetchConversaciones();

          // Quitar esa conversación de mensajes nuevos
          setMensajesNuevos(prev => {
            const copia = new Set(prev);
            copia.delete(roomId);
            return copia;
          });
        }
      } catch (error) {
        console.error("Error marcando conversación como leída:", error);
      }
    };

    marcarComoLeida();
  }, [roomId, token]);

  // Detectar mensaje nuevo entrante y actualizar lista de conversaciones para mostrar nuevo estado
  useEffect(() => {
    if (!mensajes.length) return;

    const ultimoMensaje = mensajes[mensajes.length - 1];

    if (ultimoMensaje.emisor._id !== usuarioActual._id) {
      // Si la conversación del mensaje nuevo NO es la conversación abierta, marcarla como no leída
      const idConversacionMensaje = ultimoMensaje.conversacionId || ultimoMensaje.roomId || null;

      if (!roomId || roomId !== idConversacionMensaje) {
        setMensajesNuevos(prev => {
          const copia = new Set(prev);
          if (idConversacionMensaje) {
            copia.add(idConversacionMensaje);
          }
          return copia;
        });
      } else {
        // Si es la conversación abierta, ya se marca como leída con el otro useEffect
        // Aquí puedes asegurarte de quitarla del set mensajesNuevos
        setMensajesNuevos(prev => {
          const copia = new Set(prev);
          copia.delete(roomId);
          return copia;
        });
      }
    }

    // Actualizar lista de conversaciones para refrescar último mensaje y estados
    fetchConversaciones();
  }, [mensajes]);


  // Función para saber si la conversación tiene mensajes no leídos para el usuario actual
  const tieneMensajesNoLeidos = (conv) => {
    if (!conv.ultimoMensaje?.fecha || !conv.ultimaLectura) return false;
    return new Date(conv.ultimoMensaje.fecha) > new Date(conv.ultimaLectura);
  };

  // Buscar usuarios nuevo chat
  const buscarUsuarios = async () => {
    if (!nombreBuscar.trim() && !apellidoBuscar.trim()) {
      alert("Debes ingresar al menos nombre o apellido para buscar");
      return;
    }
    try {
      const params = new URLSearchParams();
      if (nombreBuscar.trim()) params.append("nombre", nombreBuscar.trim());
      if (apellidoBuscar.trim()) params.append("apellido", apellidoBuscar.trim());

      const url = `${API_URL}/chat/buscar?${params.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

      const data = await res.json();

      const userId = usuarioActual?._id || null;
      const filtered = userId ? data.filter(u => u._id !== userId) : data;

      setResultados(filtered);
      setConversaciones([]); // ocultar conversaciones recientes cuando buscas
    } catch (error) {
      alert("Error buscando usuarios: " + (error.message || error));
    }
  };

  // Abrir chat con usuario (de búsqueda o lista recientes)
  const iniciarChat = (usuario) => {
    setConversandoCon(usuario);
    joinChat(usuario._id);
    setResultados([]);
    setConversaciones([]);
    setNombreBuscar("");
    setApellidoBuscar("");
  };

  // Abrir chat con conversación reciente, buscar usuario en la lista
  const iniciarChatConConversacion = (conv) => {
    iniciarChat(conv.otroMiembro);
  };

  // Enviar mensaje
  const [texto, setTexto] = useState("");

  const enviarMensaje = () => {
    if (!texto.trim()) return;
    sendMessage(roomId, texto.trim(), usuarioActual._id);
    setTexto("");
  };

  // Formatear fecha
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div

      className="
      fixed bottom-5 right-5
      w-[65vw] max-w-md sm:max-w-md md:w-[42vh] md:max-w-lg lg:max-w-md xl:max-w-md
      h-[60vh] sm:h-[65vh] md:h-[70vh]
      bg-white border border-gray-200 rounded-xl shadow-xl
      flex flex-col overflow-hidden font-sans text-gray-800
      z-50
    "
    >
      <ToastContainer></ToastContainer>
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md">
        <h2 className="font-semibold text-xl tracking-wide select-none">Chat</h2>
        <button
          onClick={onClose}
          aria-label="Cerrar chat"
          className="hover:text-red-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
        >
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 text-center text-sm font-medium select-none">
          {error}
        </div>
      )}

      {!conversandoCon ? (
        <>
          {/* Buscador usuarios */}
          <div className="flex flex-wrap items-center p-4 gap-2 border-b border-gray-200 bg-gray-50">
            <input
              type="text"
              placeholder="Nombre"
              value={nombreBuscar}
              onChange={(e) => setNombreBuscar(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-24 sm:w-32 md:w-40"
              onKeyDown={(e) => e.key === "Enter" && buscarUsuarios()}
              aria-label="Buscar por nombre"
            />
            <input
              type="text"
              placeholder="Apellido"
              value={apellidoBuscar}
              onChange={(e) => setApellidoBuscar(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-24 sm:w-32 md:w-40"
              onKeyDown={(e) => e.key === "Enter" && buscarUsuarios()}
              aria-label="Buscar por apellido"
            />
            <button
              onClick={buscarUsuarios}
              className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-3 py-2 rounded-lg inline-flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Buscar usuarios"
              title="Buscar usuarios"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Lista de conversaciones recientes */}
          {conversaciones.length > 0 && (
            <div
              className="flex-1 overflow-y-auto max-h-[calc(65vh-144px)] sm:max-h-[calc(60vh-144px)] md:max-h-[calc(65vh-144px)]"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#3b82f6 #e5e7eb",
              }}
            >
              {conversaciones.map((conv) => {
                const emisorId = conv.ultimoMensaje?.emisor?._id
                  ? conv.ultimoMensaje.emisor._id.toString()
                  : conv.ultimoMensaje?.emisor?.toString() || "";

                const esMensajePropio = emisorId === usuarioActual._id;

                const nombreEmisor = esMensajePropio ? "Yo" : conv.otroMiembro?.nombre || "Desconocido";

                // Marca si hay mensajes no leídos por la función o por mensajesNuevos
                const noLeido = tieneMensajesNoLeidos(conv) || mensajesNuevos.has(conv.conversacionId);

                return (
                  <div
                    key={conv.conversacionId}
                    onClick={() => iniciarChatConConversacion(conv)}
                    className={`p-4 cursor-pointer border-b border-gray-100 flex flex-col rounded-lg transition duration-150 focus:outline-none
        hover:bg-blue-50
        ${noLeido ? "bg-blue-100 font-semibold" : ""}
      `}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && iniciarChatConConversacion(conv)}
                  >
                    <div className="flex flex-col gap-0.5">
                      <label className="font-semibold text-gray-900 text-lg select-none">
                        {conv.otroMiembro?.nombre || ""} {conv.otroMiembro?.apellido || ""}
                      </label>
                      <small className="italic text-blue-600 font-medium">{conv.otroMiembro?.rol || "Rol desconocido"}</small>
                    </div>
                    <div className="flex justify-between mt-1 text-sm font-medium text-blue-600">
                      <span>{formatearFecha(conv.ultimoMensaje?.fecha)}</span>
                    </div>
                    <p className="text-gray-700 truncate mt-1">
                      {nombreEmisor}: {conv.ultimoMensaje?.texto || "Sin mensajes aún"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Resultados de búsqueda */}
          {resultados.length > 0 && (
            <div
              className="flex-1 overflow-y-auto max-h-[calc(65vh-144px)] sm:max-h-[calc(60vh-144px)] md:max-h-[calc(65vh-144px)]"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#3b82f6 #e5e7eb",
              }}
            >
              {resultados.map((user) => (
                <div
                  key={user._id}
                  onClick={() => iniciarChat(user)}
                  className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex flex-col rounded-lg transition duration-150 focus:bg-blue-100 focus:outline-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && iniciarChat(user)}
                >
                  <div className="flex flex-col gap-0.5">
                    <label className="font-semibold text-gray-900 text-lg select-none">
                      {`${user.nombre} ${user.apellido}`}
                    </label>
                    <small className="italic text-blue-600 font-medium">{user.rol || "Rol desconocido"}</small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mensaje cuando no hay resultados ni conversaciones */}
          {resultados.length === 0 && conversaciones.length === 0 && (
            <p className="p-4 text-gray-500 italic select-none">
              No hay usuarios ni conversaciones recientes para mostrar.
            </p>
          )}
        </>
      ) : (
        <>
          {/* Info chat activo */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50 select-none">
            <button
              onClick={() => setConversandoCon(null)}
              className="text-blue-600 font-bold text-2xl hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
              aria-label="Volver a búsqueda"
              title="Volver a búsqueda"
            >
              &larr;
            </button>
            <div className="flex flex-col gap-0.5">
              <label className="font-semibold text-gray-900 text-lg select-none">
                {`${conversandoCon.nombre} ${conversandoCon.apellido}`}
              </label>
              <small className="text-xs text-gray-500">
                Rol: {conversandoCon.rol || "desconocido"}
              </small>
            </div>
          </div>

          {/* Mensajes */}
          <div
            ref={mensajesRef}
            className="flex-1 overflow-y-auto p-4 max-h-[calc(65vh-144px)] sm:max-h-[calc(60vh-144px)] md:max-h-[calc(65vh-144px)] space-y-3"
            style={{
              minHeight: "180px",
              scrollbarWidth: "thin",
              scrollbarColor: "#3b82f6 #e5e7eb",
            }}
            aria-live="polite"
          >
            {mensajes.length === 0 ? (
              <p className="text-gray-500 italic select-none">No hay mensajes aún</p>
            ) : (
              mensajes
                .filter(m => m.emisor && m.emisor._id)
                .map((m, i) => (
                  <div
                    key={m._id || i}
                    className={`flex flex-col max-w-[75%] ${m.emisor._id === usuarioActual._id ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                  >
                    <div
                      className={`p-3 rounded-2xl shadow-md break-words select-text transition-colors duration-300 ${m.emisor._id === usuarioActual._id
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        }`}
                    >
                      {m.texto}
                    </div>
                    <span className="text-xs text-gray-400 mt-1 select-none tracking-wide">
                      {formatearFecha(m.fecha || m.createdAt)}
                    </span>
                  </div>
                ))

            )}
          </div>

          {/* Input para enviar mensaje */}
          <div className="flex flex-col sm:flex-row p-4 border-t border-gray-200 bg-gray-50 gap-2">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribir mensaje..."
              className="flex-1 border border-gray-300 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
              autoFocus
              aria-label="Escribir mensaje"
              spellCheck={false}
            />
            <button
              onClick={enviarMensaje}
              className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-5 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
              aria-label="Enviar mensaje"
              title="Enviar mensaje"
            >
              <Send size={22} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
