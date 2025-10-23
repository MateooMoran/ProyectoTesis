import React, { useEffect, useState } from "react";
import { Trash2, Send, AlertTriangle, Lightbulb, FileText, CheckCircle, Clock } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import useFetch from "../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

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
        if (rol !== "estudiante" && rol !== "vendedor") {
            navigate("/dashboard");
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
            const headers = { Authorization: `Bearer ${token}` };
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

    if (loading) {
        return (
            <>
                <Header />
                <div className="h-10 sm:h-5 mb-6" />
                <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                    <p className="text-center text-gray-700 text-lg">Cargando...</p>
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
                    {/* TÍTULO GRADIENTE */}
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-700 bg-clip-text text-transparent text-center mb-12 flex items-center justify-center gap-2">
                        <FileText size={34} />
                        Mis Quejas y Sugerencias
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* 🔥 COLUMNA IZQUIERDA: FORMULARIO */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    Nueva Queja/Sugerencia
                                </h3>
                                <form onSubmit={enviar} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Tipo
                                        </label>
                                        <select
                                            value={tipo}
                                            onChange={(e) => setTipo(e.target.value)}
                                            className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold flex items-center gap-2"
                                        >
                                            <option value="queja">
                                                <AlertTriangle className="inline-block mr-2 text-orange-600" size={16} />
                                                Queja
                                            </option>
                                            <option value="sugerencia">
                                                <Lightbulb className="inline-block mr-2 text-blue-600" size={16} />
                                                Sugerencia
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Mensaje
                                        </label>
                                        <textarea
                                            value={mensaje}
                                            onChange={(e) => setMensaje(e.target.value)}
                                            rows={4}
                                            maxLength={500}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
                                            placeholder="Escribe tu mensaje detallado (mínimo 10 caracteres)..."
                                        />
                                        <p className="text-sm text-gray-500 text-right mt-1">
                                            {mensaje.length}/500 caracteres
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={enviando || !mensaje.trim()}
                                        className={`w-full h-12 bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed ${enviando ? "opacity-50" : ""
                                            }`}
                                    >
                                        <Send size={20} /> {enviando ? "Enviando..." : "Enviar"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* 🔥 COLUMNA DERECHA: LISTA QUEJAS */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    Mis Registros ({lista.length})
                                </h3>
                                {lista.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No tienes quejas o sugerencias enviadas</p>
                                ) : (
                                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                        {lista.map((item) => (
                                            <div
                                                key={item._id}
                                                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1">
                                                        {/* TIPO */}
                                                        <span
                                                            className={`inline-flex items-center gap-1 mb-3 px-3 py-1 rounded-full text-xs font-semibold ${item.tipo === "queja"
                                                                    ? "bg-orange-100 text-orange-800"
                                                                    : "bg-blue-100 text-blue-800"
                                                                }`}
                                                        >
                                                            {item.tipo === "queja" ? (
                                                                <>
                                                                    <AlertTriangle size={14} /> Queja
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Lightbulb size={14} /> Sugerencia
                                                                </>
                                                            )}
                                                        </span>

                                                        {/* MENSAJE */}
                                                        <p className="text-gray-800 font-medium mb-2 line-clamp-3">
                                                            {item.mensaje}
                                                        </p>

                                                        {/* ESTADO */}
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${item.estado === "resuelto"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-red-100 text-red-800"
                                                                    }`}
                                                            >
                                                                {item.estado === "resuelto" ? (
                                                                    <>
                                                                        <CheckCircle size={14} /> Resuelto
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Clock size={14} /> Pendiente
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>

                                                        {/* RESPUESTA */}
                                                        {item.respuesta && (
                                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                                <p className="text-sm text-green-700 font-semibold mb-1">Respuesta:</p>
                                                                <p className="text-sm text-green-600 line-clamp-2">{item.respuesta}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* BOTÓN ELIMINAR */}
                                                    <button
                                                        onClick={() => eliminar(item._id)}
                                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
