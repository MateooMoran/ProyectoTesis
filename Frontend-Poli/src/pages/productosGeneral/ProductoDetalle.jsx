import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import storeCarrito from '../../context/storeCarrito';
import storeProductos from '../../context/storeProductos';
import storeProfile from '../../context/storeProfile';
import storeAuth from '../../context/storeAuth';
import Header from '../../layout/Header';

const ProductoDetalle = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);  // <-- cantidad aquí
  const navigate = useNavigate();

  const { agregarProducto } = storeCarrito();
  const { productos, loadingProductos, error: errorProductos } = storeProductos();

  const { token } = storeAuth();
  const { profile: user } = storeProfile();

  const handleAgregarAlCarrito = () => {
    agregarProducto(producto._id, cantidad);
    if (!token) {
      navigate(`/carrito/vacio`); // Redirigir a carrito vacío si no hay token
    } else {
      navigate(`/dashboard/estudiante/carrito`); // Redirigir al carrito si hay token
    }
  };

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/productos/${id}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo cargar el producto');
        const data = await response.json();
        console.log(data)
        setProducto(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducto();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500 text-lg mt-10">Cargando producto...</p>;
  if (error) return <p className="text-center text-red-600 text-lg mt-10">Error: {error}</p>;
  if (!producto) return <p className="text-center text-gray-500 text-lg mt-10">Producto no encontrado.</p>;

  return (
    <>
      <Header />

      {/* Detalle del producto */}
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20 sm:mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex justify-center">
            <img
              src={producto.imagen || 'https://via.placeholder.com/400x400?text=Sin+Imagen'}
              alt={producto.nombreProducto}
              className="w-full max-w-md h-auto object-contain rounded-lg shadow-md"
            />
          </div>
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{producto.nombreProducto}</h1>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-red-600">${producto.precio.toFixed(2)}</span>
              <span className="text-sm text-gray-500 line-through">${(producto.precio * 1.2).toFixed(2)}</span>
              <span className="text-sm text-green-600 font-semibold">20% OFF</span>
            </div>
            <p className="text-gray-600 text-base leading-relaxed">{producto.descripcion}</p>

            {/* Campo para seleccionar cantidad */}
            <div className="flex items-center gap-3">
              <label htmlFor="cantidad" className="font-semibold text-gray-700">Cantidad:</label>
              <input
                id="cantidad"
                type="number"
                min={1}
                max={producto.stock || 100} // si tienes stock, limita aquí
                value={cantidad}
                onChange={e => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= (producto.stock || 100)) setCantidad(val);
                }}
                className="w-20 border border-gray-300 rounded-md text-center py-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleAgregarAlCarrito}
                className="bg-red-800 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-transform transform hover:scale-105"
              >
                Agregar al carrito
              </button>
              <button
                onClick={handleAgregarAlCarrito}
                className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold text-lg hover:bg-gray-300  transition-transform transform hover:scale-105"
              >
                Comprar ahora
              </button>
            </div>
            <div className="text-sm text-gray-500">
              <p><span className="font-semibold">Envío:</span> Gratis en pedidos superiores a $50</p>
              <p>
                <span className="font-semibold">Disponibilidad:</span>{" "}
                {producto.stock > 0 ? "En stock" : "Agotado"}
              </p>
              <p>
                <span className="font-semibold">Vendedor:</span>{" "}
                {producto.vendedor ? `${producto.vendedor.nombre} ${producto.vendedor.apellido}` : "Desconocido"}
              </p>
              <p>
                <span className="font-semibold">Vendidos:</span>{" "}
                {producto.vendidos > 0 ? producto.vendidos : "Aún no se ha vendido"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Productos que te pueden interesar */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Productos que te pueden interesar</h2>
        {loadingProductos && <p className="text-center text-gray-700">Cargando productos...</p>}
        {errorProductos && <p className="text-center text-red-700">{errorProductos}</p>}
        {!loadingProductos && !errorProductos && productos.length === 0 && (
          <p className="text-center text-gray-700">No hay productos disponibles.</p>
        )}
        {!loadingProductos && !errorProductos && productos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos
              .filter(p => p._id !== id)
              .map((prod) => (
                <Link to={`/dashboard/productos/${prod._id}`} key={prod._id} className="block">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 p-4">
                    <div className="relative">
                      <img
                        src={prod.imagen || 'https://via.placeholder.com/400x400?text=Sin+Imagen'}
                        alt={prod.nombreProducto}
                        className="w-full h-48 object-contain rounded-md mb-3"
                      />
                      {prod.stock <= 5 && (
                        <span className="absolute top-2 left-2 bg-red-800 text-white text-xs font-semibold px-2 py-1 rounded">
                          ¡Solo {prod.stock} disponibles!
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-blue-800 line-clamp-2 h-12">{prod.nombreProducto}</h3>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-red-700">${prod.precio.toFixed(2)}</p>
                      {prod.descuento && (
                        <p className="text-sm text-gray-500 line-through">${(prod.precio * 1.2).toFixed(2)}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">{prod.descripcion}</p>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductoDetalle;
