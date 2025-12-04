import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle, Pencil, Package, Image as ImageIcon, X } from "lucide-react";
import { alert } from '../../utils/alerts';
import getImageUrl from '../../utils/imageSrc';
import useFetch from '../../hooks/useFetch';
import { generateAvatar, convertBlobToBase64 } from "../../helpers/ConsultarAI";
import storeModelo3D from '../../context/storeModelo3D';


export default function ProductosVendedor() {
    const { fetchDataBackend } = useFetch();
    const { generando: generandoModelo, progreso: progresoModelo, estado: estadoModelo, iniciarGeneracion } = storeModelo3D();

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
    const [modeloUrl, setModeloUrl] = useState(""); // URL del modelo 3D generado
    const [intentosModelo, setIntentosModelo] = useState(0); // Intentos usados del modelo 3D
    const [activeTab, setActiveTab] = useState('crear'); // 'crear' or 'registrados'
    const [showModal, setShowModal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);

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

    // useEffect para recargar cuando el modelo esté completo
    useEffect(() => {
        if (progresoModelo === 100 && !generandoModelo) {
            const recargarProductos = async () => {
                try {
                    const urlProd = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/producto`;
                    const prodData = await fetchDataBackend(urlProd, {
                        method: "GET",
                        config: { headers },
                    });
                    setProductos(prodData);
                } catch (error) {
                    console.error('Error recargando productos:', error);
                }
            };
            recargarProductos();
        }
    }, [progresoModelo, generandoModelo, modeloUrl]);

    // Cargar categorías
    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                setLoadingCategorias(true);
                const urlCat = `${import.meta.env.VITE_BACKEND_URL}/admin/visualizar/categoria`;
                const catData = await fetchDataBackend(urlCat, {
                    method: "GET",
                    config: { headers },
                });
                setCategorias(catData);
            } catch (error) {
                alert({ icon: 'error', title: 'Error al cargar categorías' });
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

    const generarModelo3D = async (productoId) => {
        if (!productoId) {
            alert({ icon: 'error', title: 'Primero guarda el producto para generar el modelo 3D' });
            return;
        }

        console.log('🚀 [Frontend] Iniciando generación de modelo 3D para producto:', productoId);
        console.log('📝 [Frontend] Nombre del producto:', form.nombreProducto);

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/producto/${productoId}/generar-modelo`;
            console.log('📡 [Frontend] Enviando POST a:', url);

            // Iniciar generación en el backend
            const response = await fetchDataBackend(url, {
                method: 'POST',
                config: { headers },
            });

            console.log('✅ [Frontend] Respuesta del backend:', response);

            // Verificar si alcanzó el límite de intentos
            if (response.intentosRestantes === 0) {
                alert({
                    icon: 'warning',
                    title: 'Límite alcanzado',
                    text: response.msg || 'Has alcanzado el límite de intentos para este producto.'
                });
                return;
            }

            // Actualizar contador de intentos
            if (response.intentosUsados !== undefined) {
                setIntentosModelo(response.intentosUsados);
            }

            // Iniciar generación en el store global (esto activa el botón flotante)
            iniciarGeneracion(productoId, form.nombreProducto || 'Producto');
            console.log('🎯 [Frontend] Store global actualizado, botón flotante activado');

            // Mostrar mensaje inicial con contador de intentos
            const intentosMsg = response.intentosRestantes !== undefined
                ? `\n\nIntentos: ${response.intentosUsados}/3 (${response.intentosRestantes} restantes)`
                : '';

            alert({
                icon: 'info',
                title: 'Generación iniciada',
                text: `El modelo 3D está siendo generado. Serás notificado cuando esté listo. Puedes continuar navegando.${intentosMsg}`
            });

        } catch (error) {
            console.error('❌ [Frontend] Error al iniciar generación:', error);

            // Verificar si es error de límite de intentos
            if (error.status === 403 || error.intentosRestantes === 0) {
                alert({
                    icon: 'warning',
                    title: 'Límite alcanzado',
                    text: error.msg || 'Has alcanzado el límite de 3 intentos para generar el modelo 3D de este producto.'
                });
            } else {
                alert({ icon: 'error', title: 'Error al iniciar generación del modelo 3D' });
            }
        }
    };

    const generarImagenIA = async () => {
        if (!promptIA.trim()) {
            alert({ icon: 'error', title: 'Debes ingresar un prompt para generar la imagen' });
            return;
        }
        setGenerandoIA(true);
        setImagenArchivo(null);
        setPreviewUrl("");
        try {
            const blob = await generateAvatar(promptIA);
            const base64 = await convertBlobToBase64(blob);
            setImagenIA(base64);
            alert({ icon: 'success', title: 'Imagen IA generada' });
        } catch (error) {
            console.error(error);
            alert({ icon: 'error', title: 'Error al generar imagen IA' });
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
        setModeloUrl("");
        setIntentosModelo(0);
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
            alert({ icon: 'error', title: 'Todos los campos son obligatorios' });
            return;
        }
        if (Number(form.precio) < 0 || Number(form.stock) < 0) {
            alert({ icon: 'error', title: 'Precio y stock deben ser positivos' });
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

            // Si hay imagen de archivo, usamos FormData
            if (imagenArchivo) {
                // Si hay sólo imagen de archivo (sin modelo)
                body = new FormData();
                Object.entries(bodyData).forEach(([key, value]) => body.append(key, value));
                body.append('imagen', imagenArchivo);
            } else if (imagenIA) {
                // Solo imagen IA en base64 -> JSON
                bodyData.imagenIA = imagenIA;
                body = JSON.stringify(bodyData);
                config.headers['Content-Type'] = 'application/json';
            } else {
                body = JSON.stringify(bodyData);
                config.headers['Content-Type'] = 'application/json';
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
        setCurrentImage(getImageUrl(p));
        setModeloUrl(p.modelo_url || "");
        setIntentosModelo(p.intentosModelo3D || 0);
        setActiveTab('crear');
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
            alert({ icon: 'success', title: 'Producto eliminado' });
        } catch {
            alert({ icon: 'error', title: 'Error al eliminar producto' });
        }
    };

    return (
        <>

            <div className="mt-35 md:mt-18"></div>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 mb-10 sm:mb-30">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <h1 className="text-4xl font-bold text-gray-700">Gestionar Productos</h1>
                        </div>
                        <p className="text-gray-600">Crea y administra tu catálogo de productos</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center gap-3 mb-6">
                        <button
                            onClick={() => setActiveTab('crear')}
                            aria-current={activeTab === 'crear'}
                            className={`cursor-pointer px-5 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'crear'
                                    ? 'bg-blue-800 text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md hover:scale-105'
                                }`}
                        >
                            <PlusCircle className="w-4 h-4" />
                            Crear Producto
                        </button>

                        <button
                            onClick={() => setActiveTab('registrados')}
                            aria-current={activeTab === 'registrados'}
                            className={`cursor-pointer px-5 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'registrados'
                                    ? 'bg-blue-800 text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md hover:scale-105'
                                }`}
                        >
                            <Package className="w-4 h-4" />
                            Productos Registrados
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 pb-8 lg:h-[calc(100vh-220px)] ">
                        {/* Tab Crear - Layout con formulario y preview */}
                        {activeTab === 'crear' && (
                            <div className="lg:col-span-3 order-1 lg:order-1">
                                <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <PlusCircle className="w-6 h-6 text-blue-600" />
                                        {editingId ? "Editar Producto" : "Nuevo Producto"}
                                    </h3>

                                    {/* Layout de 2 columnas: formulario izq, preview der */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Columna Izquierda - Formulario */}
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

                                        {/* Columna Derecha - Preview */}
                                        <div className="space-y-4 flex flex-col justify-between h-full">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Vista Previa de Imagen
                                                </label>
                                                <div className="w-full h-48 bg-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                                                    {(imagenIA || previewUrl || (editingId && currentImage)) ? (
                                                        <img
                                                            src={imagenIA || previewUrl || currentImage || '/placeholder.png'}
                                                            alt="Preview"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="text-center text-gray-400">
                                                            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                                                            <p className="text-sm">Sin imagen</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Modelo 3D
                                                </label>
                                                {modeloUrl ? (
                                                    <div className="w-full bg-gray-50 rounded-lg border-2 border-gray-200 p-2">
                                                        <model-viewer
                                                            src={modeloUrl}
                                                            alt="Modelo 3D"
                                                            auto-rotate
                                                            camera-controls
                                                            style={{ width: '100%', height: '220px' }}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1 text-center">Modelo 3D disponible</p>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-48 bg-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                                                        <div className="text-center text-gray-400">
                                                            <Package className="w-12 h-12 mx-auto mb-2" />
                                                            <p className="text-sm">Sin modelo 3D</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {generandoModelo && (
                                                <div className="w-full bg-white rounded-lg border-2 border-blue-200 p-4 space-y-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-semibold text-gray-700">Generando modelo 3D</span>
                                                        <span className="text-sm font-bold text-blue-600">{progresoModelo}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-600 to-red-600 h-full transition-all duration-300 ease-out rounded-full"
                                                            style={{ width: `${progresoModelo}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-600 text-center italic">{estadoModelo}</p>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => generarModelo3D(editingId)}
                                                disabled={generandoModelo || !editingId || !(imagenIA || previewUrl || currentImage) || intentosModelo >= 3}
                                                className="w-full py-3 bg-blue-800 cursor-pointer text-white rounded-lg font-semibold hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md mt-2"

                                            >
                                                <Package className="w-5 h-5" />
                                                {generandoModelo ? "Generando Modelo..." : "Generar Modelo 3D"}
                                            </button>

                                            {editingId && (
                                                <div className="flex items-center justify-between text-xs">
                                                    <p className={`${intentosModelo >= 3 ? 'text-red-600 font-semibold' : 'text-gray-600'
                                                        }`}>
                                                        Intentos: {intentosModelo}/3 {intentosModelo >= 3 && '(Límite alcanzado)'}
                                                    </p>
                                                    {intentosModelo < 3 && (
                                                        <p className="text-green-600 font-medium">
                                                            {3 - intentosModelo} restantes
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {!editingId && (
                                                <p className="text-xs text-gray-500 text-center">Primero guarda el producto para generar el modelo 3D</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Modal de detalle de producto */}
                        {showModal && modalProduct && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                                <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
                                <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto p-4 z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <h2 className="text-2xl font-bold text-gray-800 truncate max-w-[80%]">{modalProduct.nombreProducto}</h2>
                                        <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800 p-2 rounded-md bg-gray-100 hover:bg-gray-200">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {modalProduct.modelo_url && (
                                        <div className="w-full flex items-center justify-center mb-4">
                                            <div className="w-full max-w-4xl">
                                                <model-viewer
                                                    src={modalProduct.modelo_url}
                                                    alt={modalProduct.nombreProducto}
                                                    auto-rotate
                                                    camera-controls
                                                    style={{ width: '100%', maxWidth: '840px', height: '420px', margin: '0 auto', display: 'block' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-1 flex flex-col gap-3">
                                            <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center">
                                                <img src={getImageUrl(modalProduct)} alt={modalProduct.nombreProducto} className="w-full h-56 object-cover rounded" />
                                            </div>

                                            {/* model-viewer moved to top to center across the modal */}
                                        </div>

                                        <div className="md:col-span-2 max-h-[60vh] overflow-auto pr-2">
                                            <p className="text-gray-700 mb-3 whitespace-pre-line">{modalProduct.descripcion}</p>
                                            <div className="flex gap-4 items-center mb-3">
                                                <span className="text-lg font-bold text-gray-800">${modalProduct.precio}</span>
                                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Stock: {modalProduct.stock}</span>
                                                <span className="text-sm text-gray-600">{modalProduct.categoria?.nombreCategoria}</span>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <button onClick={() => { setShowModal(false); setActiveTab('crear'); editarProducto(modalProduct); }} className="px-4 py-2 bg-blue-600 text-white rounded-md">Editar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Columna Derecha - Grid de Productos (solo en registrados) */}
                        {activeTab === 'registrados' && (
                            <div className={activeTab === 'registrados' ? 'lg:col-span-3 order-2 lg:order-2 flex flex-col lg:border lg:border-gray-200 lg:rounded-xl lg:bg-white lg:p-4 lg:overflow-hidden' : 'lg:col-span-2 order-2 lg:order-2 flex flex-col lg:border lg:border-gray-200 lg:rounded-xl lg:bg-white lg:p-4 lg:overflow-hidden'}>
                                <div className="mb-4 lg:mb-6 flex-shrink-0">
                                    <h3 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <Package className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                                        Productos Registrados
                                        <span className="ml-2 text-xs lg:text-sm font-normal bg-blue-100 text-blue-700 px-2 lg:px-3 py-1 rounded-full">
                                            {productos.length}
                                        </span>
                                    </h3>
                                </div>

                                {/* Contenedor con scroll solo en desktop */}
                                <div className="flex-1 overflow-y-auto">
                                    {(loadingProductos || loadingCategorias) ? (
                                        <div className="flex items-center justify-center py-20">
                                            <div className="text-center">
                                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                                <p className="text-gray-500">Cargando productos...</p>
                                            </div>
                                        </div>
                                    ) : productos.length === 0 ? (
                                        <div className="text-center py-20 bg-white lg:bg-transparent rounded-xl lg:rounded-none border-2 border-dashed border-gray-300">
                                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 text-lg font-medium">No hay productos registrados</p>
                                            <p className="text-gray-400 text-sm mt-2">Crea tu primer producto usando el formulario</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4 pr-2">
                                            {productos.map((p) => (
                                                <div
                                                    key={p._id}
                                                    className="bg-white rounded-lg lg:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group"
                                                >
                                                    <div className="relative">
                                                        {(p.imagenIA || p.imagen) ? (
                                                            <button onClick={() => { setModalProduct(p); setShowModal(true); }} className="w-full block">
                                                                <img
                                                                    src={getImageUrl(p)}
                                                                    alt={p.nombreProducto}
                                                                    className="w-full h-32 lg:h-40 object-contain bg-gray-50"
                                                                />
                                                            </button>
                                                        ) : (
                                                            <div className="w-full h-32 lg:h-40 bg-gray-200 flex items-center justify-center">
                                                                <Package className="w-8 lg:w-12 h-8 lg:h-12 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 right-2 flex gap-1">
                                                            <button
                                                                onClick={() => { editarProducto(p); setActiveTab('crear'); }}
                                                                className="bg-blue-600 text-white p-1.5 lg:p-2 rounded-lg hover:bg-blue-700 transition shadow-lg"
                                                                title="Editar"
                                                            >
                                                                <Pencil className="w-3 h-3 lg:w-4 lg:h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => eliminarProducto(p._id)}
                                                                className="bg-red-600 text-white p-1.5 lg:p-2 rounded-lg hover:bg-red-700 transition shadow-lg"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="p-3 lg:p-4">
                                                        <h4 className="font-bold text-gray-800 text-sm lg:text-lg mb-2 truncate">
                                                            <button onClick={() => { setModalProduct(p); setShowModal(true); }} className="text-left w-full">{p.nombreProducto}</button>
                                                        </h4>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-lg lg:text-2xl font-bold text-gray-600">
                                                                ${p.precio}
                                                            </span>
                                                            <span className={`px-2 py-0.5 lg:py-1 rounded-full text-xs font-semibold ${p.stock > 10
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
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}