import { useState, useEffect, useRef } from 'react';
import { Search, Send, Image as ImageIcon, Trash2, X, MessageCircle, User } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import storeAuth from '../context/storeAuth';
import { ToastContainer } from 'react-toastify';

const ChatPage = () => {
  const { socket, resetearContador, conversacionRestaurada } = useSocket();
  const token = storeAuth(state => state.token);
  const mensajesEndRef = useRef(null);
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

  // Scroll automático al final cuando llegan mensajes
const scrollToBottom = () => {
  const container = mensajesEndRef.current?.parentElement;
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
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

  // Recargar conversaciones cuando se restaura una
  useEffect(() => {
    if (conversacionRestaurada) {
      console.log('🔄 Conversación restaurada detectada, recargando...');
      fetchConversaciones();
    }
  }, [conversacionRestaurada]);

  // Escuchar eventos de Socket.IO
  useEffect(() => {
    if (!socket || !conversacionActiva) return;

    const conversacionId = conversacionActiva.conversacionId || conversacionActiva._id;

    // Unirse a la conversación
    socket.emit('join-chat', { conversacionId });

    const handleNewMessage = ({ mensaje: nuevoMensaje }) => {
      setMensajes(prev => {
        // Evitar duplicados
        if (prev.some(m => m._id === nuevoMensaje._id)) {
          return prev;
        }
        return [...prev, nuevoMensaje];
      });
    };

    const handleMensajeConfirmado = ({ mensajeId }) => {
      console.log(' Mensaje confirmado por servidor:', mensajeId);
    };

    const handleDeleteMessage = ({ mensajeId }) => {
      setMensajes(prev => prev.filter(m => m._id !== mensajeId));
    };

    const handleChatUpdated = () => {
      fetchConversaciones();
    };

    const handleConversacionRestaurada = () => {
      // Recargar conversaciones cuando se restaura un chat oculto
      console.log('🔄 Chat restaurado, recargando conversaciones...');
      fetchConversaciones();
    };

    const handleError = (error) => {
      alert(error);
    };

    // Escuchar eventos
    socket.on('message:new', handleNewMessage);
    socket.on('message:delete', handleDeleteMessage);
    socket.on('chat:updated', handleChatUpdated);
    socket.on('conversacion:restaurada', handleConversacionRestaurada);
    socket.on('error-mensaje', handleError);
    socket.on('mensaje:confirmado', handleMensajeConfirmado);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:delete', handleDeleteMessage);
      socket.off('chat:updated', handleChatUpdated);
      socket.off('conversacion:restaurada', handleConversacionRestaurada);
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
      return;
    }

    if (!socket) {
      alert('Error: No hay conexión con el servidor');
      return;
    }

    if (!socket.connected) {
      alert('Error: Socket desconectado');
      return;
    }

    if (!conversacionActiva) {
      console.error(' No hay conversación activa');
      return;
    }

    const conversacionId = conversacionActiva.conversacionId || conversacionActiva._id;

    socket.emit('enviar-mensaje', {
      conversacionId,
      contenido: mensaje.trim()
    });

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

        if (data.mensaje) {
          const convId = conversacionActiva.conversacionId || conversacionActiva._id;
          fetchMensajes(convId);
        }
      } else {
        const error = await response.json();
        console.error('Error del servidor:', error);
      }
    } catch (error) {
      console.error(' Error enviando imagen:', error);
    } finally {
      setCargando(false);
      e.target.value = '';
    }
  };

  const eliminarMensaje = async (mensajeId) => {
    if (!socket) return;
    
    // Confirmación antes de eliminar
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este mensaje?');
    if (!confirmar) return;
    
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
  <div className="flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100 mt-31 md:mt-11 border border-gray-200 rounded-xl shadow-lg overflow-hidden h-screen md:h-[90vh]">
      <ToastContainer/>
      {/* Panel lateral - Conversaciones */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col max-h-60 md:max-h-full">
        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Mensajes</h2>
          </div>

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
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Resultados de búsqueda */}
          {resultadosBusqueda.length > 0 && (
            <div className="mt-3 bg-white border border-gray-300 rounded-lg shadow-md max-h-60 overflow-y-auto">
              {resultadosBusqueda.map(usuario => (
                <div
                  key={usuario._id}
                  onClick={() => crearOAbrirConversacion(usuario._id)}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-full">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{usuario.nombre} {usuario.apellido}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{usuario.rol}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          {conversaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="bg-gray-100 p-4 rounded-full mb-3">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No tienes conversaciones</p>
              <p className="text-xs text-gray-400 mt-1">Busca un contacto para empezar</p>
            </div>
          ) : (
            conversaciones.map(conv => (
              <div
                key={conv.conversacionId}
                onClick={() => seleccionarConversacion(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition hover:bg-gray-50 ${conversacionActiva?.conversacionId === conv.conversacionId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-gradient-to-br from-gray-200 to-gray-300 p-1.5 rounded-full">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <p className="font-semibold text-gray-900 truncate">
                        {conv.otroMiembro?.nombre} {conv.otroMiembro?.apellido}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 truncate pl-7">
                      {conv.ultimoMensaje?.tipo === 'imagen'
                        ? '📷 Imagen'
                        : conv.ultimoMensaje?.contenido || 'Sin mensajes'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {conv.mensajesNoLeidos > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                        {conv.mensajesNoLeidos}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarConversacion(conv.conversacionId);
                      }}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área principal de chat */}
  <div className="flex-1 flex flex-col w-full min-h-0 relative" >
        {conversacionActiva ? (
          <>
            {/* Header del chat */}
            <div className="bg-white border-b border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-full">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {conversacionActiva.otroMiembro?.nombre} {conversacionActiva.otroMiembro?.apellido}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">{conversacionActiva.otroMiembro?.rol}</p>
                </div>
              </div>
            </div>

            {/* Área de mensajes */}
            <div 
              className="flex-1 overflow-y-scroll p-4 md:p-6 space-y-3 md:space-y-4 min-h-0 max-h-[calc(100vh-180px)] md:max-h-[calc(90vh-120px)]"
              style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', msOverflowStyle: 'auto', scrollbarWidth: 'thin' }}
            >
              {mensajes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="bg-white p-4 rounded-full mb-3">
                    <MessageCircle className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">No hay mensajes aún</p>
                  <p className="text-xs text-gray-400 mt-1">Envía un mensaje para comenzar</p>
                </div>
              ) : (
                mensajes.map(msg => {
                  const esMio = msg.emisor._id !== conversacionActiva.otroMiembro?._id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-sm relative group`}>
                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-sm ${esMio
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                            }`}
                        >
                          {msg.tipo === 'texto' ? (
                            <p className="text-sm leading-relaxed">{msg.contenido}</p>
                          ) : (
                            <img
                              src={msg.imagenUrl}
                              alt="Imagen"
                              onClick={() => setImagenAmpliada(msg.imagenUrl)}
                              className="max-w-[200px] max-h-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                            />
                          )}

                          <p className={`text-xs mt-1.5 ${esMio ? 'text-blue-100' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Botón eliminar */}
                        {esMio && (
                          <button
                            onClick={() => eliminarMensaje(msg._id)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={mensajesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="bg-white border-t border-gray-200 p-3 md:p-4 w-full sticky bottom-0 left-0 z-10">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={enviarImagen}
                    className="hidden"
                    disabled={cargando}
                  />
                  <div className={`p-2.5 rounded-lg transition ${cargando
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-blue-600 hover:bg-blue-50'
                    }`}>
                    <ImageIcon className="w-5 h-5" />
                  </div>
                </label>

                <input
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={cargando}
                />

                <button
                  onClick={enviarMensaje}
                  disabled={!mensaje.trim() || cargando}
                  className="bg-blue-600 text-white rounded-lg p-2.5 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-white p-6 rounded-full mb-4">
              <MessageCircle className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Selecciona una conversación</p>
            <p className="text-sm text-gray-400 mt-1">O busca un contacto para empezar a chatear</p>
          </div>
        )}
      </div>

      {/* Modal de imagen ampliada */}
      {imagenAmpliada && (
        <div 
          className="fixed inset-0 bg-black/50 bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setImagenAmpliada(null)}
        >
          <button
            onClick={() => setImagenAmpliada(null)}
            className="absolute top-4 right-4 bg-blue-500 bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition"
          >
            <X className="w-6 h-6 " />
          </button>
          <img
            src={imagenAmpliada}
            alt="Imagen ampliada"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ChatPage;