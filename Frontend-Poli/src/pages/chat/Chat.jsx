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
  // Nota: Asumo que useChat devuelve también "miembros" del chat para mostrar cantidad.

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
    if (!texto.trim()) return; // evitar enviar mensajes vacíos
    sendMessage(roomId, texto.trim(), usuarioActual._id);
    setTexto("");
  };

  // Formatear fecha legible para mensajes
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
    <div className="fixed bottom-5 right-5 w-96 bg-white border rounded-lg shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b bg-blue-50">
        <h2 className="font-bold text-blue-700 text-lg">Chat</h2>
        <button onClick={onClose} aria-label="Cerrar chat" className="hover:text-red-600">
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 text-center text-sm">{error}</div>
      )}

      {!conversandoCon ? (
        <>
          {/* Buscador usuarios */}
          <div className="flex p-3 gap-2 border-b bg-gray-50">
            <input
              type="text"
              placeholder="Nombre"
              value={nombreBuscar}
              onChange={(e) => setNombreBuscar(e.target.value)}
              className="flex-1 border border-gray-300 p-2 rounded focus:outline-blue-500"
              onKeyDown={(e) => e.key === "Enter" && buscarUsuarios()}
              aria-label="Buscar por nombre"
            />
            <input
              type="text"
              placeholder="Apellido"
              value={apellidoBuscar}
              onChange={(e) => setApellidoBuscar(e.target.value)}
              className="flex-1 border border-gray-300 p-2 rounded focus:outline-blue-500"
              onKeyDown={(e) => e.key === "Enter" && buscarUsuarios()}
              aria-label="Buscar por apellido"
            />
            <button
              onClick={buscarUsuarios}
              className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"
              aria-label="Buscar usuarios"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Resultados */}
          <div className="flex-1 overflow-y-auto max-h-72">
            {resultados.length === 0 ? (
              <p className="p-3 text-gray-500 italic">No hay usuarios encontrados</p>
            ) : (
              resultados.map((user) => (
                <div
                  key={user._id}
                  onClick={() => iniciarChat(user)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b flex flex-col"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && iniciarChat(user)}
                >
                  <div className="font-semibold text-gray-800">
                    {user.nombre} {user.apellido}
                  </div>
                  {/* Campos importantes agregados: email, rol, estado */}
                  <div className="text-sm text-gray-600 flex justify-between mt-1">
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
          <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
            <button
              onClick={() => setConversandoCon(null)}
              className="text-blue-600 font-bold text-xl"
              aria-label="Volver a búsqueda"
            >
              &larr;
            </button>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800">
                {conversandoCon.nombre} {conversandoCon.apellido}
              </span>
              <small className="text-xs text-gray-500">
              rol: {conversandoCon.rol || "desconocido"} 
              </small>
            </div>
          </div>

          {/* Mensajes */}
          <div
            ref={mensajesRef}
            className="flex-1 overflow-y-auto p-3 max-h-72 space-y-2"
            style={{ minHeight: "200px" }}
            aria-live="polite"
          >
            {mensajes.length === 0 ? (
              <p className="text-gray-500 italic">No hay mensajes aún</p>
            ) : (
              mensajes.map((m, i) => (
                <div
                  key={m._id || i}
                  className={`flex flex-col max-w-[70%] ${
                    m.emisor._id === usuarioActual._id
                      ? "ml-auto items-end"
                      : "mr-auto items-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      m.emisor._id === usuarioActual._id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    } break-words`}
                  >
                    {m.texto}
                  </div>
                  <span className="text-xs text-gray-400 mt-0.5 select-none">
                    {formatearFecha(m.fecha || m.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Input para enviar mensaje */}
          <div className="flex p-3 border-t bg-gray-50">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribir mensaje..."
              className="flex-1 border border-gray-300 p-2 rounded-l-lg focus:outline-blue-500"
              onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
              autoFocus
              aria-label="Escribir mensaje"
            />
            <button
              onClick={enviarMensaje}
              className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700"
              aria-label="Enviar mensaje"
            >
              <Send size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
