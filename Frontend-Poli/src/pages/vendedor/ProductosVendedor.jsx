import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import useFetch from '../../hooks/useFetch';
import Header from '../../layout/Header';

export default function ProductosVendedor() {
    const { fetchDataBackend } = useFetch();

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // Form producto
    const [form, setForm] = useState({
        nombreProducto: "",
        precio: "",
        stock: "",
        descripcion: "",
        categoria: "",
    });

    // Imagen tradicional (archivo)
    const [imagenArchivo, setImagenArchivo] = useState(null);

    // Imagen IA (base64)
    const [imagenIA, setImagenIA] = useState("");

    // Prompt para generar imagen IA
    const [promptIA, setPromptIA] = useState("");

    // Estado de generación IA
    const [generandoIA, setGenerandoIA] = useState(false);

    const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    // Cargar productos y categorias
    const cargarProductosYCategorias = async () => {
        try {
            setLoading(true);
            const urlProd = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/producto`;
            const urlCat = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/categoria`;
            const [prodData, catData] = await Promise.all([
                fetchDataBackend(urlProd, { method: "GET", config: { headers } }),
                fetchDataBackend(urlCat, { method: "GET", config: { headers } }),
            ]);
            setProductos(prodData);
            setCategorias(catData);
        } catch (error) {
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarProductosYCategorias();
    }, []);

    const manejarCambio = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const manejarArchivo = (e) => {
        if (e.target.files.length > 0) {
            setImagenArchivo(e.target.files[0]);
            setImagenIA(""); // Limpiar imagen IA si suben archivo tradicional
        }
    };

    const generarImagenIA = async () => {
        if (!promptIA.trim()) {
            toast.error("Debes ingresar un prompt para generar la imagen");
            return;
        }
        setGenerandoIA(true);
        setImagenArchivo(null); // Limpiar archivo si generan IA
        try {
            const response = await fetch("https://api-inference.huggingface.co/models/tu-modelo-ia", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: promptIA }),
            });

            if (!response.ok) throw new Error("Error generando imagen IA");

            const blob = await response.blob();
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });

            setImagenIA(base64);
            toast.success("Imagen IA generada");
        } catch (error) {
            console.error(error);
            toast.error("Error al generar imagen IA");
        } finally {
            setGenerandoIA(false);
        }
    };

    const crearProducto = async (e) => {
        e.preventDefault();
        if (
            !form.nombreProducto.trim() ||
            !form.precio ||
            !form.stock ||
            !form.descripcion.trim() ||
            !form.categoria
        ) {
            toast.error("Todos los campos son obligatorios");
            return;
        }
        if (Number(form.precio) < 0 || Number(form.stock) < 0) {
            toast.error("Precio y stock deben ser positivos");
            return;
        }

        setGuardando(true);

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/crear/producto`;

            let body;
            let config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            if (imagenArchivo) {
                // FormData para archivo
                body = new FormData();
                body.append("nombreProducto", form.nombreProducto.trim());
                body.append("precio", Number(form.precio));
                body.append("stock", Number(form.stock));
                body.append("descripcion", form.descripcion.trim());
                body.append("categoria", form.categoria);
                body.append("imagen", imagenArchivo);
                // No establecer Content-Type, axios lo asigna
            } else if (imagenIA) {
                // JSON con base64
                body = JSON.stringify({
                    nombreProducto: form.nombreProducto.trim(),
                    precio: Number(form.precio),
                    stock: Number(form.stock),
                    descripcion: form.descripcion.trim(),
                    categoria: form.categoria,
                    imagenIA: imagenIA,
                });
                config.headers["Content-Type"] = "application/json";
            } else {
                // Sin imagen
                body = JSON.stringify({
                    nombreProducto: form.nombreProducto.trim(),
                    precio: Number(form.precio),
                    stock: Number(form.stock),
                    descripcion: form.descripcion.trim(),
                    categoria: form.categoria,
                });
                config.headers["Content-Type"] = "application/json";
            }

            await fetchDataBackend(url, {
                method: "POST",
                body,
                config,
            });

            toast.success("Producto creado");
            setForm({
                nombreProducto: "",
                precio: "",
                stock: "",
                descripcion: "",
                categoria: "",
            });
            setImagenArchivo(null);
            setImagenIA("");
            setPromptIA("");
            cargarProductosYCategorias();
        } catch {
            // Error manejado en fetchDataBackend
        } finally {
            setGuardando(false);
        }
    };

    const eliminarProducto = async (id) => {
        if (!window.confirm("¿Eliminar este producto?")) return;
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/eliminar/producto/${id}`;
            await fetchDataBackend(url, {
                method: "DELETE",
                config: { headers },
            });
            toast.success("Producto eliminado");
            setProductos(productos.filter((p) => p._id !== id));
        } catch {
            // Error manejado en fetchDataBackend
        }
    };

    return (
        <>
            <Header />
            <div className="max-w-4xl mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">Productos</h2>

                <form
                    onSubmit={crearProducto}
                    className="bg-white p-4 rounded shadow mb-6 space-y-3"
                >
                    <input
                        name="nombreProducto"
                        placeholder="Nombre del producto"
                        value={form.nombreProducto}
                        onChange={manejarCambio}
                        className="w-full border rounded p-2"
                        disabled={guardando || generandoIA}
                    />
                    <input
                        name="precio"
                        type="number"
                        placeholder="Precio"
                        value={form.precio}
                        onChange={manejarCambio}
                        className="w-full border rounded p-2"
                        disabled={guardando || generandoIA}
                    />
                    <input
                        name="stock"
                        type="number"
                        placeholder="Stock"
                        value={form.stock}
                        onChange={manejarCambio}
                        className="w-full border rounded p-2"
                        disabled={guardando || generandoIA}
                    />
                    <textarea
                        name="descripcion"
                        placeholder="Descripción"
                        value={form.descripcion}
                        onChange={manejarCambio}
                        className="w-full border rounded p-2"
                        disabled={guardando || generandoIA}
                    />
                    <select
                        name="categoria"
                        value={form.categoria}
                        onChange={manejarCambio}
                        className="w-full border rounded p-2"
                        disabled={guardando || generandoIA}
                    >
                        <option value="">Selecciona una categoría</option>
                        {categorias.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.nombreCategoria}
                            </option>
                        ))}
                    </select>

                    {/* Subir imagen tradicional */}
                    <label className="block mt-2 font-semibold">Subir imagen tradicional</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={manejarArchivo}
                        disabled={guardando || generandoIA}
                        className="mb-2"
                    />

                    {/* Generar imagen IA */}
                    <label className="block mt-4 font-semibold">Generar imagen con IA</label>
                    <input
                        type="text"
                        placeholder="Describe la imagen a generar con IA"
                        value={promptIA}
                        onChange={(e) => setPromptIA(e.target.value)}
                        disabled={guardando || generandoIA}
                        className="w-full border rounded p-2 mb-2"
                    />
                    <button
                        type="button"
                        onClick={generarImagenIA}
                        disabled={guardando || generandoIA || !promptIA.trim()}
                        className={`bg-green-600 text-white px-4 py-2 rounded mb-4 ${
                            generandoIA ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {generandoIA ? "Generando..." : "Generar Imagen IA"}
                    </button>

                    {/* Preview imagen IA */}
                    {imagenIA && (
                        <img
                            src={imagenIA}
                            alt="Imagen generada IA"
                            className="max-w-xs rounded mb-4 border"
                        />
                    )}

                    <button
                        type="submit"
                        disabled={guardando || generandoIA}
                        className={`bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-transform hover:scale-105 ${
                            guardando ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        <PlusCircle size={18} /> Crear Producto
                    </button>
                </form>

                {loading ? (
                    <p>Cargando productos...</p>
                ) : productos.length === 0 ? (
                    <p>No hay productos registrados.</p>
                ) : (
                    <ul className="space-y-3">
                        {productos.map((p) => (
                            <li
                                key={p._id}
                                className="bg-white p-4 rounded shadow flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-semibold">{p.nombreProducto}</p>
                                    <p>Precio: ${p.precio}</p>
                                    <p>Stock: {p.stock}</p>
                                    <p>Categoría: {p.categoria?.nombreCategoria || "N/A"}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => eliminarProducto(p._id)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Eliminar producto"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
