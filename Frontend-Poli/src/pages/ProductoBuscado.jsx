import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

const placeholderImage = 'https://via.placeholder.com/150?text=Sin+Imagen';

const ProductosBuscados = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const { fetchDataBackend } = useFetch();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductosBuscados = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/productos/buscar?query=${encodeURIComponent(query)}`, {
          method: 'GET',
        });
        console.log('Productos buscados:', response);
        setProductos(response);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error al buscar productos');
        setLoading(false);
      }
    };
    if (query.trim()) {
      fetchProductosBuscados();
    }
  }, [query, fetchDataBackend]);

  return (
    <div className="bg-blue-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">
          Resultados para "{query}"
        </h2>
        {loading && <p className="text-center text-gray-700">Cargando productos...</p>}
        {error && (
          <p className="text-center text-red-700">{error}</p>
        )}
        {!loading && !error && productos.length === 0 && (
          <p className="text-center text-gray-700">No se encontraron productos para "{query}".</p>
        )}
        {!loading && !error && productos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <Link to={`/producto/${producto._id}`} className="block" key={producto._id}>
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 p-4">
                  <div className="relative">
                    <img
                      src={producto.imagen || placeholderImage}
                      alt={producto.nombreProducto}
                      className="w-full h-48 object-contain rounded-md mb-3"
                    />
                    {producto.stock <= 5 && (
                      <span className="absolute top-2 left-2 bg-red-800 text-white text-xs font-semibold px-2 py-1 rounded">
                        ¡Solo {producto.stock} disponibles!
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 line-clamp-2 h-12">{producto.nombreProducto}</h3>
                  <div className="mt-2">
                    <p className="text-lg font-bold text-red-700">${producto.precio.toFixed(2)}</p>
                    {producto.descuento && (
                      <p className="text-sm text-gray-500 line-through">${(producto.precio * 1.2).toFixed(2)}</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{producto.descripcion}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductosBuscados;