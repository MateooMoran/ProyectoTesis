import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL?.replace("/api", "") || "http://localhost:3000";

export default function useChat(token, usuarioId) {
  const [roomId, setRoomId] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      console.log("No hay token para conectar socket");
      return;
    }
    console.log("Conectando socket con token:", token);

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    const handleChatJoined = ({ roomId, mensajes }) => {
      console.log("Socket chat-joined:", roomId, mensajes);
      setRoomId(roomId);
      setMensajes(mensajes || []);
    };

    const handleNuevoMensaje = (mensajesActualizados) => {
      console.log("Socket nuevo-mensaje:", mensajesActualizados);
      setMensajes(mensajesActualizados);
    };

    const handleErrorMensaje = (msg) => {
      console.log("Socket error-mensaje:", msg);
      setError(msg);
    };

    socketRef.current.on("chat-joined", handleChatJoined);
    socketRef.current.on("nuevo-mensaje", handleNuevoMensaje);
    socketRef.current.on("error-mensaje", handleErrorMensaje);

    return () => {
      socketRef.current.off("chat-joined", handleChatJoined);
      socketRef.current.off("nuevo-mensaje", handleNuevoMensaje);
      socketRef.current.off("error-mensaje", handleErrorMensaje);
      socketRef.current.disconnect();
      console.log("Socket desconectado");
    };
  }, [token]);

  const joinChat = (otherUserId) => {
    console.log("Solicitando join-chat con userId:", usuarioId, "y otherUserId:", otherUserId);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("join-chat", {
        userId: usuarioId,
        otherUserId,
      });
      setError(null);
    } else {
      console.log("Socket no conectado para join-chat");
      setError("Conexión de socket no disponible");
    }
  };

  const sendMessage = (roomIdToSend, texto, emisorId) => {
    console.log("Enviando mensaje:", { roomIdToSend, texto, emisorId });
    if (!texto.trim() || !roomIdToSend) return;
    if (!socketRef.current || !socketRef.current.connected) {
      console.log("Socket desconectado, no se puede enviar mensaje");
      setError("Socket desconectado, no se puede enviar el mensaje.");
      return;
    }
    socketRef.current.emit("enviar-mensaje", {
      roomId: roomIdToSend,
      texto,
      emisor: emisorId,
    });
  };

  return {
    roomId,
    mensajes,
    error,
    joinChat,
    sendMessage,
  };
}
