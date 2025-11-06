/**
 * Configuración de Socket.IO Context Provider
 * 
 * Este provider envuelve la app y proporciona acceso al socket en toda la aplicación
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import storeAuth from './storeAuth';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe usarse dentro de SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [contadorMensajes, setContadorMensajes] = useState(0);
  const token = storeAuth(state => state.token);

  useEffect(() => {
    if (!token) {
      console.log('⚠️ No hay token, socket no se conectará');
      return;
    }

    // Socket.IO se conecta a la raíz del servidor, no a /api
    const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    const URL = backendURL.replace('/api', ''); // Remover /api si existe

    console.log('🔌 Conectando socket a:', URL);

    // Crear instancia de socket
    const socketInstance = io(URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Eventos de conexión
    socketInstance.on('connect', () => {
      console.log('✅ Socket conectado:', socketInstance.id);
      setIsConnected(true);
      
      // Unirse a sala personal
      const userId = getUserIdFromToken(token);
      if (userId) {
        socketInstance.emit('join-personal-room', userId);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error.message);
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconectado después de ${attemptNumber} intentos`);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('❌ Falló la reconexión');
    });

    // Eventos del chat
    socketInstance.on('chat:updated', ({ mensajesNoLeidos }) => {
      console.log('📨 Chat actualizado, nuevos mensajes:', mensajesNoLeidos);
      setContadorMensajes(prev => prev + mensajesNoLeidos);
    });

    socketInstance.on('notificacion:nueva', () => {
      console.log('🔔 Nueva notificación');
      // Aquí puedes agregar lógica para notificaciones
    });

    setSocket(socketInstance);

    // Obtener contador inicial
    fetchContadorInicial(token);

    // Cleanup
    return () => {
      console.log('🔌 Desconectando socket...');
      socketInstance.disconnect();
    };
  }, [token]);

  const fetchContadorInicial = async (token) => {
    try {
      const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
      const response = await fetch(`${URL}/servicios/chat/contador-no-leidos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContadorMensajes(data.totalNoLeidos);
      }
    } catch (error) {
      console.error('Error obteniendo contador:', error);
    }
  };

  const resetearContador = () => {
    setContadorMensajes(0);
  };

  const value = {
    socket,
    isConnected,
    contadorMensajes,
    resetearContador
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Utilidad para obtener userId del token
function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
}

/**
 * Uso en App.jsx:
 * 
 * import { SocketProvider } from './context/SocketContext';
 * 
 * function App() {
 *   return (
 *     <SocketProvider>
 *       <Router>
 *         // ... tus rutas
 *       </Router>
 *     </SocketProvider>
 *   );
 * }
 * 
 * Uso en componentes:
 * 
 * import { useSocket } from '../context/SocketContext';
 * 
 * const MiComponente = () => {
 *   const { socket, isConnected, contadorMensajes } = useSocket();
 *   
 *   return (
 *     <div>
 *       {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
 *       <span>Mensajes: {contadorMensajes}</span>
 *     </div>
 *   );
 * };
 */
