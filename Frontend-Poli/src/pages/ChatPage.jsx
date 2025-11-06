import { useState, useEffect, useRef } from 'react';
import { Search, Send, Image as ImageIcon, Trash2, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import storeAuth from '../context/storeAuth';

const ChatPage = () => {
  const { socket, resetearContador } = useSocket();
  const token = storeAuth(state => state.token);
  const mensajesEndRef = useRef(null);
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [cargando, setCargando] = useState(false);
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

  // Scroll automático al final cuando llegan mensajes
  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  // Cargar conversaciones
  useEffect(() => {
    if (token) {
      fetchConversaciones();
    }
  }, [token]);

  // Escuchar eventos de Socket.IO
  useEffect(() => {
    if (!socket || !conversacionActiva) return;

    const conversacionId = conversacionActiva.conversacionId || conversacionActiva._id;
    console.log('🔗 Uniéndose a conversación:', conversacionId);

    // Unirse a la conversación
    socket.emit('join-chat', { conversacionId });

    const handleNewMessage = ({ mensaje: nuevoMensaje }) => {
      console.log('📨 Nuevo mensaje recibido:', nuevoMensaje);
      console.log('📊 Mensajes actuales:', mensajes.length);
      
      setMensajes(prev => {
        // Evitar duplicados
        if (prev.some(m => m._id === nuevoMensaje._id)) {
          console.log('⚠️ Mensaje duplicado, ignorando');
          return prev;
        }
        console.log('✅ Agregando mensaje nuevo');
        return [...prev, nuevoMensaje];
      });
    };

    const handleMensajeConfirmado = ({ mensajeId }) => {
      console.log('✅ Mensaje confirmado por servidor:', mensajeId);
    };

    const handleDeleteMessage = ({ mensajeId }) => {
      console.log('🗑️ Mensaje eliminado:', mensajeId);
      setMensajes(prev => prev.filter(m => m._id !== mensajeId));
    };

    const handleChatUpdated = () => {
      console.log('🔄 Chat actualizado');
      fetchConversaciones();
    };

    const handleError = (error) => {
      console.error('❌ Error de socket:', error);
      alert(error);
    };

    // Escuchar eventos
    socket.on('message:new', handleNewMessage);
    socket.on('message:delete', handleDeleteMessage);
    socket.on('chat:updated', handleChatUpdated);
    socket.on('error-mensaje', handleError);
    socket.on('mensaje:confirmado', handleMensajeConfirmado);

    console.log('👂 Listeners de socket registrados para conversación:', conversacionId);

    return () => {
      console.log('🔇 Removiendo listeners de socket');
      socket.off('message:new', handleNewMessage);
      socket.off('message:delete', handleDeleteMessage);
      socket.off('chat:updated', handleChatUpdated);
      socket.off('error-mensaje', handleError);
      socket.off('mensaje:confirmado', handleMensajeConfirmado);
    };
  }, [socket, conversacionActiva]);

  const fetchConversaciones = async () => {
    try {
      const response = await fetch(`${API_URL}/servicios/chat/conversaciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversaciones(data);
      }
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    }
  };

  const fetchMensajes = async (conversacionId) => {
    try {
      const response = await fetch(`${API_URL}/servicios/chat/mensajes/${conversacionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMensajes(data.mensajes);
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const buscarContactos = async (nombre) => {
    if (!nombre.trim()) {
      setResultadosBusqueda([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/servicios/chat/buscar?nombre=${encodeURIComponent(nombre)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setResultadosBusqueda(data);
      }
    } catch (error) {
      console.error('Error buscando contactos:', error);
    }
  };

  const crearOAbrirConversacion = async (otroUsuarioId) => {
    try {
      const response = await fetch(`${API_URL}/servicios/chat/conversacion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otroUsuarioId })
      });
      
      if (response.ok) {
        const conversacion = await response.json();
        console.log('📂 Conversación creada/abierta:', conversacion);
        
        // Normalizar el ID de conversación
        const convNormalizada = {
          ...conversacion,
          conversacionId: conversacion._id || conversacion.conversacionId
        };
        
        setConversacionActiva(convNormalizada);
        fetchMensajes(convNormalizada.conversacionId);
        setBusqueda('');
        setResultadosBusqueda([]);
        fetchConversaciones();
      }
    } catch (error) {
      console.error('Error creando conversación:', error);
    }
  };

  const seleccionarConversacion = async (conversacion) => {
    setConversacionActiva(conversacion);
    fetchMensajes(conversacion.conversacionId);
    
    // Marcar como leída
    try {
      await fetch(`${API_URL}/servicios/chat/conversacion/${conversacion.conversacionId}/leer`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Actualizar lista de conversaciones
      fetchConversaciones();
      resetearContador();
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const enviarMensaje = () => {
    if (!mensaje.trim()) {
      console.log('❌ Mensaje vacío');
      return;
    }
    
    if (!socket) {
      console.error('❌ Socket no está disponible');
      alert('Error: No hay conexión con el servidor');
      return;
    }
    
    if (!socket.connected) {
      console.error('❌ Socket no está conectado');
      alert('Error: Socket desconectado');
      return;
    }
    
    if (!conversacionActiva) {
      console.error('❌ No hay conversación activa');
      return;
    }

    const conversacionId = conversacionActiva.conversacionId || conversacionActiva._id;
    
    console.log('📤 Enviando mensaje:', {
      conversacionId,
      contenido: mensaje.trim(),
      socketId: socket.id,
      connected: socket.connected
    });
    
    socket.emit('enviar-mensaje', {
      conversacionId,
      contenido: mensaje.trim()
    });

    console.log('✅ Evento emit ejecutado');
    setMensaje('');
  };

  const enviarImagen = async (e) => {
    const file = e.target.files[0];
    if (!file || !conversacionActiva) return;

    const conversacionId = conversacionActiva.conversacionId || conversacionActiva._id;

    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('conversacionId', conversacionId);

    try {
      setCargando(true);
      const response = await fetch(`${API_URL}/servicios/chat/mensaje/imagen`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Imagen enviada correctamente:', data);
        
        // La imagen llegará por socket, pero refrescar mensajes por seguridad
        if (data.mensaje) {
          const convId = conversacionActiva.conversacionId || conversacionActiva._id;
          fetchMensajes(convId);
        }
      } else {
        const error = await response.json();
        console.error('❌ Error del servidor:', error);
      }
    } catch (error) {
      console.error('❌ Error enviando imagen:', error);
    } finally {
      setCargando(false);
      // Limpiar input
      e.target.value = '';
    }
  };

  const eliminarMensaje = async (mensajeId) => {
    if (!socket) return;

    socket.emit('eliminar-mensaje', { mensajeId });
  };

  const eliminarConversacion = async (conversacionId) => {
    try {
      await fetch(`${API_URL}/servicios/chat/conversacion/${conversacionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setConversaciones(prev => prev.filter(c => c.conversacionId !== conversacionId));
      
      if (conversacionActiva?.conversacionId === conversacionId) {
        setConversacionActiva(null);
        setMensajes([]);
      }
    } catch (error) {
      console.error('Error eliminando conversación:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Lista de conversaciones */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Mensajes</h2>
          
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar contactos..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                buscarContactos(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Resultados de búsqueda */}
          {resultadosBusqueda.length > 0 && (
            <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {resultadosBusqueda.map(usuario => (
                <div
                  key={usuario._id}
                  onClick={() => crearOAbrirConversacion(usuario._id)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <p className="font-medium">{usuario.nombre} {usuario.apellido}</p>
                  <p className="text-sm text-gray-500 capitalize">{usuario.rol}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          {conversaciones.map(conv => (
            <div
              key={conv.conversacionId}
              onClick={() => seleccionarConversacion(conv)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                conversacionActiva?.conversacionId === conv.conversacionId ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">
                    {conv.otroMiembro?.nombre} {conv.otroMiembro?.apellido}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.ultimoMensaje?.tipo === 'imagen' 
                      ? '📷 Imagen' 
                      : conv.ultimoMensaje?.contenido || 'Sin mensajes'}
                  </p>
                </div>
                
                <div className="flex flex-col items-end">
                  {conv.mensajesNoLeidos > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {conv.mensajesNoLeidos}
                    </span>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarConversacion(conv.conversacionId);
                    }}
                    className="mt-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {conversacionActiva ? (
          <>
            {/* Header del chat */}
            <div className="p-4 bg-white border-b">
              <h3 className="font-bold text-lg">
                {conversacionActiva.otroMiembro?.nombre} {conversacionActiva.otroMiembro?.apellido}
              </h3>
              <p className="text-sm text-gray-500 capitalize">{conversacionActiva.otroMiembro?.rol}</p>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mensajes.map(msg => {
                // Si el emisor NO es el otro miembro, entonces soy yo
                const esMio = msg.emisor._id !== conversacionActiva.otroMiembro?._id;
                
                return (
                  <div
                    key={msg._id}
                    className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md relative group`}>
                      <div
                        className={`p-3 rounded-lg ${
                          esMio
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {msg.tipo === 'texto' ? (
                          <p>{msg.contenido}</p>
                        ) : (
                          <img
                            src={msg.imagenUrl}
                            alt="Imagen del chat"
                            className="max-w-full rounded"
                          />
                        )}
                        
                        <p className={`text-xs mt-1 ${esMio ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {/* Botón eliminar (solo para mensajes propios) */}
                      {esMio && (
                        <button
                          onClick={() => eliminarMensaje(msg._id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Referencia para scroll automático */}
              <div ref={mensajesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={enviarImagen}
                    className="hidden"
                    disabled={cargando}
                  />
                  <ImageIcon className={`w-6 h-6 ${cargando ? 'text-gray-400' : 'text-blue-500 hover:text-blue-700'}`} />
                </label>

                <input
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={cargando}
                />

                <button
                  onClick={enviarMensaje}
                  disabled={!mensaje.trim() || cargando}
                  className="bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Selecciona una conversación o busca un contacto para empezar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
