import React, { useEffect, useState } from "react";
import useFetch from '../../hooks/useFetch';
import { toast } from "react-toastify";
import Header from '../../layout/Header';


export default function HistorialVentas() {
    const { fetchDataBackend } = useFetch();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    useEffect(() => {
        const cargarVentas = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/historial-ventas`;
                const data = await fetchDataBackend(url, {
                    method: "GET",
                    config: { headers },
                });
                setVentas(data);
            } catch (error) {
                toast.error("Error al cargar historial de ventas");
            } finally {
                setLoading(false);
            }
        };
        cargarVentas();
    }, []);

    return (
        <>
        <Header />
        <div className="max-w-5xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Historial de Ventas</h2>

            {loading ? (
                <p>Cargando historial...</p>
            ) : ventas.length === 0 ? (
                <p>No tienes ventas registradas.</p>
            ) : (
                <ul className="space-y-4">
                    {ventas.map((venta) => (
                        <li
                            key={venta._id}
                            className="border rounded p-4 shadow bg-white"
                        >
                            <p>
                                <strong>Comprador:</strong> {venta.comprador?.nombre} {venta.comprador?.apellido}
                            </p>
                            <p>
                                <strong>Fecha:</strong>{" "}
                                {new Date(venta.createdAt).toLocaleString()}
                            </p>
                            <p>
                                <strong>Productos:</strong>
                            </p>
                            <ul className="list-disc ml-6">
                                {venta.productos.map(({ producto, cantidad }) => (
                                    <li key={producto._id}>
                                        {producto.nombreProducto} - Cantidad: {cantidad} - Precio: ${producto.precio}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        </>
    );
}
