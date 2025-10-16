import { useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import useFetch from "../../hooks/useFetch";
import { ToastContainer, toast } from "react-toastify";
import Header from "../../layout/Header";
import Footer from "../../layout/Footer";

function GestionarQuejasSugerencias() {
  const { fetchDataBackend } = useFetch();
  const [quejas, setQuejas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
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

  // 🔥 FILTRO COMBINADO (TAB + FILTROS)
  const getQuejasFiltradas = (tipoTab, estadoTab) => {
    return quejas.filter(q => 
      (tipoTab === 'todos' || q.tipo === tipoTab) &&
      (estadoTab === 'todos' || q.estado === estadoTab) &&
      (filtroTipo === 'todos' || q.tipo === filtroTipo) &&
      (filtroEstado === 'todos' || q.estado === filtroEstado)
    );
  };

  const totalQuejas = quejas.filter(q => q.tipo === 'queja').length;
  const totalSugerencias = quejas.filter(q => q.tipo === 'sugerencia').length;
  const totalPendientes = quejas.filter(q => q.estado === 'pendiente').length;
  const totalResueltos = quejas.filter(q => q.estado === 'resuelto').length;

  const getQuejasActuales = (tipoTab, estadoTab) => {
    const filtradas = getQuejasFiltradas(tipoTab, estadoTab);
    const indexUltima = currentPage * quejasPorPagina;
    const indexPrimera = indexUltima - quejasPorPagina;
    return filtradas.slice(indexPrimera, indexUltima);
  };

  const getTotalPaginas = (tipoTab, estadoTab) => {
    const filtradas = getQuejasFiltradas(tipoTab, estadoTab);
    return Math.ceil(filtradas.length / quejasPorPagina);
  };

  const handlePageChange = (nuevaPagina, tipoTab, estadoTab) => {
    if (nuevaPagina >= 1 && nuevaPagina <= getTotalPaginas(tipoTab, estadoTab)) {
      setCurrentPage(nuevaPagina);
    }
  };

  const renderQuejasTab = (tipoTab, estadoTab, titulo, icon) => {
    const quejasActuales = getQuejasActuales(tipoTab, estadoTab);
    const totalPaginas = getTotalPaginas(tipoTab, estadoTab);
    const totalItems = getQuejasFiltradas(tipoTab, estadoTab).length;

    return (
      <TabPanel>
        <div className="mt-8 mb-10 space-y-8">
          {totalItems === 0 ? (
            <p className="text-center text-gray-700 text-xl py-12">
              No hay {titulo.toLowerCase()} registradas
            </p>
          ) : (
            <>
              {/* 🔥 FILTROS */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-10">
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                      {icon} Total: {totalItems} {titulo.toLowerCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Página {currentPage} de {totalPaginas}
                    </span>
                  </div>

                  <div className="flex gap-4 flex-wrap">
                    <select
                      value={filtroTipo}
                      onChange={(e) => {
                        setFiltroTipo(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                    >
                      <option value="todos">Todos los tipos</option>
                      <option value="queja">Quejas</option>
                      <option value="sugerencia">Sugerencias</option>
                    </select>
                    <select
                      value={filtroEstado}
                      onChange={(e) => {
                        setFiltroEstado(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="pendiente">Pendientes</option>
                      <option value="resuelto">Resueltos</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 🔥 TABLA */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-10">
                <div className="hidden md:grid grid-cols-[1.8fr_1fr_3fr_3fr_1fr_1fr] bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 text-sm font-bold text-blue-800 border-b">
                  <div>Usuario</div>
                  <div>Tipo</div>
                  <div>Mensaje</div>
                  <div>Respuesta</div>
                  <div>Estado</div>
                  <div>Acción</div>
                </div>

                <div className="divide-y divide-gray-200">
                  {quejasActuales.map((q) => (
                    <div key={q._id} className="md:grid md:grid-cols-[1.8fr_1fr_3fr_3fr_1fr_1fr] gap-6 px-6 py-6 hover:bg-gray-50 transition-all duration-200">
                      <div className="hidden md:block">{q.usuario?.nombre} {q.usuario?.apellido}</div>
                      <div className="hidden md:block">
                        {q.tipo === "queja" ? (
                          <span className="px-3 py-1 text-orange-800 bg-orange-100 rounded-full text-xs">Queja</span>
                        ) : (
                          <span className="px-3 py-1 text-blue-600 bg-blue-200 rounded-full text-xs">Sugerencia</span>
                        )}
                      </div>
                      <div className="hidden md:block text-gray-600 text-sm line-clamp-2">{q.mensaje}</div>

                      <div className="flex flex-col">
                        <textarea
                          value={q.respuesta || ""}
                          onChange={(e) => handleRespuestaChange(q._id, e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[56px]"
                          placeholder="Escribe una respuesta..."
                          maxLength={250}
                        />
                        <div className="text-xs text-gray-500 text-right mt-1">{(q.respuesta?.length || 0)}/250</div>
                      </div>

                      <div className="hidden md:block">
                        {q.estado === "resuelto" ? (
                          <span className="px-3 py-1 text-green-800 bg-green-100 rounded-full text-xs">Resuelto</span>
                        ) : (
                          <span className="px-3 py-1 text-red-800 bg-red-100 rounded-full text-xs">Pendiente</span>
                        )}
                      </div>

                      <div className="flex justify-center">
                        <button
                          disabled={!q.respuesta || q.respuesta.trim() === ""}
                          onClick={() => responderQueja(q._id, q.respuesta || "")}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            !q.respuesta || q.respuesta.trim() === ""
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-900 to-blue-900 text-white hover:from-blue-800 hover:to-blue-900 transform hover:scale-105"
                          }`}
                        >
                          💾 Guardar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🔥 PAGINADOR */}
              {totalPaginas > 1 && (
                <div className="bg-white rounded-2xl shadow-md p-6 flex justify-center gap-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1, tipoTab, estadoTab)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-800 text-white rounded-xl disabled:bg-gray-400"
                  >
                    ← Anterior
                  </button>
                  {[...Array(totalPaginas)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1, tipoTab, estadoTab)}
                      className={`px-3 py-2 rounded-xl ${
                        currentPage === i + 1 ? 'bg-blue-800 text-white' : 'bg-gray-200 hover:bg-blue-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1, tipoTab, estadoTab)}
                    disabled={currentPage === totalPaginas}
                    className="px-4 py-2 bg-blue-800 text-white rounded-xl disabled:bg-gray-400"
                  >
                    Siguiente →
                  </button>
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
      <>
        <Header />
        <div className="h-10 sm:h-5 mb-6" />
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
          <p className="text-center text-gray-700 text-lg">Cargando quejas...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <Header />
      <div className="h-10 sm:h-5 mb-6" />

      <main className="py-10 bg-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-700 text-center mb-12">
            📝 Gestión de Quejas y Sugerencias
          </h2>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-10 p-6">
            <Tabs>
              <TabList className="flex border-b border-gray-200 mb-6">
                <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-blue-800 focus:outline-none">
                  Todas ({quejas.length})
                </Tab>
                <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-orange-600 focus:outline-none">
                  Quejas ({totalQuejas})
                </Tab>
                <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-blue-600 focus:outline-none">
                  Sugerencias ({totalSugerencias})
                </Tab>
                <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-red-600 focus:outline-none">
                  Pendientes ({totalPendientes})
                </Tab>
                <Tab className="flex-1 py-4 px-6 text-center font-semibold text-gray-600 cursor-pointer transition-all hover:text-green-600 focus:outline-none">
                  Resueltos ({totalResueltos})
                </Tab>
              </TabList>

              {renderQuejasTab('todos', 'todos', 'Todas')}
              {renderQuejasTab('queja', 'todos', 'Quejas')}
              {renderQuejasTab('sugerencia', 'todos', 'Sugerencias')}
              {renderQuejasTab('todos', 'pendiente', 'Pendientes')}
              {renderQuejasTab('todos', 'resuelto', 'Resueltos')}
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default GestionarQuejasSugerencias;
