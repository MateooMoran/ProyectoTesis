import React, { useState, useEffect } from 'react';
import { Star, Edit2, Filter } from 'lucide-react';
import { alert } from '../../utils/alerts';
import useFetch from '../../hooks/useFetch';
import storeAuth from '../../context/storeAuth';

const SeccionResenas = ({ productoId, onEstadisticas }) => {
  const { fetchDataBackend } = useFetch();
  const { token, rol } = storeAuth();

  const [resenas, setResenas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstrellas, setFiltroEstrellas] = useState(null);

  // Formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [puedeResenar, setPuedeResenar] = useState(false);
  const [miResena, setMiResena] = useState(null);
  const [formData, setFormData] = useState({ estrellas: 5, comentario: '' });
  const [enviando, setEnviando] = useState(false);

  const cargarResenas = async (estrellas = null) => {
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/resenas/producto/${productoId}${estrellas ? `?estrellas=${estrellas}` : ''}`;
      
      const data = await fetchDataBackend(url, { method: 'GET' });

      setResenas(data.resenas || []);
      const stats = {
        total: data.totalResenas,
        promedio: data.promedioEstrellas,
        distribucion: data.distribucion
      };

      setEstadisticas(stats);
      if (typeof onEstadisticas === "function") onEstadisticas(stats);

    } catch (error) {
      console.error("Error cargando reseñas:", error);
      setResenas([]);
      setEstadisticas(null);
      if (typeof onEstadisticas === "function") onEstadisticas(null);

    } finally {
      setLoading(false);
    }
  };

  const verificarPermisos = async () => {
    if (!token ) {
      setPuedeResenar(false);
      return;
    }

    try {
      const data = await fetchDataBackend(
        `${import.meta.env.VITE_BACKEND_URL}/estudiante/puede-resenar/${productoId}`,
        {
          method: 'GET',
          config: { headers: { Authorization: `Bearer ${token}` } }
        }
      );

      setPuedeResenar(data.puedeResenar);

      if (data.tieneResena && data.resena) {
        setMiResena(data.resena);
        setFormData({
          estrellas: data.resena.estrellas,
          comentario: data.resena.comentario
        });
      }

    } catch {
      setPuedeResenar(false);
    }
  };

  useEffect(() => {
    cargarResenas();
    verificarPermisos();
  }, [productoId, token, rol]);

  const enviarResena = async (e) => {
    e.preventDefault();

    if (!token) return alert({ icon: 'error', title: 'Debes iniciar sesión para reseñar' });
    if (formData.comentario.length > 250)
      return alert({ icon: 'error', title: 'El comentario no puede superar 250 caracteres' });

    setEnviando(true);

    try {
      await fetchDataBackend(
        `${import.meta.env.VITE_BACKEND_URL}/estudiante/resena`,
        {
          method: "POST",
          body: {
            productoId,
            estrellas: formData.estrellas,
            comentario: formData.comentario.trim()
          },
          config: { headers: { Authorization: `Bearer ${token}` } }
        }
      );
      setMostrarFormulario(false);
      cargarResenas(filtroEstrellas);
      verificarPermisos();

    } finally {
      setEnviando(false);
    }
  };

  const renderEstrellas = (cantidad, size = 'w-5 h-5') => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((estrella) => (
        <Star
          key={estrella}
          className={`${size} ${estrella <= cantidad ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const renderDistribucion = () => {
    if (!estadisticas?.distribucion) return null;

    return (
      <div className="space-y-2">
        {[5,4,3,2,1].map((num) => {
          const count = estadisticas.distribucion[num] || 0;
          const porcentaje = estadisticas.total > 0
            ? Math.round((count / estadisticas.total) * 100)
            : 0;

          return (
            <button
              key={num}
              onClick={() => {
                const nuevoFiltro = filtroEstrellas === num ? null : num;
                setFiltroEstrellas(nuevoFiltro);
                cargarResenas(nuevoFiltro);
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition ${
                filtroEstrellas === num ? 'bg-blue-50 border-2 border-blue-300' : ''
              }`}
            >
              <span className="text-sm font-medium text-gray-700 w-8">{num}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
            </button>
          );
        })}
      </div>
    );
  };
  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Reseñas del Producto</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Estadísticas */}
          <div className="lg:col-span-1 space-y-6">
            {/* Promedio General */}
            {estadisticas && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="text-5xl font-bold text-gray-800 mb-2">
                  {estadisticas.promedio.toFixed(1)}
                </div>
                {renderEstrellas(Math.round(estadisticas.promedio), 'w-6 h-6')}
                <p className="text-gray-600 mt-2">{estadisticas.total} reseñas</p>
              </div>
            )}

            {/* Distribución */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Distribución</h3>
                {filtroEstrellas && (
                  <button
                    onClick={() => {
                      setFiltroEstrellas(null);
                      cargarResenas();
                    }}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Filter className="w-4 h-4" />
                    Limpiar
                  </button>
                )}
              </div>
              {renderDistribucion()}
            </div>

            {/* Botón para reseñar */}
            {token && puedeResenar && (
              <button
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <Edit2 className="w-5 h-5" />
                {miResena ? 'Editar mi reseña' : 'Escribir reseña'}
              </button>
            )}
          </div>

          {/* Columna Derecha: Reseñas */}
          <div className="lg:col-span-2 space-y-4">
            {/* Formulario de reseña */}
            {mostrarFormulario && (
              <form onSubmit={enviarResena} className="bg-white rounded-2xl p-6 shadow-md border-2 border-blue-200">
                <h3 className="font-bold text-gray-800 mb-4">
                  {miResena ? 'Editar tu reseña' : 'Escribe tu reseña'}
                </h3>
                
                {/* Selector de estrellas */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Calificación
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData({ ...formData, estrellas: num })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            num <= formData.estrellas
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comentario */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Comentario (opcional)
                  </label>
                  <textarea
                    value={formData.comentario}
                    onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                    placeholder="Comparte tu experiencia con este producto..."
                    rows={4}
                    maxLength={250}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-sm text-gray-500 text-right mt-1">
                    {formData.comentario.length}/250 caracteres
                  </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={enviando}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {enviando ? 'Enviando...' : miResena ? 'Actualizar' : 'Publicar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Lista de reseñas */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 animate-pulse">Cargando reseñas...</p>
              </div>
            ) : resenas.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {filtroEstrellas 
                    ? `No hay reseñas con ${filtroEstrellas} estrellas`
                    : 'Este producto aún no tiene reseñas'}
                </p>
              </div>
            ) : (
              resenas.map((resena) => (
                <div key={resena._id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {resena.usuario?.nombre} {resena.usuario?.apellido}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(resena.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {renderEstrellas(resena.estrellas)}
                  </div>
                  
                  {resena.comentario && (
                    <p className="text-gray-700 leading-relaxed">{resena.comentario}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeccionResenas;