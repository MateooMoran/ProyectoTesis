import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { io } from 'socket.io-client';

const useChat = () => {
  const [socket, setSocket] = useState(null);
  const [contadorMensajesNoLeidos, setContadorMensajesNoLeidos] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token'); 
    
    if (!token) return;

    // Conectar a Socket.IO
    const socketInstance = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
      auth: { token }
    });

    socketInstance.on('connect', () => {
      console.log('✅ Conectado al chat');
    });

    // Escuchar actualizaciones de chat
    socketInstance.on('chat:updated', () => {
      setContadorMensajesNoLeidos(prev => prev + 1);
      
    });

    // Escuchar nuevas notificaciones
    socketInstance.on('notificacion:nueva', () => {
      setContadorMensajesNoLeidos(prev => prev + 1);
    });

    socketInstance.on('disconnect', () => {
      console.log(' Desconectado del chat');
    });

    setSocket(socketInstance);

    fetchContadorInicial();

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const fetchContadorInicial = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/servicios/chat/contador-no-leidos`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setContadorMensajesNoLeidos(data.totalNoLeidos);
      }
    } catch (error) {
      console.error('Error obteniendo contador:', error);
    }
  };

  const resetearContador = () => {
    setContadorMensajesNoLeidos(0);
  };

  return {
    socket,
    contadorMensajesNoLeidos,
    resetearContador
  };
};

export default useChat;
