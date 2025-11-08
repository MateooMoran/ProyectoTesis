import { useState, useEffect, useRef } from 'react';
import { Search, Send, Image as ImageIcon, Trash2, X, MessageCircle, User, ArrowLeft } from 'lucide-react';
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
  const [imagenAEnviar, setImagenAEnviar] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [usuariosConectados, setUsuariosConectados] = useState(new Set());
  const [conversacionesConMensajesNuevos, setConversacionesConMensajesNuevos] = useState(new Set());
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
      fetchConversaciones();
    }
  }, [conversacionRestaurada]);

  // Escuchar eventos de usuarios conectados
  useEffect(() => {
    if (!socket) return;

    const handleUsuariosConectados = (usuarios) => {
      setUsuariosConectados(new Set(usuarios));
    };

    const handleUsuarioConectado = ({ usuarioId }) => {
      setUsuariosConectados(prev => new Set([...prev, usuarioId]));
    };

    const handleUsuarioDesconectado = ({ usuarioId }) => {
      setUsuariosConectados(prev => {
        const nuevo = new Set(prev);
        nuevo.delete(usuarioId);
        return nuevo;
      });
    };

    // Solicitar lista de usuarios conectados al cargar
    socket.emit('obtener-usuarios-conectados');

    socket.on('usuarios-conectados', handleUsuariosConectados);
    socket.on('usuario-conectado', handleUsuarioConectado);
    socket.on('usuario-desconectado', handleUsuarioDesconectado);

    return () => {
      socket.off('usuarios-conectados', handleUsuariosConectados);
      socket.off('usuario-conectado', handleUsuarioConectado);
      socket.off('usuario-desconectado', handleUsuarioDesconectado);
    };
  }, [socket]);

  // Escuchar actualizaciones globales de conversaciones
  useEffect(() => {
    if (!socket) return;

    const handleChatUpdatedGlobal = ({ conversacionId }) => {
      console.log('Actualizando conversacion global:', conversacionId);
      fetchConversaciones();
      
      const conversacionActivaId = conversacionActiva?.conversacionId || conversacionActiva?._id;
      
      // Si el mensaje es de la conversacion activa, marcarlo como leido automaticamente
      if (conversacionActivaId === conversacionId) {
        marcarComoLeida(conversacionId);
      } else {
        // Marcar como nueva si no es la activa
        setConversacionesConMensajesNuevos(prev => new Set([...prev, conversacionId]));
      }
    };

    const handleConversacionRestauradaGlobal = ({ conversacionId }) => {
      console.log('Conversacion restaurada:', conversacionId);
      fetchConversaciones();
    };

    socket.on('chat:updated', handleChatUpdatedGlobal);
    socket.on('conversacion:restaurada', handleConversacionRestauradaGlobal);

    return () => {
      socket.off('chat:updated', handleChatUpdatedGlobal);
      socket.off('conversacion:restaurada', handleConversacionRestauradaGlobal);
    };
  }, [socket, conversacionActiva]);

  // Escuchar eventos de Socket.IO para conversacion activa
  useEffect(() => {
    if (!socket || !conversacionActiva) return;

    const conversacionId = conversacionActiva.conversacionId || conversacionActiva._id;
    console.log("Uniendo a conversacion:",conversacionId)

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
      console.log('Mensaje confirmado por servidor:', mensajeId);
    };

    const handleDeleteMessage = ({ mensajeId }) => {
      setMensajes(prev => prev.filter(m => m._id !== mensajeId));
    };

    const handleError = (error) => {
      alert(error);
    };

    // Escuchar eventos
    socket.on('message:new', handleNewMessage);
    socket.on('message:delete', handleDeleteMessage);
    socket.on('error-mensaje', handleError);
    socket.on('mensaje:confirmado', handleMensajeConfirmado);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:delete', handleDeleteMessage);
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

        // Buscar el usuario seleccionado en los resultados de búsqueda
        const usuarioSeleccionado = resultadosBusqueda.find(u => u._id === otroUsuarioId);

        const convNormalizada = {
          ...conversacion,
          conversacionId: conversacion._id || conversacion.conversacionId,
          otroMiembro: usuarioSeleccionado
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
    // Remover del set de mensajes nuevos
    setConversacionesConMensajesNuevos(prev => {
      const nuevo = new Set(prev);
      nuevo.delete(conversacion.conversacionId);
      return nuevo;
    });
    
    setConversacionActiva(conversacion);
    fetchMensajes(conversacion.conversacionId);

    marcarComoLeida(conversacion.conversacionId);
  };

  const marcarComoLeida = async (conversacionId) => {
    try {
      await fetch(`${API_URL}/servicios/chat/conversacion/${conversacionId}/leer`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      fetchConversaciones();
      resetearContador();
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const enviarMensaje = () => {
    if (!mensaje.trim() || !socket || !socket.connected || !conversacionActiva) {
      return;
    }

    const conversacionId = conversacionActiva.conversacionId || conversacionActiva._id;

    socket.emit('enviar-mensaje', {
      conversacionId,
      contenido: mensaje.trim()
    });

    setMensaje('');
  };

  // Cuando el usuario selecciona una imagen, previsualizarla
  const handleSeleccionarImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagenAEnviar(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImg(reader.result);
    reader.readAsDataURL(file);
  };

  // Enviar la imagen seleccionada
  const enviarImagen = async () => {
    if (!imagenAEnviar || !conversacionActiva) return;
    const conversacionId = conversacionActiva.conversacionId || conversacionActiva._id;
    const formData = new FormData();
    formData.append('imagen', imagenAEnviar);
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
          fetchMensajes(conversacionId);
        }
        setImagenAEnviar(null);
        setPreviewImg(null);
      } else {
        const error = await response.json();
        console.error('Error del servidor:', error);
      }
    } catch (error) {
      console.error('Error enviando imagen:', error);
    } finally {
      setCargando(false);
    }
  };

  const eliminarMensaje = async (mensajeId) => {
    if (!socket) return;

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
    <div className="flex h-[82.5vh] sm:h-[97vh] bg-white mt-18 sm:mt-0">
      <ToastContainer />

      {/* Sidebar de conversaciones - Oculto en móvil cuando hay chat activo */}
      <div className={`${conversacionActiva ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r border-gray-200 mt-18 sm:mt-10`}>
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-200 bg-white">
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
              {resultadosBusqueda.map(usuario => {
                const estaConectado = usuariosConectados.has(usuario._id);

                return (
                  <div
                    key={usuario._id}
                    onClick={() => crearOAbrirConversacion(usuario._id)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-full">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${estaConectado ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white`}></div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{usuario?.nombre } {usuario?.apellido}</p>
                        <p className="text-xs text-gray-500 capitalize mt-0.5">{usuario?.rol}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{usuario?.email}</p>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto  ">
          {conversaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="bg-gray-100 p-4 rounded-full mb-3">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No tienes conversaciones</p>
              <p className="text-xs text-gray-400 mt-1">Busca un contacto para empezar</p>
            </div>
          ) : (
            conversaciones.map(conv => {
              const estaConectado = usuariosConectados.has(conv.otroMiembro?._id);
              const tieneNuevosMensajes = conversacionesConMensajesNuevos.has(conv.conversacionId);

              return (
                <div
                  key={conv.conversacionId}
                  onClick={() => seleccionarConversacion(conv)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition hover:bg-gray-50 ${conversacionActiva?.conversacionId === conv.conversacionId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="relative">
                          <div className="bg-gradient-to-br from-gray-200 to-gray-300 p-1.5 rounded-full">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${estaConectado ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white`}></div>
                        </div>
                        <p className={`truncate ${tieneNuevosMensajes ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>
                          {conv.otroMiembro?.nombre} {conv.otroMiembro?.apellido}
                        </p>
                      </div>
                      <p className={`text-sm truncate pl-7 ${tieneNuevosMensajes ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                        {conv.ultimoMensaje?.tipo === 'imagen'
                          ? '📷 Imagen'
                          : conv.ultimoMensaje?.contenido || 'Sin mensajes'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {tieneNuevosMensajes && (
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                      )}
                      
                      {conv.mensajesNoLeidos > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
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
              );
            })
          )}
        </div>
      </div>

      {/* Área de chat - Vista completa en móvil */}
      <div className={`${conversacionActiva ? 'flex' : 'hidden md:flex'} flex-col flex-1 mt-16 sm:mt-10 `}>
        {conversacionActiva ? (
          <>
            {/* Header del chat */}
            <div className=" border-b border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConversacionActiva(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full -ml-2"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-full">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 ${usuariosConectados.has(conversacionActiva.otroMiembro?._id) ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white`}></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {conversacionActiva.otroMiembro?.nombre} {conversacionActiva.otroMiembro?.apellido}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 capitalize">{conversacionActiva.otroMiembro?.rol}</p>
                      <span className="text-xs text-gray-400 ml-2">
                        {conversacionActiva.otroMiembro?.email || 'no correo'}
                      </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Área de mensajes con previsualización */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 relative" style={{ WebkitOverflowScrolling: 'touch' }}>
              
              {/* Mensajes */}
              <div className="space-y-3 md:space-y-4">
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
                        <div className="max-w-sm relative group">
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
            </div>

            {/* Previsualización de imagen */}
            {previewImg && (
              <div className="border-t border-gray-200 p-4">
                <div className="w-full md:w-2/3 max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
                  <div className="relative">
                    <img
                      src={previewImg}
                      alt="Previsualización"
                      className="w-full max-h-60 object-contain rounded-xl border border-gray-200 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagenAEnviar(null);
                        setPreviewImg(null);
                      }}
                      className="absolute top-2 right-2 bg-white hover:bg-gray-100 text-gray-700 rounded-full p-1.5 shadow-lg transition"
                      title="Cerrar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={enviarImagen}
                      disabled={cargando}
                      className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImagenAEnviar(null);
                        setPreviewImg(null);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-200 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Input de mensaje */}
            <div className="bg-white border-t border-gray-200 p-3 md:p-4">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSeleccionarImagen}
                    className="hidden"
                    disabled={cargando}
                  />
                  <div
                    className={`p-2.5 rounded-lg transition ${cargando
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-blue-600 hover:bg-blue-50"
                      }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </div>
                </label>

                <input
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && enviarMensaje()}
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
          className="fixed inset-0 bg-black/40 bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setImagenAmpliada(null)}
        >
          <button
            onClick={() => setImagenAmpliada(null)}
            className="absolute top-4 right-4 bg-blue-500 bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition"
          >
            <X className="w-6 h-6" />
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