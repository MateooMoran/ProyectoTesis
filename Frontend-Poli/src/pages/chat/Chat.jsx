import React, { useState, useRef, useEffect } from "react";
import { Search, Send, X } from "lucide-react";
import useChat from "../../hooks/useChat";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

export default function ChatWindow({ onClose }) {
  const storedToken = JSON.parse(localStorage.getItem("auth-token"));
  const profile = JSON.parse(localStorage.getItem("profile-storage"));

  const token = storedToken?.state?.token || "";
  const usuarioActual = profile?.state?.user || null;

  console.log("Token:", token);
  console.log("Usuario actual:", usuarioActual);

  const [nombreBuscar, setNombreBuscar] = useState("");
  const [apellidoBuscar, setApellidoBuscar] = useState("");
  const [resultados, setResultados] = useState([]);
  const [texto, setTexto] = useState("");
  const [conversandoCon, setConversandoCon] = useState(null);

  const { roomId, mensajes, error, joinChat, sendMessage } = useChat(token, usuarioActual?._id);

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

      console.log("Buscando usuarios en:", url);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

      const data = await res.json();

      console.log("Usuarios encontrados:", data);

      const userId = usuarioActual?._id || null;
      const filtered = userId ? data.filter(u => u._id !== userId) : data;

      setResultados(filtered);
    } catch (error) {
      console.error("Error buscando usuarios:", error);
      alert("Error buscando usuarios: " + (error.message || error));
    }
  };

  const iniciarChat = (usuario) => {
    console.log("Iniciando chat con:", usuario);
    setConversandoCon(usuario);
    joinChat(usuario._id);
  };

  const enviarMensaje = () => {
    console.log("Intentando enviar mensaje:", texto);
    sendMessage(roomId, texto, usuarioActual._id);
    setTexto("");
  };

  return (
    <div className="fixed bottom-5 right-5 w-96 bg-white border rounded-lg shadow-lg flex flex-col">
      <div className="flex justify-between items-center p-3 border-b">
        <h2 className="font-bold text-blue-600">Chat</h2>
        <button onClick={onClose} aria-label="Cerrar chat">
          <X className="text-gray-600 hover:text-red-600" />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 text-center">{error}</div>
      )}

      {!conversandoCon ? (
        <>
          <div className="flex p-3 gap-2">
            <input
              type="text"
              placeholder="Nombre"
              value={nombreBuscar}
              onChange={(e) => setNombreBuscar(e.target.value)}
              className="flex-1 border p-2 rounded"
              onKeyDown={(e) => e.key === "Enter" && buscarUsuarios()}
            />
            <input
              type="text"
              placeholder="Apellido"
              value={apellidoBuscar}
              onChange={(e) => setApellidoBuscar(e.target.value)}
              className="flex-1 border p-2 rounded"
              onKeyDown={(e) => e.key === "Enter" && buscarUsuarios()}
            />
            <button
              onClick={buscarUsuarios}
              className="bg-blue-600 text-white px-3 rounded"
              aria-label="Buscar usuarios"
            >
              <Search size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-72">
            {resultados.length === 0 ? (
              <p className="p-3 text-gray-500">No hay usuarios encontrados</p>
            ) : (
              resultados.map((user) => (
                <div
                  key={user._id}
                  onClick={() => iniciarChat(user)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") iniciarChat(user);
                  }}
                >
                  {user.nombre} {user.apellido} -{" "}
                  <span className="text-sm text-gray-500">{user.rol}</span>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
            <button
              onClick={() => setConversandoCon(null)}
              className="text-blue-500 font-bold"
              aria-label="Volver a búsqueda"
            >
              &larr;
            </button>
            <span className="font-semibold">
              {conversandoCon.nombre} {conversandoCon.apellido}
            </span>
          </div>

          <div
            ref={mensajesRef}
            className="flex-1 overflow-y-auto p-3 max-h-72"
            style={{ minHeight: "200px" }}
          >
            {mensajes.length === 0 && (
              <p className="text-gray-500">No hay mensajes aún</p>
            )}
            {mensajes.map((m, i) => (
              <div
                key={i}
                className={`mb-2 flex ${
                  m.emisor._id === usuarioActual._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    m.emisor._id === usuarioActual._id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                  style={{ maxWidth: "70%" }}
                >
                  <p className="text-sm break-words">{m.texto}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex p-3 border-t">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribir mensaje..."
              className="flex-1 border p-2 rounded-l-lg"
              onKeyDown={(e) => {
                if (e.key === "Enter") enviarMensaje();
              }}
              autoFocus
            />
            <button
              onClick={enviarMensaje}
              className="bg-blue-600 text-white px-4 rounded-r-lg"
              aria-label="Enviar mensaje"
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
