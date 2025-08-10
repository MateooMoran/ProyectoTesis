
import React, { useEffect, useState } from "react";
import { Trash2, Send } from "lucide-react";
import { toast } from "react-toastify";
import storeAuth from "../context/storeAuth";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";

export default function QuejasSugerencias() {
    const { token, rol } = storeAuth();
    const navigate = useNavigate();

    const [lista, setLista] = useState([]);
    const [tipo, setTipo] = useState("queja");
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const API_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (!token) {
            toast.error("Debes iniciar sesión");
            navigate("/login");
        }
        if (rol !== "estudiante") {
            navigate("/dashboard");
        }
    }, [token, rol]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/estudiante/quejas-sugerencias`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (res.ok) {
                setLista(data);
            } else {
                toast.error(data.msg || "Error al obtener datos");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

        setEnviando(true);
        try {
            const res = await fetch(`${API_URL}/estudiante/quejas-sugerencias`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tipo, mensaje: mensaje.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.msg || "Enviado correctamente");
                setMensaje("");
                setTipo("queja");
                cargarDatos();
            } else {
                toast.error(data.msg || "Error al enviar");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setEnviando(false);
        }
    };

    const eliminar = async (id) => {
        if (!confirm("¿Seguro que deseas eliminar este registro?")) return;
        try {
            const res = await fetch(`${API_URL}/estudiante/quejas-sugerencias/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.msg || "Eliminado correctamente");
                setLista(lista.filter((item) => item._id !== id));
            } else {
                toast.error(data.msg || "Error al eliminar");
            }
        } catch {
            toast.error("Error de conexión");
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
                        <p className="text-sm text-gray-500">
                            {mensaje.length}/500 caracteres
                        </p>
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