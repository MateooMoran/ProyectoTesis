import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL?.replace("/api", "") || "http://localhost:3000";

export default function useChat(token, usuarioId) {
  const [roomId, setRoomId] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !usuarioId) {
      console.log("❌ No hay token o usuarioId para conectar socket");
      return;
    }
    
    console.log("🔌 Conectando socket...");

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket conectado correctamente");
      setError(null);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("❌ Error de conexión socket:", err.message);
      setError("Error de conexión al chat");
    });

    const handleChatJoined = ({ roomId, mensajes }) => {
      console.log("✅ Socket chat-joined:", roomId, `${mensajes?.length || 0} mensajes`);
      setRoomId(roomId);
      setMensajes(mensajes || []);
      setError(null);
    };

    const handleNuevoMensaje = (mensajesActualizados) => {
      console.log("📨 Socket nuevo-mensaje recibido:", mensajesActualizados?.length);
      if (Array.isArray(mensajesActualizados)) {
        setMensajes(mensajesActualizados);
      } else {
        console.warn("⚠️ Se esperaba un arreglo de mensajes:", mensajesActualizados);
      }
    };

    const handleErrorMensaje = (msg) => {
      console.error("❌ Socket error-mensaje:", msg);
      setError(msg);
    };

    socketRef.current.on("chat-joined", handleChatJoined);
    socketRef.current.on("nuevo-mensaje", handleNuevoMensaje);
    socketRef.current.on("error-mensaje", handleErrorMensaje);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("chat-joined", handleChatJoined);
        socketRef.current.off("nuevo-mensaje", handleNuevoMensaje);
        socketRef.current.off("error-mensaje", handleErrorMensaje);
        socketRef.current.disconnect();
        console.log("🔌 Socket desconectado");
      }
    };
  }, [token, usuarioId]);

  const joinChat = (otherUserId) => {
    console.log("🔄 Solicitando join-chat:", { userId: usuarioId, otherUserId });
    
    if (!socketRef.current) {
      console.error("❌ Socket ref no existe");
      setError("Conexión no disponible");
      return;
    }

    if (!socketRef.current.connected) {
      console.error("❌ Socket no conectado");
      setError("Esperando conexión...");
      return;
    }

    socketRef.current.emit("join-chat", {
      userId: usuarioId,
      otherUserId,
    });
    setError(null);
  };

  const sendMessage = (roomIdToSend, texto, emisorId) => {
    console.log("📤 Enviando mensaje:", { roomId: roomIdToSend, texto: texto.substring(0, 20) });
    
    if (!texto.trim() || !roomIdToSend) {
      console.warn("⚠️ Mensaje vacío o sin roomId");
      return;
    }

    if (!socketRef.current || !socketRef.current.connected) {
      console.error("❌ Socket desconectado");
      setError("Socket desconectado, reconectando...");
      return;
    }

    socketRef.current.emit("enviar-mensaje", {
      roomId: roomIdToSend,
      texto: texto.trim(),
      emisor: emisorId,
    });
  };

  return {
    roomId,
    mensajes,
    error,
    joinChat,
    sendMessage,
    socketRef
  };
}