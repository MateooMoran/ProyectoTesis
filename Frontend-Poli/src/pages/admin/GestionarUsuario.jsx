import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { ToastContainer, toast } from 'react-toastify';
import { Users, Filter, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";

function GestionarUsuario() {
    const { fetchDataBackend } = useFetch();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroRol, setFiltroRol] = useState('todos');
    const [currentPage, setCurrentPage] = useState(1);
    const [usuariosPorPagina] = useState(5);

    useEffect(() => {
        const obtenerUsuarios = async () => {
            setLoading(true);
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/admin/usuario`;
                const storedUser = JSON.parse(localStorage.getItem("auth-token"));
                const headers = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${storedUser?.state?.token || ''}`,
                };
                const response = await fetchDataBackend(url, {
                    method: "GET",
                    config: { headers },
                });
                setUsuarios(response);
                setCurrentPage(1);
            } catch (err) {
                toast.error('Error al cargar usuarios');
            } finally {
                setLoading(false);
            }
        };
        obtenerUsuarios();
    }, []);

    const cambiarRolUsuario = async (idUsuario, nuevoRol) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/admin/rol/${idUsuario}`;
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser?.state?.token || ''}`,
            };
            const body = { rol: nuevoRol };
            await fetchDataBackend(url, {
                method: "PUT",
                body,
                config: { headers },
            });
            setUsuarios((prev) =>
                prev.map((user) =>
                    user._id === idUsuario ? { ...user, rol: nuevoRol } : user
                )
            );
        } catch (err) {
            toast.error('Error al actualizar rol');
        }
    };

    const usuariosFiltrados = usuarios.filter(user =>
        filtroRol === 'todos' || user.rol === filtroRol
    );

    const indexUltimoUsuario = currentPage * usuariosPorPagina;
    const indexPrimerUsuario = indexUltimoUsuario - usuariosPorPagina;
    const usuariosActuales = usuariosFiltrados.slice(indexPrimerUsuario, indexUltimoUsuario);
    const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

    const handlePageChange = (nuevaPagina) => {
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            setCurrentPage(nuevaPagina);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center py-4 lg:py-10">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-700 text-sm lg:text-lg">Cargando usuarios...</p>
                </div>
            </div>
        );
    }
    return (
        <>
            <ToastContainer />
            <div className="mt-30 md:mt-12"></div>
            <main className="py-4 lg:py-10 bg-blue-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-3 lg:px-4">
                    {/* Título y descripción */}
                    <div className="text-center mb-6 lg:mb-5">
                        <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                            <h1 className="text-2xl lg:text-4xl font-bold text-gray-800">
                                Gestión de Usuarios
                            </h1>
                        </div>
                        <p className="text-xs lg:text-base text-gray-600">
                            Administra los usuarios y roles del sistema
                        </p>
                    </div>

                    {usuarios.length === 0 ? (
                        <p className="text-center text-gray-700 text-base lg:text-xl py-8 lg:py-12">No hay usuarios registrados</p>
                    ) : (
                        <>
                            {/* FILTRO + INFO */}
                            <div className="p-3 lg:p-6 mb-4 lg:mb-8 border-b-2 border-gray-300">
                                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 items-start sm:items-center justify-between">
                                    <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
                                        <span className="text-sm lg:text-lg font-semibold text-gray-700">
                                            Total: {usuariosFiltrados.length}
                                        </span>
                                        <span className="px-2 lg:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs lg:text-sm">
                                            Pág {currentPage} de {totalPaginas}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 lg:gap-4 items-center w-full sm:w-auto">
                                        <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 flex-shrink-0" />
                                        <select
                                            value={filtroRol}
                                            onChange={(e) => {
                                                setFiltroRol(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="flex-1 sm:flex-none px-2 lg:px-4 py-1.5 lg:py-2 border border-gray-300 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm font-semibold"
                                        >
                                            <option value="todos">Todos los roles</option>
                                            <option value="estudiante">Estudiantes</option>
                                            <option value="vendedor">Vendedores</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* TABLA USUARIOS */}
                            <div className="rounded-lg lg:rounded-2xl border border-gray-200 overflow-hidden mb-4 lg:mb-8">
                                {/* HEADER TABLA */}
                                <div className="hidden sm:grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1fr]  px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-bold">
                                    <div>Usuario</div>
                                    <div>Teléfono</div>
                                    <div>Rol</div>
                                    <div>Estado</div>
                                    <div>Acciones</div>
                                </div>

                                {/* CARDS USUARIOS */}
                                <div className="divide-y divide-gray-200">
                                    {usuariosActuales.map((user) => (
                                        <div
                                            key={user._id}
                                            className="sm:grid  bg-white sm:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1fr] gap-3 lg:gap-4 px-3 lg:px-6 py-3 lg:py-4 hover:bg-gray-50 transition-colors"
                                        >
                                            {/* MOBILE CARD */}
                                            <div className="sm:hidden bg-white rounded-lg p-3 mb-3">
                                                <div className="flex items-center gap-2 lg:gap-3">
                                                    <img
                                                        src="https://media-public.canva.com/rVvfU/MAFlPzrVvfU/1/tl.png"
                                                        alt={`${user.nombre} avatar`}
                                                        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-xs lg:text-sm text-gray-800">{user.nombre} {user.apellido}</p>
                                                        <p className="text-xs text-gray-600">{user.telefono}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* DESKTOP */}
                                            <div className="flex items-center gap-2 lg:gap-3">
                                                <img
                                                    src="https://media-public.canva.com/rVvfU/MAFlPzrVvfU/1/tl.png"
                                                    alt={`${user.nombre} avatar`}
                                                    className="w-6 h-6 lg:w-8 lg:h-8 rounded-full hidden sm:block"
                                                />
                                                <span className="font-medium text-xs lg:text-sm text-gray-800 hidden sm:block truncate">
                                                    {user.nombre} {user.apellido}
                                                </span>
                                            </div>

                                            <div className="text-xs lg:text-sm text-gray-600 hidden sm:block">{user.telefono}</div>

                                            <div className="capitalize text-xs lg:text-sm text-gray-700 hidden sm:block">{user.rol}</div>

                                            <div className="hidden sm:block">
                                                {user.estado ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                        <CheckCircle className="w-3 h-3" /> Activo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                                        <XCircle className="w-3 h-3" /> Inactivo
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                <select
                                                    value={user.rol}
                                                    onChange={(e) => cambiarRolUsuario(user._id, e.target.value)}
                                                    className="w-full px-2 lg:px-3 py-1.5 lg:py-2 border border-gray-300 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm font-semibold transition-all"
                                                >
                                                    <option value="estudiante">Estudiante</option>
                                                    <option value="vendedor">Vendedor</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PAGINADOR */}
                            {totalPaginas > 1 && (
                                <div className="p-3 lg:p-6 border-t-2 border-gray-300 flex flex-wrap items-center justify-center gap-1 lg:gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-2 lg:px-4 py-1.5 lg:py-2 bg-blue-800 text-white rounded-lg lg:rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-all flex items-center gap-1 text-xs lg:text-base"
                                    >
                                        <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span className="hidden sm:inline">Anterior</span>
                                    </button>

                                    <div className="flex gap-0.5 lg:gap-1">
                                        {[...Array(totalPaginas)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => handlePageChange(i + 1)}
                                                className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl font-semibold text-xs lg:text-base transition-all ${currentPage === i + 1
                                                        ? 'bg-blue-800 text-white shadow-lg scale-110'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPaginas}
                                        className="px-2 lg:px-4 py-1.5 lg:py-2 bg-blue-800 text-white rounded-lg lg:rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-all flex items-center gap-1 text-xs lg:text-base"
                                    >
                                        <span className="hidden sm:inline">Siguiente</span>
                                        <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </>
    );
}

export default GestionarUsuario;