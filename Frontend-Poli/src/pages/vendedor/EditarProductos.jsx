import React from "react";
import { Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from '../../layout/Header';

function EditarProductos({ productos, loading, onDelete }) {
    const navigate = useNavigate();

    const handleEdit = (product) => {
        // Navigate to the update route, passing the product ID in the URL
        navigate(`/vendedor/visualizar/producto`, {
            state: { product }, // Pass product data via state for the update form
        });
    };

    return (
        <>
            <Header />
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
                            {(p.imagenIA || p.imagen) && (
                                <img
                                    src={p.imagenIA || p.imagen}
                                    alt={p.nombreProducto}
                                    className="w-full h-48 object-cover rounded-md mb-4"
                                />
                            )}
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
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => onDelete(p._id)}
                                        className="text-red-500 hover:text-red-700 transition"
                                        title="Eliminar producto"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="text-blue-500 hover:text-blue-700 transition"
                                        title="Actualizar producto"
                                    >
                                        <Pencil size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

export default EditarProductos;