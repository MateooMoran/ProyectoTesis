import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import useFetch from '../../hooks/useFetch';
import Header from '../../layout/Header';

export default function Categorias() {
  const { fetchDataBackend } = useFetch();
  const [categorias, setCategorias] = useState([]);
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriasPorPagina = 5;

  const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/categoria`;
      const data = await fetchDataBackend(url, {
        method: "GET",
        config: { headers },
      });
      setCategorias(data);
    } catch {
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const crearCategoria = async (e) => {
    e.preventDefault();
    if (!nombreCategoria.trim()) {
      toast.error("El nombre de la categoría es obligatorio");
      return;
    }
    setGuardando(true);
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/crear/categoria`;
      await fetchDataBackend(url, {
        method: "POST",
        body: { nombreCategoria: nombreCategoria.trim() },
        config: { headers },
      });
      setNombreCategoria("");
      cargarCategorias();
    } catch {
      // manejado en fetchDataBackend
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCategoria = async (id) => {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/eliminar/categoria/${id}`;
      await fetchDataBackend(url, {
        method: "DELETE",
        config: { headers },
      });
      setCategorias(categorias.filter((c) => c._id !== id));
    } catch {
      // manejado en fetchDataBackend
    }
  };

  // --- PAGINACIÓN ---
  const indexUltima = currentPage * categoriasPorPagina;
  const indexPrimera = indexUltima - categoriasPorPagina;
  const categoriasActuales = categorias.slice(indexPrimera, indexUltima);
  const totalPaginas = Math.ceil(categorias.length / categoriasPorPagina);

  const handlePageChange = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setCurrentPage(nuevaPagina);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Header />
      <div className="h-15 sm:h-7 mb-10" />

      {/* Título y descripción */}
      <div className="text-center mb-6 lg:mb-10">
        <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2 lg:mb-3">
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-800">
            Gestión de Categorías
          </h1>
        </div>
        <p className="text-xs lg:text-base text-gray-600">
          Organiza tus productos en categorías para mejorar la experiencia de tus clientes
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-3 lg:px-4 flex flex-col lg:flex-row gap-6 mb-4">
        {/* MITAD IZQUIERDA: FORMULARIO */}
        <div className="lg:w-1/2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-700">Crear Categoría</h2>
          <form onSubmit={crearCategoria} className="flex flex-col gap-4">
            <input
              type="text"
              value={nombreCategoria}
              onChange={(e) => setNombreCategoria(e.target.value)}
              placeholder="Nueva categoría"
              className="border border-gray-300 rounded-md p-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={guardando}
            />
            <button
              type="submit"
              disabled={guardando}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-transform transform hover:scale-105 disabled:cursor-not-allowed"
            >
              <PlusCircle size={22} />
              Crear
            </button>
          </form>
        </div>

        {/* MITAD DERECHA: LISTADO + PAGINADOR */}
        <div className="lg:w-1/2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-700">Categorías Registradas</h2>

          {loading ? (
            <p className="text-center text-gray-500">Cargando categorías...</p>
          ) : categorias.length === 0 ? (
            <p className="text-center text-gray-500">No hay categorías registradas.</p>
          ) : (
            <>
              <ul className="space-y-3 mb-4">
                {categoriasActuales.map(({ _id, nombreCategoria }) => (
                  <li
                    key={_id}
                    className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition rounded-md shadow-sm p-4"
                  >
                    <span className="text-gray-800 font-medium">{nombreCategoria}</span>
                    <button
                      onClick={() => eliminarCategoria(_id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={20} />
                    </button>
                  </li>
                ))}
              </ul>

              {/* PAGINADOR */}
              {totalPaginas > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-blue-800 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-all flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </button>

                  {[...Array(totalPaginas)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-8 h-8  rounded-lg font-semibold text-sm transition-all ${currentPage === i + 1 ? 'bg-blue-800 text-white shadow-lg' : 'bg-gray-200 hover:bg-blue-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPaginas}
                    className="px-3 py-2 bg-blue-800 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-all flex items-center gap-1"
                  >
                    Siguiente
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}