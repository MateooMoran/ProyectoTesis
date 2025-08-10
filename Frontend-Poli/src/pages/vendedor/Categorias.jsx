import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
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
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
            // Error manejado en fetchDataBackend
        }
    };

    return (
        <>
        <Header/>
        <div className="max-w-3xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Categorías</h2>

            <form onSubmit={crearCategoria} className="mb-6 flex gap-2">
                <input
                    type="text"
                    value={nombreCategoria}
                    onChange={(e) => setNombreCategoria(e.target.value)}
                    placeholder="Nueva categoría"
                    className="flex-grow border rounded p-2"
                    disabled={guardando}
                />
                <button
                    type="submit"
                    disabled={guardando}
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1"
                >
                    <PlusCircle size={20} /> Crear
                </button>
            </form>

            {loading ? (
                <p>Cargando categorías...</p>
            ) : categorias.length === 0 ? (
                <p>No hay categorías registradas.</p>
            ) : (
                <ul className="space-y-2">
                    {categorias.map(({ _id, nombreCategoria }) => (
                        <li
                            key={_id}
                            className="flex justify-between items-center bg-gray-100 p-3 rounded"
                        >
                            <span>{nombreCategoria}</span>
                            <button
                                onClick={() => eliminarCategoria(_id)}
                                className="text-red-600 hover:text-red-800"
                                title="Eliminar categoría"
                            >
                                <Trash2 size={18} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        </>
    );
}

