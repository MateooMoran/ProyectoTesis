import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle, Edit2 } from "lucide-react";
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

    const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;
    const headers = {
        "Content-Type": "application/json",
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

    const crearProducto = async (e) => {
        e.preventDefault();
        // Validaciones básicas
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
            await fetchDataBackend(url, {
                method: "POST",
                body: {
                    nombreProducto: form.nombreProducto.trim(),
                    precio: Number(form.precio),
                    stock: Number(form.stock),
                    descripcion: form.descripcion.trim(),
                    categoria: form.categoria,
                },
                config: { headers },
            });
            toast.success("Producto creado");
            setForm({
                nombreProducto: "",
                precio: "",
                stock: "",
                descripcion: "",
                categoria: "",
            });
            cargarProductosYCategorias();
        } catch {
            // Error mostrado por fetchDataBackend
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
            // Error manejado por fetchDataBackend
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
                    disabled={guardando}
                />
                <input
                    name="precio"
                    type="number"
                    placeholder="Precio"
                    value={form.precio}
                    onChange={manejarCambio}
                    className="w-full border rounded p-2"
                    disabled={guardando}
                />
                <input
                    name="stock"
                    type="number"
                    placeholder="Stock"
                    value={form.stock}
                    onChange={manejarCambio}
                    className="w-full border rounded p-2"
                    disabled={guardando}
                />
                <textarea
                    name="descripcion"
                    placeholder="Descripción"
                    value={form.descripcion}
                    onChange={manejarCambio}
                    className="w-full border rounded p-2"
                    disabled={guardando}
                />
                <select
                    name="categoria"
                    value={form.categoria}
                    onChange={manejarCambio}
                    className="w-full border rounded p-2"
                    disabled={guardando}
                >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.nombreCategoria}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    disabled={guardando}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
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
                                {/* Aquí podrías agregar botón para editar */}
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
