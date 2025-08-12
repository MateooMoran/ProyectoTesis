import React, { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { toast } from "react-toastify";
import Header from "../../layout/Header";
import { ToastContainer } from "react-toastify";

export default function HistorialVentas() {
  const { fetchDataBackend } = useFetch();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("auth-token"))?.state?.token;
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/historial-ventas`;
        const data = await fetchDataBackend(url, {
          method: "GET",
          config: { headers },
        });
        setVentas(data);
      } catch {
        toast.error("Error al cargar historial de ventas");
      } finally {
        setLoading(false);
      }
    };
    cargarVentas();
  }, []);

  const marcarComoPagado = async (idVenta) => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/ventas/${idVenta}/pagar`;
      await fetchDataBackend(url, {
        method: "PUT",
        config: { headers },
      });

      setVentas((prev) =>
        prev.map((v) => (v._id === idVenta ? { ...v, estado: "pagado" } : v))
      );

    } catch {
      console.log("No se pudo actualizar la venta");
    }
  };

  return (
    <>
      <Header />

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Historial de Ventas</h2>

        {loading ? (
          <p className="text-gray-500">Cargando historial...</p>
        ) : ventas.length === 0 ? (
          <p className="text-gray-500">No tienes ventas registradas.</p>
        ) : (
          <div className="grid gap-6">
            {ventas.map((venta) => (
              <div
                key={venta._id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
              >
                {/* Encabezado */}
                <div className="flex justify-between items-center pb-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Comprador</p>
                    <p className="text-lg font-semibold">
                      {venta.comprador?.nombre} {venta.comprador?.apellido}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        venta.estado === "pagado"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {venta.estado.toUpperCase()}
                    </span>
                    {venta.estado === "pendiente" && (
                      <button
                        onClick={() => marcarComoPagado(venta._id)}
                        className="cursor-pointer bg-blue-300 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold hover:bg-blue-500 hover:text-blue-200 transition"
                      >
                        Marcar como pagado
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de productos */}
                <div className="space-y-4">
                  {venta.productos.map(
                    ({ producto, cantidad, precioUnitario, subtotal }) => (
                      <div
                        key={producto._id}
                        className="flex items-center gap-4 pb-3 last:border-none"
                      >
                        <img
                          src={producto.imagen}
                          alt={producto.nombreProducto}
                          className="w-16 h-16 rounded-lg object-cover border"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{producto.nombreProducto}</p>
                          <p className="text-sm text-gray-500">
                            Cantidad: {cantidad} × ${precioUnitario}
                          </p>
                        </div>
                        <div className="text-right font-semibold">${subtotal}</div>
                      </div>
                    )
                  )}
                </div>

                {/* Total y método de pago */}
                <div className="flex justify-between items-center mt-4 pt-4">
                  <p className="text-sm text-gray-500">
                    Método de pago:{" "}
                    <span className="font-bold">
                      {venta.metodoPago.charAt(0).toUpperCase() +
                        venta.metodoPago.slice(1).toLowerCase()}
                    </span>
                  </p>
                  <p className="text-lg font-bold text-blue-800">Total: ${venta.total}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
}
