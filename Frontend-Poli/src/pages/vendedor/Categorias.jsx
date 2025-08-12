import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import useFetch from '../../hooks/useFetch';
import Header from '../../layout/Header';

export default function Categorias() {
    const { fetchDataBackend } = useFetch();
    const [categorias, setCategorias] = useState([]);
    const [nombreCategoria, setNombreCategoria] = useState("");
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

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
            // Error manejado en fetchDataBackend
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
            // Error manejado en fetchDataBackend
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <Header />
            {/* Espacio para compensar header fijo */}
            <div className="h-15 sm:h-7 mb-6" />
            <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
                <h2 className="text-3xl font-extrabold mb-6 text-gray-700  pb-2">Categorías</h2>

                <form onSubmit={crearCategoria} className="mb-8 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={nombreCategoria}
                        onChange={(e) => setNombreCategoria(e.target.value)}
                        placeholder="Nueva categoría"
                        className="flex-grow border border-gray-300 rounded-md p-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        disabled={guardando}
                    />
                    <button
                        type="submit"
                        disabled={guardando}
                        className={`bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md flex items-center justify-center gap-2 transition-transform transform hover:scale-105 disabled:cursor-not-allowed`}
                    >
                        <PlusCircle size={22} />
                        Crear
                    </button>
                </form>

                {loading ? (
                    <p className="text-center text-gray-500">Cargando categorías...</p>
                ) : categorias.length === 0 ? (
                    <p className="text-center text-gray-500">No hay categorías registradas.</p>
                ) : (
                    <ul className="space-y-3">
                        {categorias.map(({ _id, nombreCategoria }) => (
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
                )}
            </div>
            {/* Footer */}
            <footer className="bg-blue-950 py-4 mt-20">
                <div className="text-center">
                    <p className="text-white underline mb-2">
                        © 2025 PoliVentas - Todos los derechos reservados.
                    </p>
                    <div className="flex justify-center gap-6">
                        <a href="#" className="text-white hover:text-red-400 transition-colors">
                            Facebook
                        </a>
                        <a href="#" className="text-white hover:text-red-400 transition-colors">
                            Instagram
                        </a>
                        <a href="#" className="text-white hover:text-red-400 transition-colors">
                            Twitter
                        </a>
                    </div>
                </div>
            </footer>
        </>
    );
}
