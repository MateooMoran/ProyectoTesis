import React, { useState, useRef, useEffect } from "react";
import { Search, Send, X, MessageCircle, Info } from "lucide-react";

// Simulación del hook useChat - reemplazar con el real
const useChat = (token, userId) => {
  const [mensajes, setMensajes] = useState([]);
  return {
    roomId: null,
    mensajes,
    error: null,
    joinChat: () => {},
    sendMessage: () => {}
  };
};

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

export default function ChatWindow({ onClose, showBadge = true }) {
  const storedToken = { state: { token: "dummy-token" } };
  const profile = { state: { user: { _id: "user123", nombre: "Usuario", apellido: "Actual" } } };

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

  // Pop-up explicativo
  const [mostrarPopup, setMostrarPopup] = useState(true);
  const [popupVisto, setPopupVisto] = useState(false);

  // Mensajes nuevos
  const [mensajesNuevos, setMensajesNuevos] = useState(new Set());
  const [totalMensajesNuevos, setTotalMensajesNuevos] = useState(0);

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
      let contadorTotal = 0;
      
      data.forEach(conv => {
        if (tieneMensajesNoLeidos(conv)) {
          nuevosNoLeidos.add(conv.conversacionId);
          contadorTotal++;
        }
      });
      
      setMensajesNuevos(nuevosNoLeidos);
      setTotalMensajesNuevos(contadorTotal);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversaciones();
    
    // Verificar si el usuario ya vio el popup antes
    const yaVisto = localStorage.getItem('chat-popup-visto');
    if (yaVisto === 'true') {
      setMostrarPopup(false);
      setPopupVisto(true);
    }
  }, [token]);

  // Marcar conversación como leída cuando se abre (roomId cambia)
  useEffect(() => {
    if (!roomId || !token) return;

    const marcarComoLeida = async () => {
      try {
        const res = await fetch(`${API_URL}/conversacion/${roomId}/leer`, {
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

  // Detectar mensaje nuevo entrante y actualizar lista de conversaciones
  useEffect(() => {
    if (!mensajes.length) return;

    const ultimoMensaje = mensajes[mensajes.length - 1];

    if (ultimoMensaje.emisor._id !== usuarioActual._id) {
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
        setMensajesNuevos(prev => {
          const copia = new Set(prev);
          copia.delete(roomId);
          return copia;
        });
      }
    }

    fetchConversaciones();
  }, [mensajes]);

  const tieneMensajesNoLeidos = (conv) => {
    if (!conv.ultimoMensaje?.fecha || !conv.ultimaLectura) return false;
    return new Date(conv.ultimoMensaje.fecha) > new Date(conv.ultimaLectura);
  };

  const buscarUsuarios = async () => {
    if (!nombreBuscar.trim() && !apellidoBuscar.trim()) {
      alert("Debes ingresar al menos nombre para buscar");
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
      setConversaciones([]);
    } catch (error) {
      alert("Error buscando usuarios: " + (error.message || error));
    }
  };

  const iniciarChat = (usuario) => {
    setConversandoCon(usuario);
    joinChat(usuario._id);
    setResultados([]);
    setConversaciones([]);
    setNombreBuscar("");
    setApellidoBuscar("");
  };

  const iniciarChatConConversacion = (conv) => {
    iniciarChat(conv.otroMiembro);
  };

  const [texto, setTexto] = useState("");

  const enviarMensaje = () => {
    if (!texto.trim()) return;
    sendMessage(roomId, texto.trim(), usuarioActual._id);
    setTexto("");
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cerrarPopup = () => {
    setMostrarPopup(false);
    setPopupVisto(true);
    localStorage.setItem('chat-popup-visto', 'true');
  };

  return (
    <>
      {/* Badge flotante con número de mensajes nuevos */}
      {showBadge && totalMensajesNuevos > 0 && !conversandoCon && (
        <div className="fixed bottom-5 right-5 z-50 pointer-events-none">
          <div className="relative">
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg animate-bounce">
              {totalMensajesNuevos > 99 ? '99+' : totalMensajesNuevos}
            </div>
          </div>
        </div>
      )}

      {/* Pop-up explicativo inicial */}
      {mostrarPopup && !popupVisto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Info className="text-blue-600" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¡Bienvenido al Chat! 💬
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Este chat te permite comunicarte directamente con:
                </p>
                <ul className="mt-3 space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Vendedores:</strong> Para consultas sobre productos y servicios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Estudiantes:</strong> Para coordinar entregas o resolver dudas</span>
                  </li>
                </ul>
                <p className="mt-4 text-sm text-gray-600 italic">
                  Busca personas por su nombre y comienza a conversar. ¡Tus conversaciones recientes se guardarán aquí!
                </p>
              </div>
            </div>
            <button
              onClick={cerrarPopup}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* Ventana de chat principal */}
      <div className="fixed bottom-5 right-5 w-[65vw] max-w-md sm:max-w-md md:w-[42vh] md:max-w-lg lg:max-w-md xl:max-w-md h-[60vh] sm:h-[65vh] md:h-[70vh] bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden font-sans text-gray-800 z-50">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md relative">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-xl tracking-wide select-none">Chat</h2>
            {totalMensajesNuevos > 0 && !conversandoCon && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                {totalMensajesNuevos}
              </span>
            )}
          </div>
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

                  const noLeido = tieneMensajesNoLeidos(conv) || mensajesNuevos.has(conv.conversacionId);

                  return (
                    <div
                      key={conv.conversacionId}
                      onClick={() => iniciarChatConConversacion(conv)}
                      className={`p-4 cursor-pointer border-b border-gray-100 flex flex-col rounded-lg transition duration-150 focus:outline-none hover:bg-blue-50 relative
                        ${noLeido ? "bg-blue-100 font-semibold" : ""}
                      `}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && iniciarChatConConversacion(conv)}
                    >
                      {noLeido && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
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

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}