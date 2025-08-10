import React, { useState, useRef, useEffect } from "react";
import { Search, Send, X } from "lucide-react";
import useChat from "../../hooks/useChat";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

export default function ChatWindow({ onClose }) {
  const storedToken = JSON.parse(localStorage.getItem("auth-token"));
  const profile = JSON.parse(localStorage.getItem("profile-storage"));

  const token = storedToken?.state?.token || "";
  const usuarioActual = profile?.state?.user || null;

  const [nombreBuscar, setNombreBuscar] = useState("");
  const [apellidoBuscar, setApellidoBuscar] = useState("");
  const [resultados, setResultados] = useState([]);
  const [texto, setTexto] = useState("");
  const [conversandoCon, setConversandoCon] = useState(null);

  const { roomId, mensajes, error, joinChat, sendMessage, miembros } = useChat(token, usuarioActual?._id);

  const mensajesRef = useRef(null);

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

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
    } catch (error) {
      alert("Error buscando usuarios: " + (error.message || error));
    }
  };

  const iniciarChat = (usuario) => {
    setConversandoCon(usuario);
    joinChat(usuario._id);
  };

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

  return (
    <div className="
      fixed bottom-5 right-5
      w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-md xl:max-w-lg
      h-[80vh] sm:h-[70vh] md:h-[75vh]
      bg-white border border-gray-200 rounded-xl shadow-xl
      flex flex-col overflow-hidden font-sans text-gray-800
      z-50
      "
    >
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
          <div className="flex flex-col sm:flex-row p-4 gap-3 border-b border-gray-200 bg-gray-50">
            <input
              type="text"
              placeholder="Nombre"
              value={nombreBuscar}
              onChange={(e) => setNombreBuscar(e.target.value)}
              className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onKeyDown={(e) => e.key === "Enter" && buscarUsuarios()}
              aria-label="Buscar por nombre"
            />
            <input
          
            />
            <button
              onClick={buscarUsuarios}
              className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 rounded-lg flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 sm:mt-0"
              aria-label="Buscar usuarios"
              title="Buscar usuarios"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Resultados */}
          <div
            className="flex-1 overflow-y-auto max-h-[calc(80vh-144px)] sm:max-h-[calc(70vh-144px)] md:max-h-[calc(75vh-144px)]"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#3b82f6 #e5e7eb",
            }}
          >
            {resultados.length === 0 ? (
              <p className="p-4 text-gray-500 italic select-none">No hay usuarios encontrados</p>
            ) : (
              resultados.map((user) => (
                <div
                  key={user._id}
                  onClick={() => iniciarChat(user)}
                  className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex flex-col rounded-lg transition duration-150 focus:bg-blue-100 focus:outline-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && iniciarChat(user)}
                >
                  <label className="font-semibold text-gray-900 text-lg select-none">
                    {`${user.nombre} ${user.apellido}`}
                  </label>
                  <div className="text-sm text-blue-600 flex justify-between mt-1 font-medium">
                    <span className="italic">{user.rol || "Rol desconocido"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
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
            <div className="flex flex-col">
              <label className="font-semibold text-gray-900 text-lg select-none">
                {`${conversandoCon.nombre} ${conversandoCon.apellido}`}
              </label>
              <small className="text-xs text-gray-500">
                rol: {conversandoCon.rol || "desconocido"}
              </small>
            </div>
          </div>

          {/* Mensajes */}
          <div
            ref={mensajesRef}
            className="flex-1 overflow-y-auto p-4 max-h-[calc(80vh-144px)] sm:max-h-[calc(70vh-144px)] md:max-h-[calc(75vh-144px)] space-y-3"
            style={{
              minHeight: "220px",
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
                    className={`flex flex-col max-w-[75%] ${
                      m.emisor._id === usuarioActual._id
                        ? "ml-auto items-end"
                        : "mr-auto items-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl shadow-md break-words select-text transition-colors duration-300 ${
                        m.emisor._id === usuarioActual._id
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
