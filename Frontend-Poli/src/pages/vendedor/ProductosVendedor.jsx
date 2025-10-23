import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle, Pencil, Package, Image as ImageIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import useFetch from '../../hooks/useFetch';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import { generateAvatar, convertBlobToBase64 } from "../../helpers/ConsultarAI";


export default function ProductosVendedor() {
    const { fetchDataBackend } = useFetch();

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [loadingProductos, setLoadingProductos] = useState(true);
    const [loadingCategorias, setLoadingCategorias] = useState(true);

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
    const [editingId, setEditingId] = useState(null);
    const [currentImage, setCurrentImage] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");

    const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    // Cargar productos
    useEffect(() => {
        const cargarProductos = async () => {
            try {
                setLoadingProductos(true);
                const urlProd = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/producto`;
                const prodData = await fetchDataBackend(urlProd, {
                    method: "GET",
                    config: { headers },
                });
                setProductos(prodData);
            } catch (error) {
                console.log(error);
            } finally {
                setLoadingProductos(false);
            }
        };
        cargarProductos();
    }, []);

    // Cargar categorías
    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                setLoadingCategorias(true);
                const urlCat = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/categoria`;
                const catData = await fetchDataBackend(urlCat, {
                    method: "GET",
                    config: { headers },
                });
                setCategorias(catData);
            } catch (error) {
                toast.error("Error al cargar categorías");
            } finally {
                setLoadingCategorias(false);
            }
        };
        cargarCategorias();
    }, []);

    const manejarCambio = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const manejarArchivo = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setImagenArchivo(file);
            setPreviewUrl(URL.createObjectURL(file));
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
        setPreviewUrl("");
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

    const resetForm = () => {
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
        setPreviewUrl("");
        setCurrentImage("");
        setEditingId(null);
    };

    const submitProducto = async (e) => {
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
            const isUpdate = !!editingId;
            const url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/${isUpdate ? 'actualizar' : 'crear'}/producto${isUpdate ? `/${editingId}` : ''}`;
            const method = isUpdate ? "PUT" : "POST";

            const bodyData = {
                nombreProducto: form.nombreProducto.trim(),
                precio: Number(form.precio),
                stock: Number(form.stock),
                descripcion: form.descripcion.trim(),
                categoria: form.categoria,
            };

            let body;
            let config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            if (imagenArchivo) {
                body = new FormData();
                Object.entries(bodyData).forEach(([key, value]) => body.append(key, value));
                body.append("imagen", imagenArchivo);
            } else {
                if (imagenIA) {
                    bodyData.imagenIA = imagenIA;
                }
                body = JSON.stringify(bodyData);
                config.headers["Content-Type"] = "application/json";
            }

            await fetchDataBackend(url, {
                method,
                body,
                config,
            });

            resetForm();

            const urlProd = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/producto`;
            const prodData = await fetchDataBackend(urlProd, {
                method: "GET",
                config: { headers },
            });
            setProductos(prodData);

        } catch {
            // Error manejado en fetchDataBackend
        } finally {
            setGuardando(false);
        }
    };

    const editarProducto = (p) => {
        setForm({
            nombreProducto: p.nombreProducto,
            precio: p.precio,
            stock: p.stock,
            descripcion: p.descripcion,
            categoria: p.categoria?._id || "",
        });
        setEditingId(p._id);
        setImagenArchivo(null);
        setImagenIA("");
        setPromptIA("");
        setPreviewUrl("");
        setCurrentImage(p.imagenIA || p.imagen || "");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const eliminarProducto = async (id) => {
        if (!window.confirm("¿Eliminar este producto?")) return;
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/eliminar/producto/${id}`;
            await fetchDataBackend(url, {
                method: "DELETE",
                config: { headers },
            });
            setProductos(productos.filter((p) => p._id !== id));
            toast.success("Producto eliminado");
        } catch {
            toast.error("Error al eliminar producto");
        }
    };

    return (
        <>
            <Header />
            <div className="h-16" />
            <ToastContainer />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <Package className="w-10 h-10 text-blue-600" />
                            <h1 className="text-4xl font-bold text-gray-800">Gestionar Productos</h1>
                        </div>
                        <p className="text-gray-600">Crea y administra tu catálogo de productos</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Columna Izquierda - Formulario */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 sticky top-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <PlusCircle className="w-6 h-6 text-blue-600" />
                                    {editingId ? "Editar Producto" : "Nuevo Producto"}
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nombre del Producto
                                        </label>
                                        <input
                                            name="nombreProducto"
                                            placeholder="Ej: Laptop HP"
                                            value={form.nombreProducto}
                                            onChange={manejarCambio}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                            disabled={guardando || generandoIA}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Precio ($)
                                            </label>
                                            <input
                                                name="precio"
                                                type="number"
                                                placeholder="0.00"
                                                value={form.precio}
                                                onChange={manejarCambio}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                disabled={guardando || generandoIA}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Stock
                                            </label>
                                            <input
                                                name="stock"
                                                type="number"
                                                placeholder="0"
                                                value={form.stock}
                                                onChange={manejarCambio}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                disabled={guardando || generandoIA}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Categoría
                                        </label>
                                        <select
                                            name="categoria"
                                            value={form.categoria}
                                            onChange={manejarCambio}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                            disabled={guardando || generandoIA || loadingCategorias}
                                        >
                                            <option value="">Selecciona categoría</option>
                                            {categorias.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.nombreCategoria}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Descripción
                                        </label>
                                        <textarea
                                            name="descripcion"
                                            placeholder="Describe tu producto..."
                                            value={form.descripcion}
                                            onChange={manejarCambio}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                                            rows="3"
                                            disabled={guardando || generandoIA}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Subir Imagen
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={manejarArchivo}
                                            disabled={guardando || generandoIA}
                                            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:font-medium transition cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            O genera con IA
                                        </label>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Describe la imagen..."
                                                value={promptIA}
                                                onChange={(e) => setPromptIA(e.target.value)}
                                                disabled={guardando || generandoIA}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                            />
                                            <button
                                                type="button"
                                                onClick={generarImagenIA}
                                                disabled={guardando || generandoIA || !promptIA.trim()}
                                                className="w-full py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                                {generandoIA ? "Generando..." : "Generar Imagen"}
                                            </button>
                                        </div>
                                    </div>

                                    {(imagenIA || previewUrl || (editingId && currentImage)) && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Vista Previa
                                            </label>
                                            <img
                                                src={imagenIA || previewUrl || currentImage}
                                                alt="Preview"
                                                className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            onClick={submitProducto}
                                            disabled={guardando || generandoIA}
                                            className="flex-1 py-3 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                                        >
                                            <PlusCircle className="w-5 h-5" />
                                            {editingId ? "Actualizar" : "Crear Producto"}
                                        </button>
                                        {editingId && (
                                            <button
                                                onClick={resetForm}
                                                className="px-4 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha - Grid de Productos */}
                        <div className="lg:col-span-2">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <Package className="w-6 h-6 text-blue-600" />
                                    Productos Registrados
                                    <span className="ml-2 text-sm font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                        {productos.length}
                                    </span>
                                </h3>
                            </div>

                            {(loadingProductos || loadingCategorias) ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                        <p className="text-gray-500">Cargando productos...</p>
                                    </div>
                                </div>
                            ) : productos.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
                                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg font-medium">No hay productos registrados</p>
                                    <p className="text-gray-400 text-sm mt-2">Crea tu primer producto usando el formulario</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {productos.map((p) => (
                                        <div
                                            key={p._id}
                                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group"
                                        >
                                            <div className="relative">
                                                {(p.imagenIA || p.imagen) ? (
                                                    <img
                                                        src={p.imagenIA || p.imagen}
                                                        alt={p.nombreProducto}
                                                        className="w-full h-40 object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                                                        <Package className="w-12 h-12 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    <button
                                                        onClick={() => editarProducto(p)}
                                                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition shadow-lg"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarProducto(p._id)}
                                                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition shadow-lg"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <h4 className="font-bold text-gray-800 text-lg mb-2 truncate">
                                                    {p.nombreProducto}
                                                </h4>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-2xl font-bold text-blue-600">
                                                        ${p.precio}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        p.stock > 10 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : p.stock > 0 
                                                                ? 'bg-yellow-100 text-yellow-700' 
                                                                : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        Stock: {p.stock}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                    {p.categoria?.nombreCategoria || "Sin categoría"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}