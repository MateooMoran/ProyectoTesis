// src/components/chat/ChatWindow.jsx
import React, { useState, useRef, useEffect } from "react";
import { Search, Send, X, MessageCircle, Info, Trash2 } from "lucide-react";
import useChat from "../../hooks/useChat";
import useFetch from "../../hooks/useFetch";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

export default function ChatWindow({ onClose, showBadge = true }) {
  const { fetchDataBackend } = useFetch();

  // --- DATOS DEL USUARIO ---
  const storedToken = JSON.parse(localStorage.getItem("auth-token"));
  const profile = JSON.parse(localStorage.getItem("profile-storage"));
  const token = storedToken?.state?.token || null;
  const usuarioActual = profile?.state?.user || null;

  if (!token || !usuarioActual) return null;

  // --- ESTADOS ---
  const [nombreBuscar, setNombreBuscar] = useState("");
  const [resultados, setResultados] = useState([]);
  const [conversandoCon, setConversandoCon] = useState(null);
  const [conversaciones, setConversaciones] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensajesNuevos, setMensajesNuevos] = useState(new Set());
  const [totalMensajesNuevos, setTotalMensajesNuevos] = useState(0);
  const [texto, setTexto] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [escribiendoTimer, setEscribiendoTimer] = useState(null);

  // --- SOCKET ---
  const { roomId, mensajes, error, joinChat, sendMessage, socketRef } = useChat(token, usuarioActual._id);
  const mensajesRef = useRef(null);

  // --- SCROLL AUTOMÁTICO ---
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // --- CARGAR CONVERSACIONES ---
  const fetchConversaciones = async () => {
    try {
      const data = await fetchDataBackend(`${API_URL}/chat/conversaciones`, {
        method: "GET",
        config: { headers: { Authorization: `Bearer ${token}` } },
      });

      setConversaciones(data);

      const nuevos = new Set();
      let count = 0;
      data.forEach(conv => {
        if (tieneMensajesNoLeidos(conv)) {
          nuevos.add(conv.conversacionId);
          count++;
        }
      });
      setMensajesNuevos(nuevos);
      setTotalMensajesNuevos(count);
    } catch (err) {
      if (err.message.includes("Token")) {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("profile-storage");
        window.location.reload();
      }
    }
  };

  useEffect(() => {
    if (token && usuarioActual) {
      fetchConversaciones();
      setMostrarModal(true);
    }
  }, [token]);

  // --- MARCAR COMO LEÍDO ---
  useEffect(() => {
    if (!roomId || !token) return;
    const marcarLeido = async () => {
      try {
        await fetchDataBackend(`${API_URL}/conversacion/${roomId}/leer`, {
          method: "POST",
          config: { headers: { Authorization: `Bearer ${token}` } },
        });
        fetchConversaciones();
        setMensajesNuevos(prev => {
          const copia = new Set(prev);
          copia.delete(roomId);
          setTotalMensajesNuevos(copia.size);
          return copia;
        });
      } catch (err) {
        console.error("Error marcando como leído");
      }
    };
    marcarLeido();
  }, [roomId, token]);

  // --- NUEVO MENSAJE (SOCKET) ---
  useEffect(() => {
    if (!mensajes.length || !roomId) return;
    const ultimo = mensajes[mensajes.length - 1];
    if (ultimo.emisor?._id !== usuarioActual._id) {
      setMensajesNuevos(prev => {
        const copia = new Set(prev);
        copia.add(roomId);
        setTotalMensajesNuevos(copia.size);
        return copia;
      });
      if (Notification.permission === "granted") {
        new Notification("Nuevo mensaje", {
          body: `${ultimo.emisor.nombre}: ${ultimo.texto}`,
          icon: "/logo.png",
        });
      }
      fetchConversaciones(); // Refresca contador
    }
  }, [mensajes, roomId, usuarioActual._id]);

  // --- ESCRIBIENDO ---
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !roomId) return;

    const handleEscribiendo = ({ roomId: id }) => {
      if (id === roomId) {
        setEscribiendo(true);
        if (escribiendoTimer) clearTimeout(escribiendoTimer);
        const timer = setTimeout(() => setEscribiendo(false), 2000);
        setEscribiendoTimer(timer);
      }
    };

    socket.on("escribiendo", handleEscribiendo);
    return () => {
      socket.off("escribiendo", handleEscribiendo);
      if (escribiendoTimer) clearTimeout(escribiendoTimer);
    };
  }, [roomId, socketRef]);

  const handleInputChange = (e) => {
    setTexto(e.target.value);
    const socket = socketRef?.current;
    if (socket && roomId) {
      socket.emit("escribiendo", { roomId });
    }
  };

  const tieneMensajesNoLeidos = (conv) => {
    if (!conv.ultimoMensaje?.fecha || !conv.ultimaLectura) return false;
    return new Date(conv.ultimoMensaje.fecha) > new Date(conv.ultimaLectura);
  };

  // --- BUSCAR USUARIOS ---
  const buscarUsuarios = async () => {
    const nombre = nombreBuscar.trim();
    if (!nombre) return toast.warn("Escribe un nombre");

    try {
      const data = await fetchDataBackend(`${API_URL}/chat/buscar?nombre=${encodeURIComponent(nombre)}`, {
        method: "GET",
        config: { headers: { Authorization: `Bearer ${token}` } },
      });
      setResultados(data.filter(u => u._id !== usuarioActual._id));
      setConversaciones([]);
    } catch (err) {
      if (err.message.includes("Token")) {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("profile-storage");
        window.location.reload();
      }
    }
  };

  const iniciarChat = (usuario) => {
    setConversandoCon(usuario);
    joinChat(usuario._id);
    setResultados([]);
    setConversaciones([]);
    setNombreBuscar("");
  };

  const iniciarChatConConversacion = (conv) => {
    setConversandoCon(conv.otroMiembro);
    joinChat(conv.otroMiembro._id);
  };

  const enviarMensaje = () => {
    if (!texto.trim() || !roomId) return toast.warn("Escribe un mensaje");
    sendMessage(roomId, texto.trim(), usuarioActual._id);
    setTexto("");
  };

  const eliminarConversacion = async () => {
    if (!roomId || !token) return;
    if (!confirm("¿Eliminar conversación?")) return;

    try {
      await fetchDataBackend(`${API_URL}/chat/conversacion/${roomId}`, {
        method: "DELETE",
        config: { headers: { Authorization: `Bearer ${token}` } },
      });
      toast.success("Eliminada");
      setConversandoCon(null);
      setMensajesNuevos(prev => {
        const copia = new Set(prev);
        copia.delete(roomId);
        setTotalMensajesNuevos(copia.size);
        return copia;
      });
      fetchConversaciones();
    } catch (err) {
      if (err.message.includes("Token")) {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("profile-storage");
        window.location.reload();
      }
    }
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Badge */}
      {showBadge && totalMensajesNuevos > 0 && !conversandoCon && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center font-bold text-xs lg:text-sm shadow-lg animate-bounce">
              {totalMensajesNuevos > 99 ? "99+" : totalMensajesNuevos}
            </div>
            <button
              onClick={() => setMostrarModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 lg:p-4 rounded-full shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg lg:rounded-xl shadow-2xl max-w-sm w-full p-4 lg:p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Chat Estudiantes & Vendedores</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Conecta con <strong>vendedores</strong> y <strong>estudiantes</strong>.
            </p>
            <button
              onClick={() => setMostrarModal(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              ¡Empezar!
            </button>
          </div>
        </div>
      )}

      {/* Ventana principal */}
      <div className="fixed bottom-6 right-6 w-[90vw] max-w-[360px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[480px] h-[60vh] sm:h-[65vh] md:h-[70vh] bg-white rounded-lg lg:rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden z-50">
        <div className="flex justify-between items-center p-3 lg:p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
            <h2 className="font-semibold text-lg lg:text-xl">Chat</h2>
            {totalMensajesNuevos > 0 && !conversandoCon && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                {totalMensajesNuevos}
              </span>
            )}
          </div>
          <button onClick={onClose} className="hover:text-red-300 transition-colors">
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 text-center text-sm font-medium">
            {error}
          </div>
        )}

        {!conversandoCon ? (
          <>
            <div className="flex items-center p-3 lg:p-4 gap-2 border-b border-gray-200 bg-gray-50">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={nombreBuscar}
                onChange={(e) => setNombreBuscar(e.target.value)}
                className="flex-1 border border-gray-300 p-2 lg:p-3 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium placeholder-gray-400"
                onKeyDown={(e) => e.key === "Enter" && buscarUsuarios()}
              />
              <button
                onClick={buscarUsuarios}
                className="bg-blue-600 text-white p-2 lg:p-3 rounded-lg lg:rounded-xl hover:bg-blue-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Search className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              {conversaciones.length > 0 ? (
                conversaciones.map((conv) => {
                  const noLeido = tieneMensajesNoLeidos(conv) || mensajesNuevos.has(conv.conversacionId);
                  return (
                    <div
                      key={conv.conversacionId}
                      onClick={() => iniciarChatConConversacion(conv)}
                      className={`p-3 lg:p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer relative transition-all ${noLeido ? "bg-blue-50 font-semibold" : ""}`}
                    >
                      {noLeido && <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
                      <p className="font-semibold text-sm lg:text-base text-gray-800 truncate">
                        {conv.otroMiembro?.nombre} {conv.otroMiembro?.apellido}
                      </p>
                      <p className="text-xs text-gray-500 italic">{conv.otroMiembro?.rol}</p>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {conv.ultimoMensaje?.emisor?._id === usuarioActual._id ? "Yo" : conv.otroMiembro?.nombre}: {conv.ultimoMensaje?.texto || "Sin mensajes"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatearFecha(conv.ultimoMensaje?.fecha)}</p>
                    </div>
                  );
                })
              ) : resultados.length > 0 ? (
                resultados.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => iniciarChat(user)}
                    className="p-3 lg:p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <p className="font-semibold text-sm lg:text-base text-gray-800 truncate">
                      {user.nombre} {user.apellido}
                    </p>
                    <p className="text-xs text-gray-500 italic">{user.rol}</p>
                  </div>
                ))
              ) : (
                <p className="p-4 text-gray-500 text-sm italic text-center">Busca por nombre</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <button onClick={() => setConversandoCon(null)} className="text-blue-600 hover:text-blue-800">
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <p className="font-semibold text-sm lg:text-base text-gray-800 truncate">
                    {conversandoCon.nombre} {conversandoCon.apellido}
                  </p>
                  <p className="text-xs text-gray-500">Rol: {conversandoCon.rol}</p>
                </div>
              </div>
              <button onClick={eliminarConversacion} className="text-red-600 hover:text-red-700" title="Eliminar">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div ref={mensajesRef} className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
              {escribiendo && (
                <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  Escribiendo...
                </div>
              )}
              {mensajes.length === 0 ? (
                <p className="text-gray-500 text-sm italic text-center">Escribe el primer mensaje</p>
              ) : (
                mensajes
                  .filter(m => m.emisor && m.emisor._id)
                  .map((m, i) => (
                    <div
                      key={m._id || i}
                      className={`flex flex-col max-w-[80%] ${m.emisor._id === usuarioActual._id ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      <div
                        className={`p-2 lg:p-3 rounded-lg lg:rounded-xl shadow-md break-words transition-colors ${
                          m.emisor._id === usuarioActual._id
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-xs lg:text-sm">{m.texto}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatearFecha(m.fecha || m.createdAt)}</p>
                    </div>
                  ))
              )}
            </div>

            <div className="flex items-center p-3 lg:p-4 border-t border-gray-200 bg-gray-50 gap-2">
              <input
                type="text"
                value={texto}
                onChange={handleInputChange}
                placeholder="Escribe un mensaje..."
                className="flex-1 border border-gray-300 p-2 lg:p-3 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
                autoFocus
              />
              <button
                onClick={enviarMensaje}
                className="bg-blue-600 text-white p-2 lg:p-3 rounded-lg lg:rounded-xl hover:bg-blue-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Send className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}