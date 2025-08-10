import React, { useEffect, useState } from "react";
import { Trash2, Send } from "lucide-react";
import { toast } from "react-toastify";
import useFetch from "../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";

export default function QuejasSugerenciasEstudiante() {
    const { fetchDataBackend } = useFetch();
    const navigate = useNavigate();

    const [lista, setLista] = useState([]);
    const [tipo, setTipo] = useState("queja");
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("auth-token"));
        const token = storedUser?.state?.token || null;
        const rol = storedUser?.state?.rol || null;

        if (!token) {
            toast.error("Debes iniciar sesión");
            navigate("/login");
            return;
        }
        if (rol !== "estudiante") {
            navigate("/dashboard"); // Redirige a dashboard u otra ruta si no es estudiante
            return;
        }

        const cargarDatos = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/quejas-sugerencias`;
                const headers = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                };
                const data = await fetchDataBackend(url, {
                    method: "GET",
                    config: { headers },
                });
                setLista(data);
            } catch (error) {
                console.error("Error al obtener quejas/sugerencias", error);
                toast.error("Error al cargar datos");
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [fetchDataBackend, navigate]);

    const validarFormulario = () => {
        if (!tipo || (tipo !== "queja" && tipo !== "sugerencia")) {
            toast.error("Selecciona un tipo válido");
            return false;
        }
        if (!mensaje.trim()) {
            toast.error("El mensaje es obligatorio");
            return false;
        }
        if (mensaje.trim().length < 10) {
            toast.error("El mensaje debe tener al menos 10 caracteres");
            return false;
        }
        if (mensaje.trim().length > 500) {
            toast.error("El mensaje no debe superar los 500 caracteres");
            return false;
        }
        return true;
    };

    const enviar = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        const storedUser = JSON.parse(localStorage.getItem("auth-token"));
        const token = storedUser?.state?.token || null;
        if (!token) {
            toast.error("Token no disponible, inicia sesión de nuevo");
            navigate("/login");
            return;
        }

        setEnviando(true);
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/quejas-sugerencias`;
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const body = { tipo, mensaje: mensaje.trim() };
            await fetchDataBackend(url, {
                method: "POST",
                body,
                config: { headers },
            });
            toast.success("Enviado correctamente");
            setMensaje("");
            setTipo("queja");
            // Recargar lista
            const data = await fetchDataBackend(url, {
                method: "GET",
                config: { headers },
            });
            setLista(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al enviar queja/sugerencia");
        } finally {
            setEnviando(false);
        }
    };

    const eliminar = async (id) => {
        if (!confirm("¿Seguro que deseas eliminar este registro?")) return;

        const storedUser = JSON.parse(localStorage.getItem("auth-token"));
        const token = storedUser?.state?.token || null;
        if (!token) {
            toast.error("Token no disponible, inicia sesión de nuevo");
            navigate("/login");
            return;
        }

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/quejas-sugerencias/${id}`;
            const headers = {
                Authorization: `Bearer ${token}`,
            };
            await fetchDataBackend(url, {
                method: "DELETE",
                config: { headers },
            });
            toast.success("Eliminado correctamente");
            setLista((prev) => prev.filter((item) => item._id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar");
        }
    };

    return (
        <div>
            <Header />
            <div className="max-w-3xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4 text-blue-700">
                    Mis Quejas y Sugerencias
                </h1>

                <form onSubmit={enviar} className="bg-white p-4 rounded shadow mb-6 space-y-3">
                    <div>
                        <label className="block mb-1 font-semibold text-blue-700">Tipo</label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="queja">Queja</option>
                            <option value="sugerencia">Sugerencia</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-blue-700">Mensaje</label>
                        <textarea
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            rows="4"
                            maxLength={500}
                            className="w-full border rounded p-2"
                            placeholder="Escribe tu mensaje..."
                        />
                        <p className="text-sm text-gray-500">{mensaje.length}/500 caracteres</p>
                    </div>
                    <button
                        type="submit"
                        disabled={enviando}
                        className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-transform hover:scale-105 ${enviando ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        <Send size={18} /> {enviando ? "Enviando..." : "Enviar"}
                    </button>
                </form>

                {loading ? (
                    <p>Cargando...</p>
                ) : lista.length === 0 ? (
                    <p className="text-gray-500">No tienes quejas o sugerencias enviadas.</p>
                ) : (
                    <ul className="space-y-3">
                        {lista.map((item) => (
                            <li
                                key={item._id}
                                className="bg-white p-4 rounded shadow flex justify-between items-start"
                            >
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {new Date(item.createdAt).toLocaleString()} -{" "}
                                        <span className="font-bold capitalize">{item.tipo}</span>
                                    </p>
                                    <p>{item.mensaje}</p>
                                </div>
                                <button
                                    onClick={() => eliminar(item._id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
