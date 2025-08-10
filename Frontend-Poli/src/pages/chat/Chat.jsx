import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useFetch from "../../hooks/useFetch";
import { Search, Send, X } from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";
const SOCKET_URL =
    import.meta.env.VITE_BACKEND_URL?.replace("/api", "") || "http://localhost:3000";

export default function ChatWindow({ onClose }) {
    const { fetchDataBackend } = useFetch();
    const storedUser = JSON.parse(localStorage.getItem("auth-token"));
    const token = storedUser?.state?.token || "";

    const [search, setSearch] = useState("");
    const [resultados, setResultados] = useState([]);
    const [mensajes, setMensajes] = useState([]);
    const [texto, setTexto] = useState("");
    const [roomId, setRoomId] = useState(null);
    const [conversandoCon, setConversandoCon] = useState(null);

    const socketRef = useRef(null);
    const mensajesRef = useRef(null);

    // Inicializar socket solo una vez
    useEffect(() => {
        socketRef.current = io(SOCKET_URL, {
            transports: ["websocket"],
        });

        // Listeners
        const handleChatJoined = ({ roomId, mensajes }) => {
            setRoomId(roomId);
            setMensajes(mensajes);
        };

        const handleNuevoMensaje = (mensajesActualizados) => {
            setMensajes(mensajesActualizados);
        };

        const handleErrorMensaje = (msg) => {
            alert(msg); // Puedes reemplazar con toast
        };

        socketRef.current.on("chat-joined", handleChatJoined);
        socketRef.current.on("nuevo-mensaje", handleNuevoMensaje);
        socketRef.current.on("error-mensaje", handleErrorMensaje);

        return () => {
            socketRef.current.off("chat-joined", handleChatJoined);
            socketRef.current.off("nuevo-mensaje", handleNuevoMensaje);
            socketRef.current.off("error-mensaje", handleErrorMensaje);
            socketRef.current.disconnect();
        };
    }, []);

    // Auto-scroll cuando cambian mensajes
    useEffect(() => {
        if (mensajesRef.current) {
            mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
        }
    }, [mensajes]);

    const buscarUsuarios = async () => {
        if (!search.trim()) return;
        const data = await fetchDataBackend(
            `${API_URL}/chat/buscar?nombre=${search}`,
            {
                method: "GET",
                config: { headers: { Authorization: `Bearer ${token}` } },
            }
        );
        setResultados(data || []);
    };

    const iniciarChat = (usuario) => {
        setConversandoCon(usuario);
        setRoomId(null);
        setMensajes([]);

        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit("join-chat", {
                userId: storedUser.state.usuario._id,
                otherUserId: usuario._id,
            });
        } else {
            alert("Conexión de socket no disponible");
        }
    };

    const enviarMensaje = () => {
        if (!texto.trim() || !roomId) return;
        if (!socketRef.current || !socketRef.current.connected) {
            alert("Socket desconectado, no se puede enviar el mensaje.");
            return;
        }
        socketRef.current.emit("enviar-mensaje", {
            roomId,
            texto,
            emisor: storedUser.state.usuario._id,
        });
        setTexto("");
    };

    return (
        <div className="fixed bottom-5 right-5 w-96 bg-white border rounded-lg shadow-lg flex flex-col">
            <div className="flex justify-between items-center p-3 border-b">
                <h2 className="font-bold text-blue-600">Chat</h2>
                <button onClick={onClose}>
                    <X className="text-gray-600 hover:text-red-600" />
                </button>
            </div>

            {!conversandoCon ? (
                <>
                    <div className="flex p-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar usuario..."
                            className="flex-1 border p-2 rounded-l-lg"
                        />
                        <button
                            onClick={buscarUsuarios}
                            className="bg-blue-600 text-white px-3 rounded-r-lg"
                        >
                            <Search size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {resultados.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => iniciarChat(user)}
                                className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                            >
                                {user.nombre} {user.apellido} -{" "}
                                <span className="text-sm text-gray-500">{user.rol}</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
                        <button onClick={() => setConversandoCon(null)} className="text-blue-500">
                            &larr;
                        </button>
                        <span className="font-semibold">
                            {conversandoCon.nombre} {conversandoCon.apellido}
                        </span>
                    </div>
                    <div ref={mensajesRef} className="flex-1 overflow-y-auto p-3">
                        {mensajes.map((m, i) => (
                            <div
                                key={i}
                                className={`mb-2 flex ${m.emisor._id === storedUser.state.usuario._id ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`p-2 rounded-lg ${m.emisor._id === storedUser.state.usuario._id
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200"
                                        }`}
                                >
                                    <p className="text-sm">{m.texto}</p>
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
                        />
                        <button
                            onClick={enviarMensaje}
                            className="bg-blue-600 text-white px-4 rounded-r-lg"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
