import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import Header from '../../layout/Header';
import { toast } from 'react-toastify';
import Footer from '../../layout/Footer';

const placeholderImage = 'https://via.placeholder.com/150?text=Sin+Imagen';

const CategoriaProductos = () => {
  const { id } = useParams();
  const { fetchDataBackend } = useFetch();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoriaNombre, setCategoriaNombre] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductosPorCategoria = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/productos/categoria/${id}`;
        console.log('Solicitando productos de categoría:', url);
        const response = await fetchDataBackend(url, { method: 'GET' });
        console.log('Respuesta de productos por categoría:', response);
        if (!response || response.length === 0) {
          setError('No se encontraron productos para esta categoría');
          setProductos([]);
          setCategoriaNombre('');
        } else {
          setProductos(response);
          setCategoriaNombre(response[0]?.categoria?.nombreCategoria || 'Categoría');
        }
      } catch (err) {
        const errorMessage = err.message || 'Error al cargar los productos';
        console.error('Error en fetchProductosPorCategoria:', errorMessage, err);
        setError(errorMessage);
        setProductos([]);
        setCategoriaNombre('');
      } finally {
        setLoading(false);
      }
    };
    fetchProductosPorCategoria();
  }, [id]);

  const handleClickProducto = (producto) => {
    
    const storedData = JSON.parse(localStorage.getItem('auth-token'));
    const token = storedData?.state?.token;
    console.log(token);
    

    if (token) {
      navigate(`/dashboard/productos/${producto._id}`);
      toast.success(`Producto ${producto.nombreProducto} seleccionado`);
    } else {
      navigate(`/productos/${producto._id}`);
    }
  };

  return (
    <>
      <Header />
      {/* Espacio para compensar header fijo */}
      <div className="h-15 sm:h-7 mb-6" />

      <div className="bg-blue-50 min-h-screen py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">
            Productos en {categoriaNombre}
          </h2>

          {loading && <p className="text-center text-gray-700">Cargando productos...</p>}
          {error && <p className="text-center text-red-700">{error}</p>}
          {!loading && !error && productos.length === 0 && (
            <p className="text-center text-gray-700">No hay productos en esta categoría.</p>
          )}
          {!loading && !error && productos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productos.map((producto) => (
                <div
                  key={producto._id}
                  onClick={() => handleClickProducto(producto)}
                  className="block cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleClickProducto(producto);
                  }}
                >
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer></Footer>
    </>
  );
};

export default CategoriaProductos;
