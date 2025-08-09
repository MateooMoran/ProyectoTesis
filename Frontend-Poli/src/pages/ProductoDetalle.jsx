import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import storeCarrito from '../context/storeCarrito';
import storeProductos from '../context/storeProductos';
import logo from '../assets/logo.png';
import storeProfile from '../context/storeProfile';
import storeAuth from '../context/storeAuth';
import { User, LogOut, ShoppingCart } from 'lucide-react';

const ProductoDetalle = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { agregarAlCarrito } = storeCarrito();
  const { productos, loadingProductos, error: errorProductos } = storeProductos();

  // Usuario y token
  const { user } = storeProfile();
  const { token, clearToken } = storeAuth();

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/productos/${id}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo cargar el producto');
        const data = await response.json();
        setProducto(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducto();
  }, [id]);

  const handleLogout = () => {
    clearToken();
  };

  if (loading) return <p className="text-center text-gray-500 text-lg mt-10">Cargando producto...</p>;
  if (error) return <p className="text-center text-red-600 text-lg mt-10">Error: {error}</p>;
  if (!producto) return <p className="text-center text-gray-500 text-lg mt-10">Producto no encontrado.</p>;

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link to="/dashboard">
            <img src={logo} alt="PoliVentas" className="w-36 h-12 object-cover" />
          </Link>
          {token && user?.rol === 'estudiante' && (
            <Link to="/dashboard/estudiante/carrito" className="relative">
              <ShoppingCart className="w-6 h-6 text-blue-800 hover:text-red-800 transition-colors" />
            </Link>
          )}
          {token ? (
            <div className="relative">
              <button className="flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors">
                <User className="w-5 h-5" />
                <span>{user?.nombre ? `Hola, ${user.nombre}` : 'Usuario'}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                <div className="px-4 py-2 text-sm text-blue-800 border-b">
                  <p><strong>Nombre:</strong> {user?.nombre || 'Usuario'}</p>
                  <p><strong>Rol:</strong> {user?.rol ? user.rol.toUpperCase() : 'N/A'}</p>
                </div>
                <Link to="/dashboard/perfil" className="block px-4 py-2 text-blue-800 hover:bg-blue-50">
                  Mi Perfil
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-blue-800 hover:bg-blue-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Salir
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="bg-blue-800 text-white py-2 px-6 rounded-xl font-semibold border hover:bg-red-800 transition-colors hover:scale-105 duration-300"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-blue-800 text-white py-2 px-6 rounded-xl font-semibold border hover:bg-red-800 transition-colors hover:scale-105 duration-300"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Espacio para header fijo */}
      <div className="h-20 sm:h-0"></div>

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
            <div className="flex items-center gap-4">
              <button
                onClick={() => agregarAlCarrito(producto)}
                className="bg-red-800 text-white py-3 px-8 rounded-full font-semibold text-lg hover:bg-orange-600 transition-transform transform hover:scale-105"
              >
                Agregar al carrito
              </button>
              <button className="border border-gray-300 text-gray-700 py-3 px-6 rounded-full font-semibold text-lg hover:bg-gray-100 transition">
                Comprar ahora
              </button>
            </div>
            <div className="text-sm text-gray-500">
              <p><span className="font-semibold">Envío:</span> Gratis en pedidos superiores a $50</p>
              <p><span className="font-semibold">Disponibilidad:</span> En stock</p>
              <p><span className="font-semibold">Vendedor:</span> PoliVentas Oficial</p>
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
                <Link to={`/productos/${prod._id}`} key={prod._id} className="block">
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
