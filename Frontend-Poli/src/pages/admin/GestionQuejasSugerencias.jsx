import { useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import useFetch from "../../hooks/useFetch";
import { ToastContainer, toast } from "react-toastify";
import { MessageSquare, AlertCircle, Lightbulb, Clock, CheckCircle, Save, ChevronLeft, ChevronRight, Filter } from "lucide-react";

function GestionarQuejasSugerencias() {
  const { fetchDataBackend } = useFetch();
  const [quejas, setQuejas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [quejasPorPagina] = useState(8);

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
        toast.error("Error al cargar quejas");
      } finally {
        setLoading(false);
      }
    };
    obtenerQuejas();
  }, []);

  const responderQueja = async (id, respuesta) => {
    if (!respuesta || respuesta.trim() === "") {
      toast.error("La respuesta no puede estar vacía");
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
      toast.success("¡Respuesta guardada correctamente!");
    } catch (error) {
      console.error("Error al responder la queja/sugerencia", error);
      toast.error("Error al guardar la respuesta");
    }
  };

  const handleRespuestaChange = (id, value) => {
    setQuejas((prev) =>
      prev.map((q) => (q._id === id ? { ...q, respuesta: value } : q))
    );
  };

  const getQuejasFiltradas = (estadoTab) => {
    return quejas.filter(q =>
      (estadoTab === 'todos' || q.estado === estadoTab) &&
      (filtroTipo === 'todos' || q.tipo === filtroTipo)
    );
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
                          className="w-full border border-gray-300 rounded-lg lg:rounded-xl px-3 py-2 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] lg:min-h-[100px] mb-2"
                          placeholder="Escribe una respuesta..."
                          maxLength={250}
                        />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">{(q.respuesta?.length || 0)}/250</span>
                          <button
                            disabled={!q.respuesta || q.respuesta.trim() === ""}
                            onClick={() => responderQueja(q._id, q.respuesta || "")}
                            className={`flex items-center gap-1 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm font-semibold transition-all ${!q.respuesta || q.respuesta.trim() === ""
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-900 to-blue-900 text-white hover:from-blue-800 hover:to-blue-900 transform hover:scale-105"
                              }`}
                          >
                            <Save className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">Guardar</span>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center py-4 lg:py-10">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-700 text-sm lg:text-lg">Cargando quejas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="mt-34 md:mt-14"></div>
      <main className="py-4 lg:py-10 bg-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-3 lg:px-4">
          {/* Título y descripción */}
          <div className="text-center mb-6 lg:mb-12">
            <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2 lg:mb-3">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-800">
                Gestión de Quejas y Sugerencias
              </h1>
            </div>
            <p className="text-xs lg:text-base text-gray-600">
              Responde y gestiona todas las quejas y sugerencias de los usuarios
            </p>
          </div>

          {/* TABS */}
          <Tabs>
            <TabList className="flex border-b-2 border-gray-300 gap-0 overflow-x-auto bg-transparent mb-4 lg:mb-6">
              <Tab className="flex-1 py-2.5 lg:py-4 px-2 lg:px-6 text-center font-semibold text-xs lg:text-base text-gray-600 cursor-pointer transition-all hover:text-blue-800 focus:outline-none whitespace-nowrap">
                <div className="flex items-center justify-center gap-1 lg:gap-2">
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
                  Pendientes ({totalPendientes})
                </div>
              </Tab>
              <Tab className="flex-1 py-2.5 lg:py-4 px-2 lg:px-6 text-center font-semibold text-xs lg:text-base text-gray-600 cursor-pointer transition-all hover:text-green-600 focus:outline-none whitespace-nowrap">
                <div className="flex items-center justify-center gap-1 lg:gap-2">
                  <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                  Resueltos ({totalResueltos})
                </div>
              </Tab>
            </TabList>

            {renderQuejasTab('pendiente', 'Pendientes', <Clock className="w-4 h-4 lg:w-5 lg:h-5" />)}
            {renderQuejasTab('resuelto', 'Resueltos', <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />)}
          </Tabs>
        </div>
      </main>
    </>
  );
}

export default GestionarQuejasSugerencias;