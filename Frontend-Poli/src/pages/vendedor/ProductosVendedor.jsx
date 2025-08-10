import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import useFetch from '../../hooks/useFetch';
import Header from '../../layout/Header';
import { generateAvatar, convertBlobToBase64 } from "../../helpers/ConsultarAI";

export default function ProductosVendedor() {
    const { fetchDataBackend } = useFetch();
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [form, setForm] = useState({
        nombreProducto: "",
        precio: "",
        stock: "",
        descripcion: "",
        categoria: "",
    });
    const [imagenArchivo, setImagenArchivo] = useState(null);
    const [imagenIA, setImagenIA] = useState("");
    const [promptIA, setPromptIA] = useState("");
    const [generandoIA, setGenerandoIA] = useState(false);

    const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;
    const headers = {
        Authorization: `Bearer ${token}`,
    };

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
        } catch {
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
            setImagenIA("");
        }
    };

    const generarImagenIA = async () => {
        if (!promptIA.trim()) {
            toast.error("Debes ingresar un prompt para generar la imagen");
            return;
        }
        setGenerandoIA(true);
        setImagenArchivo(null);
        try {
            const blob = await generateAvatar(promptIA);
            const base64 = await convertBlobToBase64(blob);
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
                body = new FormData();
                body.append("nombreProducto", form.nombreProducto.trim());
                body.append("precio", Number(form.precio));
                body.append("stock", Number(form.stock));
                body.append("descripcion", form.descripcion.trim());
                body.append("categoria", form.categoria);
                body.append("imagen", imagenArchivo);
            } else if (imagenIA) {
                body = JSON.stringify({
                    nombreProducto: form.nombreProducto.trim(),
                    precio: Number(form.precio),
                    stock: Number(form.stock),
                    descripcion: form.descripcion.trim(),
                    categoria: form.categoria,
                    imagen: imagenIA,
                });
                config.headers["Content-Type"] = "application/json";
            } else {
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
                body: body,
                config,
            });

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
            <div className="max-w-5xl mx-auto p-6 lg:p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Crear Productos</h2>

                {/* Formulario */}
                <form
                    onSubmit={crearProducto}
                    className="bg-white p-6 rounded-lg shadow-lg mb-8 space-y-5"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre del Producto
                            </label>
                            <input
                                name="nombreProducto"
                                placeholder="Nombre del producto"
                                value={form.nombreProducto}
                                onChange={manejarCambio}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                disabled={guardando || generandoIA}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Precio
                            </label>
                            <input
                                name="precio"
                                type="number"
                                placeholder="Precio"
                                value={form.precio}
                                onChange={manejarCambio}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                disabled={guardando || generandoIA}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock
                            </label>
                            <input
                                name="stock"
                                type="number"
                                placeholder="Stock"
                                value={form.stock}
                                onChange={manejarCambio}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                disabled={guardando || generandoIA}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Categoría
                            </label>
                            <select
                                name="categoria"
                                value={form.categoria}
                                onChange={manejarCambio}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                disabled={guardando || generandoIA}
                            >
                                <option value="">Selecciona una categoría</option>
                                {categorias.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.nombreCategoria}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                        </label>
                        <textarea
                            name="descripcion"
                            placeholder="Descripción del producto"
                            value={form.descripcion}
                            onChange={manejarCambio}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
                            rows="4"
                            disabled={guardando || generandoIA}
                        />
                    </div>

                    {/* Subir imagen tradicional */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subir Imagen
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={manejarArchivo}
                            disabled={guardando || generandoIA}
                            className="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                        />
                    </div>

                    {/* Generar imagen IA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Generar Imagen con IA
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="text"
                                placeholder="Describe la imagen a generar con IA"
                                value={promptIA}
                                onChange={(e) => setPromptIA(e.target.value)}
                                disabled={guardando || generandoIA}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                            <button
                                type="button"
                                onClick={generarImagenIA}
                                disabled={guardando || generandoIA || !promptIA.trim()}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-transform hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {generandoIA ? "Generando..." : "Generar Imagen"}
                            </button>
                        </div>
                    </div>

                    {/* Preview imagen IA */}
                    {imagenIA && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vista Previa
                            </label>
                            <img
                                src={imagenIA}
                                alt="Imagen generada IA"
                                className="max-w-xs rounded-lg shadow-md border border-gray-200"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={guardando || generandoIA}
                        className={`w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-transform hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <PlusCircle size={20} /> Crear Producto
                    </button>
                </form>

                {/* Lista de productos */}
                <h2
                    id="titulo-productos-registrados"
                    className="text-2xl font-bold text-gray-800 mb-6"
                >
                    Productos Registrados
                </h2>

                {loading ? (
                    <div className="text-center text-gray-600">Cargando productos...</div>
                ) : productos.length === 0 ? (
                    <div className="text-center text-gray-600">No hay productos registrados.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {productos.map((p) => (
                            <div
                                key={p._id}
                                className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {p.nombreProducto}
                                        </h3>
                                        <p className="text-gray-600">Precio: ${p.precio}</p>
                                        <p className="text-gray-600">Stock: {p.stock}</p>
                                        <p className="text-gray-600">
                                            Categoría: {p.categoria?.nombreCategoria || "N/A"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => eliminarProducto(p._id)}
                                        className="text-red-500 hover:text-red-700 transition"
                                        title="Eliminar producto"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}