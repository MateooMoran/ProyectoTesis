import { useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import useFetch from "../../hooks/useFetch";
import { alert } from '../../utils/alerts';
import { MessageSquare, AlertCircle, Lightbulb, Clock, CheckCircle, Save, ChevronLeft, ChevronRight, Filter } from "lucide-react";

function GestionarQuejasSugerencias() {
  const { fetchDataBackend } = useFetch();
  const [quejas, setQuejas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [quejasPorPagina] = useState(3);

  useEffect(() => {
    const obtenerQuejas = async () => {
      setLoading(true);
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/admin/quejas-sugerencias`;
        const storedUser = JSON.parse(localStorage.getItem("auth-token"));
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedUser?.state?.token || ""}`,
        };
        const response = await fetchDataBackend(url, {
          method: "GET",
          config: { headers },
        });
        setQuejas(response);
        setCurrentPage(1);
      } catch (error) {
      console.error("Error al obtener quejas/sugerencias", error);
      alert({ icon: 'error', title: 'Error al cargar quejas' });
      } finally {
        setLoading(false);
      }
    };
    obtenerQuejas();
  }, []);

  const responderQueja = async (id, respuesta) => {
    if (!respuesta || respuesta.trim() === "") {
      return;
    }
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/admin/quejas-sugerencias/${id}`;
      const storedUser = JSON.parse(localStorage.getItem("auth-token"));
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedUser?.state?.token || ""}`,
      };
      const body = { respuesta };
      await fetchDataBackend(url, {
        method: "PUT",
        body,
        config: { headers },
      });
      // Actualizar estado local: marcar como resuelto, guardar la respuesta y fecha de resolución
      const fechaNow = new Date().toISOString();
      setQuejas((prev) => prev.map((q) => q._id === id ? { ...q, respuesta, estado: 'resuelto', fechaResuelto: fechaNow } : q));
      alert({ icon: 'success', title: 'Respuesta enviada', text: 'La queja/sugerencia fue marcada como resuelta.' });
    } catch (error) {
      console.error("Error al responder la queja/sugerencia", error);
      alert({ icon: 'error', title: 'Error', text: 'No se pudo guardar la respuesta.' });
    }
  };

  const handleRespuestaChange = (id, value) => {
    setQuejas((prev) =>
      prev.map((q) =>
        q._id === id && q.estado !== 'resuelto'
          ? { ...q, respuesta: value }
          : q
      )
    );
  };

  const getQuejasFiltradas = (estadoTab) => {
    const filtradas = quejas.filter(q =>
      (estadoTab === 'todos' || q.estado === estadoTab) &&
      (filtroTipo === 'todos' || q.tipo === filtroTipo)
    );

    // Si estamos mostrando las resueltas, ordenar por fecha de resolución descendente
    if (estadoTab === 'resuelto') {
      return filtradas.sort((a, b) => {
        const dateA = new Date(a.fechaResuelto || a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.fechaResuelto || b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    }

    return filtradas;
  };

  const totalQuejas = quejas.filter(q => q.tipo === 'queja').length;
  const totalSugerencias = quejas.filter(q => q.tipo === 'sugerencia').length;
  const totalPendientes = quejas.filter(q => q.estado === 'pendiente').length;
  const totalResueltos = quejas.filter(q => q.estado === 'resuelto').length;

  const getQuejasActuales = (estadoTab) => {
    const filtradas = getQuejasFiltradas(estadoTab);
    const indexUltima = currentPage * quejasPorPagina;
    const indexPrimera = indexUltima - quejasPorPagina;
    return filtradas.slice(indexPrimera, indexUltima);
  };

  const getTotalPaginas = (estadoTab) => {
    const filtradas = getQuejasFiltradas(estadoTab);
    return Math.ceil(filtradas.length / quejasPorPagina);
  };

  const handlePageChange = (nuevaPagina, estadoTab) => {
    if (nuevaPagina >= 1 && nuevaPagina <= getTotalPaginas(estadoTab)) {
      setCurrentPage(nuevaPagina);
    }
  };

  const renderQuejasTab = (estadoTab, titulo, icon) => {
    const quejasActuales = getQuejasActuales(estadoTab);
    const totalPaginas = getTotalPaginas(estadoTab);
    const totalItems = getQuejasFiltradas(estadoTab).length;

    return (
      <TabPanel>
        <div className="mt-4 lg:mt-8 mb-6 lg:mb-10 space-y-4 lg:space-y-6">
          {totalItems === 0 ? (
            <p className="text-center text-gray-700 text-base lg:text-xl py-8 lg:py-12">
              No hay {titulo.toLowerCase()} registradas
            </p>
          ) : (
            <>
              {/* FILTROS Y INFO */}
              <div className="p-3 lg:p-6 border-b-2 border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-6 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
                    <span className="text-sm lg:text-lg font-semibold text-blue-800 flex items-center gap-1.5 lg:gap-2">
                      {icon} Total: {totalItems}
                    </span>
                    <span className="px-2 lg:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs lg:text-sm">
                      Pág {currentPage} de {totalPaginas}
                    </span>
                  </div>

                  <div className="flex gap-2 lg:gap-4 items-center w-full sm:w-auto">
                    <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 flex-shrink-0" />
                    <select
                      value={filtroTipo}
                      onChange={(e) => {
                        setFiltroTipo(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="flex-1 sm:flex-none px-2 lg:px-4 py-1.5 lg:py-2 border border-gray-300 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm font-semibold"
                    >
                      <option value="todos">Todos los tipos</option>
                      <option value="queja">Quejas</option>
                      <option value="sugerencia">Sugerencias</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* LISTADO DE QUEJAS */}
              <div className="space-y-3 lg:space-y-4">
                {quejasActuales.map((q) => (
                  <div
                    key={q._id}
                    className="bg-white rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 p-4 lg:p-6"
                  >
                    <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-6">
                      {/* Usuario y tipo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-base lg:text-lg font-bold text-gray-800">
                            {q.usuario?.nombre} {q.usuario?.apellido}
                          </h3>
                          {q.tipo === "queja" ? (
                            <span className="inline-flex items-center gap-1 px-2 lg:px-3 py-1 text-orange-800 bg-orange-100 rounded-full text-xs">
                              <AlertCircle className="w-3 h-3" /> Queja
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 lg:px-3 py-1 text-blue-600 bg-blue-200 rounded-full text-xs">
                              <Lightbulb className="w-3 h-3" /> Sugerencia
                            </span>
                          )}
                        </div>

                        {/* Información de la queja */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-4 text-xs lg:text-sm text-gray-600 mb-3">
                          <p><span className="font-semibold">ID:</span> <span className="truncate text-gray-500">{q._id}</span></p>
                          <p><span className="font-semibold">Tipo:</span> {q.tipo === "queja" ? "Queja" : "Sugerencia"}</p>
                        </div>

                        {/* Mensaje */}
                        <div className="mb-3">
                          <p className="text-xs lg:text-sm text-gray-600 font-semibold mb-1">Mensaje:</p>
                          <p className="text-xs lg:text-sm text-gray-700 line-clamp-3">{q.mensaje}</p>
                        </div>

                        {/* Estado */}
                        <div className="flex items-center gap-2">
                          {q.estado === "resuelto" ? (
                            <span className="inline-flex items-center gap-1 px-2 lg:px-3 py-1 text-green-800 bg-green-100 rounded-full text-xs">
                              <CheckCircle className="w-3 h-3" /> Resuelto
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 lg:px-3 py-1 text-yellow-800 bg-yellow-100 rounded-full text-xs">
                              <Clock className="w-3 h-3" /> Pendiente
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Respuesta y botón */}
                      <div className="w-full lg:w-96 flex flex-col">
                        <label className="text-xs lg:text-sm font-semibold text-gray-700 mb-2">Respuesta:</label>
                        <textarea
                          value={q.respuesta || ""}
                          onChange={(e) => handleRespuestaChange(q._id, e.target.value)}
                          disabled={q.estado === 'resuelto'} // NO EDITABLE SI RESUELTO
                          className={`w-full border ${q.estado === 'resuelto' ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-gray-300'} rounded-lg lg:rounded-xl px-3 py-2 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] lg:min-h-[100px] mb-2`}
                          placeholder={q.estado === 'resuelto' ? "Esta respuesta ya fue enviada" : "Escribe una respuesta..."}
                          maxLength={250}
                        />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">{(q.respuesta?.length || 0)}/250</span>
                          <button
                            disabled={q.estado === 'resuelto' || !q.respuesta?.trim()} // NO GUARDAR SI RESUELTO
                            onClick={() => responderQueja(q._id, q.respuesta || "")}
                            className={`flex items-center gap-1 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm font-semibold transition-all ${q.estado === 'resuelto' || !q.respuesta?.trim()
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-900 to-blue-900 text-white hover:from-blue-800 hover:to-blue-900 transform hover:scale-105"
                              }`}
                          >
                            <Save className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">
                              {q.estado === 'resuelto' ? "Resuelto" : "Guardar"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINADOR */}
              {totalPaginas > 1 && (
                <div className="p-3 lg:p-6 border-t-2 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-4">
                  <div className="text-xs lg:text-sm text-gray-600 text-center sm:text-left">
                    Mostrando {((currentPage - 1) * quejasPorPagina) + 1} - {Math.min(currentPage * quejasPorPagina, totalItems)} de {totalItems}
                  </div>

                  <div className="flex items-center gap-1 lg:gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => handlePageChange(currentPage - 1, estadoTab)}
                      disabled={currentPage === 1}
                      className="px-2 lg:px-4 py-1.5 lg:py-2 bg-blue-800 text-white rounded-lg lg:rounded-xl disabled:bg-gray-400 font-semibold text-xs lg:text-base hover:bg-blue-700 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    <div className="flex gap-0.5 lg:gap-1">
                      {[...Array(totalPaginas)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1, estadoTab)}
                          className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl font-semibold text-xs lg:text-base transition-all ${currentPage === i + 1 ? 'bg-blue-800 text-white shadow-lg scale-110' : 'bg-gray-200 hover:bg-blue-100'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1, estadoTab)}
                      disabled={currentPage === totalPaginas}
                      className="px-2 lg:px-4 py-1.5 lg:py-2 bg-blue-800 text-white rounded-lg lg:rounded-xl disabled:bg-gray-400 font-semibold text-xs lg:text-base hover:bg-blue-700 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">Siguiente</span>
                      <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </TabPanel>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 text-sm lg:text-base">Cargando quejas...</p>
        </div>
      </div>
    );

  return (
    <>
      <div className="mt-8 md:mt-8"></div>

      <main className="py-6 lg:py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-3 lg:px-4">
          {/* Header */}
          <div className="text-center mb-6 lg:mb-10">
            <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2 lg:mb-3">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-800">Gestión de Quejas y Sugerencias</h1>
            </div>
            <p className="text-xs lg:text-base text-gray-600">Responde y gestiona todas las quejas y sugerencias de los usuarios</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-3 lg:p-6 border border-gray-200">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="bg-blue-100 p-2 lg:p-3 rounded-lg flex-shrink-0">
                  <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-gray-600">Total</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-800">{quejas.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-3 lg:p-6 border border-gray-200">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="bg-yellow-100 p-2 lg:p-3 rounded-lg flex-shrink-0">
                  <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-800">{totalPendientes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-3 lg:p-6 border border-gray-200">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="bg-green-100 p-2 lg:p-3 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-gray-600">Resueltos</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-800">{totalResueltos}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs container */}
          <div className="bg-white rounded-lg lg:rounded-2xl shadow-xl border border-gray-200 p-3 lg:p-6">
            <Tabs onSelect={() => setCurrentPage(1)}>
              <TabList className="flex border-b-2 border-gray-200 mb-4 lg:mb-6 gap-1 lg:gap-2 overflow-x-auto">
                <Tab className="flex-1 min-w-fit py-2 lg:py-3 px-2 lg:px-4 text-center font-semibold text-xs lg:text-sm text-gray-600 cursor-pointer hover:text-blue-600 hover:bg-blue-50 rounded-t-lg transition-colors whitespace-nowrap focus:outline-none focus:ring-0">
                  <div className="flex items-center justify-center gap-1 lg:gap-2">
                    <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span>Pendientes</span>
                  </div>
                </Tab>
                <Tab className="flex-1 min-w-fit py-2 lg:py-3 px-2 lg:px-4 text-center font-semibold text-xs lg:text-sm text-gray-600 cursor-pointer hover:text-green-600 hover:bg-green-50 rounded-t-lg transition-colors whitespace-nowrap focus:outline-none focus:ring-0">
                  <div className="flex items-center justify-center gap-1 lg:gap-2">
                    <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span>Resueltos</span>
                  </div>
                </Tab>
              </TabList>

              {renderQuejasTab('pendiente', 'Pendientes', <Clock className="w-4 h-4 lg:w-5 lg:h-5" />)}
              {renderQuejasTab('resuelto', 'Resueltos', <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />)}
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
}

export default GestionarQuejasSugerencias;