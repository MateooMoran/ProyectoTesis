import React, { useEffect, useState } from "react";
import { Trash2, Send } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
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
                console.log(error);
                toast.error(error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

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
            await new Promise((r) => setTimeout(r, 500)); 
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
        if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;

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
            setLista((prev) => prev.filter((item) => item._id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar");
        }
    };

    return (
        <div>
            <Header />
            <ToastContainer />
            <div className="p-6 max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-4  text-gray-500">
                    Mis Quejas y Sugerencias
                </h2>

                <form onSubmit={enviar} className=" rounded mb-10  ">
                    <div>
                        <label className="block font-semibold text-blue-800 text-[.98em] mb-2">
                            Tipo
                        </label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="queja">Queja</option>
                            <option value="sugerencia">Sugerencia</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mt-4 font-semibold text-[.98em] text-blue-800">
                            Mensaje
                        </label>
                        <textarea
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            rows={4}
                            maxLength={500}
                            className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[56px] max-h-[120px] resize-none"
                            placeholder="Escribe tu mensaje..."
                        />
                        <p className="text-sm text-gray-500 mt-3">
                            {mensaje.length}/500 caracteres
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={enviando}
                        className={`bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-transform hover:scale-105 ${enviando ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        <Send size={18} /> {enviando ? "Enviando..." : "Enviar"}
                    </button>
                </form>

                {loading ? (
                    <p>Cargando...</p>
                ) : lista.length === 0 ? (
                    <p className="text-gray-500">
                        No tienes quejas o sugerencias enviadas.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        <h2 className="text-2xl font-bold mb-4 text-gray-500">
                            Visualizar mis Quejas o Sugerencias
                        </h2>

                        {lista.map((item) => (
                            <li
                                key={item._id}
                                className="bg-white p-4 rounded shadow flex justify-between items-start"
                            >
                                <div className="flex items-start gap-3 overflow-hidden w-full">
                                    <div className="w-full">
                                        {/* Tipo arriba */}
                                        <span
                                            className={`inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold uppercase
              ${item.tipo === "queja"
                                                    ? "bg-orange-100 text-orange-800"
                                                    : "bg-blue-100 text-blue-800"
                                                }`}
                                        >
                                            {item.tipo === "queja" ? "Queja" : "Sugerencia"}
                                        </span>

                                        {/* Mensaje y estado en línea */}
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-800 truncate max-w-[calc(100%-80px)]">
                                                {item.mensaje}
                                            </p>

                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                ${item.estado === "resuelto"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {item.estado}
                                            </span>
                                        </div>

                                        {/* Respuesta debajo */}
                                        {item.respuesta && (
                                            <p className="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                                                <span className="font-semibold">Respuesta:</span> {item.respuesta}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Botón eliminar */}
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
