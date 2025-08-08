import { useEffect } from "react";
import storeCarrito from "../context/storeCarrito";

export default function CarritoPage() {
  const { carrito, fetchCarrito, disminuirCantidad, eliminarProducto, vaciarCarrito, loading } =
    storeCarrito();

  useEffect(() => {
    fetchCarrito();
  }, []);

  if (loading) return <p className="text-center">Cargando carrito...</p>;

  if (!carrito || !carrito.productos?.length) {
    return <p className="text-center mt-6">No tienes productos en el carrito.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Tu Carrito</h2>

      {carrito.productos.map((item) => (
        <div
          key={item._id}
          className="flex items-center justify-between border-b py-3"
        >
          <div className="flex items-center gap-4">
            <img
              src={item.producto.imagen}
              alt={item.producto.nombreProducto}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <p className="font-semibold">{item.producto.nombreProducto}</p>
              <p className="text-gray-600">Cantidad: {item.cantidad}</p>
              <p className="text-sm text-gray-500">
                Precio: ${item.precioUnitario} | Subtotal: ${item.subtotal}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => disminuirCantidad(item._id)}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
            >
              -
            </button>
            <button
              onClick={() => eliminarProducto(item._id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-between mt-4 font-bold">
        <span>Total:</span>
        <span>${carrito.total}</span>
      </div>

      <button
        onClick={vaciarCarrito}
        className="mt-4 w-full bg-red-700 text-white py-2 rounded hover:bg-red-800 transition"
      >
        Vaciar carrito
      </button>
    </div>
  );
}
