import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { ToastContainer, toast } from 'react-toastify';
import Header from "../../layout/Header";
import Footer from "../../layout/Footer";

function GestionarUsuario() {
    const { fetchDataBackend } = useFetch();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroRol, setFiltroRol] = useState('todos');
    const [currentPage, setCurrentPage] = useState(1);
    const [usuariosPorPagina] = useState(10);

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

    // 🔥 FILTRO POR ROL
    const usuariosFiltrados = usuarios.filter(user =>
        filtroRol === 'todos' || user.rol === filtroRol
    );

    // 🔥 PAGINACIÓN
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
            <>
                <Header />
                <div className="h-10 sm:h-5 mb-6" />
                <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                    <p className="text-center text-gray-700 text-lg">Cargando usuarios...</p>
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
                    {/* 🔥 TÍTULO GRADIENTE */}
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-700 bg-clip-text text-transparent text-center mb-12">
                        👥 Gestión de Usuarios
                    </h2>

                    {usuarios.length === 0 ? (
                        <p className="text-center text-gray-700 text-xl">No hay usuarios registrados</p>
                    ) : (
                        <>
                            {/* 🔥 FILTRO + INFO */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold text-gray-700">
                                            Total: {usuariosFiltrados.length} usuarios
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            Página {currentPage} de {totalPaginas}
                                        </span>
                                    </div>
                                    <select
                                        value={filtroRol}
                                        onChange={(e) => {
                                            setFiltroRol(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                                    >
                                        <option value="todos">Todos los roles</option>
                                        <option value="estudiante">Estudiantes</option>
                                        <option value="vendedor">Vendedores</option>
                                    </select>
                                </div>
                            </div>

                            {/* 🔥 TABLA USUARIOS */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                {/* HEADER TABLA */}
                                <div className="hidden sm:grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1fr] bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 text-sm font-bold text-blue-800 border-b">
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
                                            className="sm:grid sm:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1fr] gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                                        >
                                            {/* MOBILE CARD */}
                                            <div className="sm:hidden bg-blue-50 rounded-xl p-4 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src="https://media-public.canva.com/rVvfU/MAFlPzrVvfU/1/tl.png"
                                                        alt={`${user.nombre} avatar`}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-800">{user.nombre} {user.apellido}</p>
                                                        <p className="text-sm text-gray-600">{user.telefono}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* DESKTOP */}
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src="https://media-public.canva.com/rVvfU/MAFlPzrVvfU/1/tl.png"
                                                    alt={`${user.nombre} avatar`}
                                                    className="w-8 h-8 rounded-full hidden sm:block"
                                                />
                                                <span className="font-medium text-gray-800 hidden sm:block">
                                                    {user.nombre} {user.apellido}
                                                </span>
                                            </div>

                                            <div className="text-gray-600 hidden sm:block">{user.telefono}</div>

                                            <div className="capitalize text-gray-700 hidden sm:block">{user.rol}</div>

                                            <div className="hidden sm:block">
                                                {user.estado ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                        Activo
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                <select
                                                    value={user.rol}
                                                    onChange={(e) => cambiarRolUsuario(user._id, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-all"
                                                >
                                                    <option value="estudiante">Estudiante</option>
                                                    <option value="vendedor">Vendedor</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 🔥 PAGINADOR ELEGANTE */}
                            {totalPaginas > 1 && (
                                <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border border-gray-200 flex flex-wrap items-center justify-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-blue-800 text-white rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-all"
                                    >
                                        ← Anterior
                                    </button>

                                    {[...Array(totalPaginas)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => handlePageChange(i + 1)}
                                            className={`px-3 py-2 rounded-xl font-semibold transition-all ${currentPage === i + 1
                                                    ? 'bg-blue-800 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPaginas}
                                        className="px-4 py-2 bg-blue-800 text-white rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-800 transition-all"
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

export default GestionarUsuario;