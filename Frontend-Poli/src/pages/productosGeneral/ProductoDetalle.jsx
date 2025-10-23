import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import storeCarrito from '../../context/storeCarrito';
import storeProductos from '../../context/storeProductos';
import storeProfile from '../../context/storeProfile';
import storeAuth from '../../context/storeAuth';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import CarruselProductos from '../productosGeneral/CarruselProductos';
import { FaStar, FaHeart, FaRegHeart, FaShoppingCart, FaUser, FaCheckCircle, FaCube } from 'react-icons/fa';
import useFetch from '../../hooks/useFetch';

// ✅ Hook de favoritos reutilizable
const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const { token } = storeAuth();
  const { fetchDataBackend } = useFetch();

  useEffect(() => {
    const loadFavorites = async () => {
      if (token) {
        try {
          const data = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/favoritos`, {
            method: 'GET',
            config: { headers: { Authorization: `Bearer ${token}` } }
          });
          setFavorites(data.favoritos || []);
        } catch { }
      } else {
        const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(localFavs);
      }
    };
    loadFavorites();
  }, [token]);

  const toggleFavorite = async (productId) => {
    if (token) {
      try {
        const response = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/favorito/${productId}`, {
          method: 'PATCH',
          config: { headers: { Authorization: `Bearer ${token}` } }
        });

        if (response.msg.includes('agregado')) {
          setFavorites(prev => [...prev, { _id: productId }]);
          toast.success('Producto agregado a favoritos');
        } else if (response.msg.includes('removido')) {
          setFavorites(prev => prev.filter(p => p._id !== productId));
          toast.success('Producto removido de favoritos');
        }
      } catch { }
    } else {
      let localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (localFavs.includes(productId)) {
        localFavs = localFavs.filter(id => id !== productId);
        toast.success('Producto removido de favoritos');
      } else {
        localFavs.push(productId);
        toast.success('Producto agregado a favoritos');
      }
      localStorage.setItem('favorites', JSON.stringify(localFavs));
      setFavorites(localFavs);
    }
  };

  const isFavorite = (productId) => {
    if (token) return favorites.some(fav => fav._id === productId);
    return favorites.includes(productId);
  };

  return { favorites, isFavorite, toggleFavorite };
};

const ProductoDetalle = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [reseñas, setReseñas] = useState([]);
  const [ver3D, setVer3D] = useState(false);
  const navigate = useNavigate();

  const { agregarProducto } = storeCarrito();
  const { productos } = storeProductos();
  const { user } = storeProfile();
  const { token } = storeAuth();

  const { isFavorite, toggleFavorite } = useFavorites();

  // ✅ PRODUCTOS RELACIONADOS
  const productosRelacionados = productos
    .filter(p => p.categoria?._id === producto?.categoria?._id && p._id !== id)
    .slice(0, 8);

  const handleAgregarAlCarrito = () => {
    agregarProducto(producto._id, cantidad);
    toast.success(`✨ ${producto.nombreProducto} agregado al carrito`);
    if (!token) navigate('/carrito/vacio');
    else navigate(`/dashboard/productos/${producto._id}`);
  };

  const toggle3D = () => setVer3D(!ver3D);

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
        setReseñas([
          { usuario: 'Ana López', rating: 5, comentario: '¡Excelente calidad!', fecha: '2025-10-10' },
          { usuario: 'Carlos Ruiz', rating: 4, comentario: 'Muy bueno, llegó rápido', fecha: '2025-10-08' },
          { usuario: 'María Gómez', rating: 5, comentario: 'Lo recomiendo 100%', fecha: '2025-10-05' }
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducto();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-50"><p className="text-center text-gray-500 text-lg mt-20">Cargando producto...</p></div>;
  if (error) return <div className="min-h-screen bg-gray-50"><p className="text-center text-red-600 text-lg mt-20">Error: {error}</p></div>;
  if (!producto) return <div className="min-h-screen bg-gray-50"><p className="text-center text-gray-500 text-lg mt-20">Producto no encontrado.</p></div>;

  const fav = isFavorite(producto._id);

  return (
    <>
      <Header />
      <div className="h-12 mb-14" />

      <div className="min-h-screen bg-gray-50">
        {/* 🔥 1. IMAGEN IZQUIERDA ↔ MODEL-VIEWER 3D */}
        <section className="py-3 sm:pb-8 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* ✅ IMAGEN ↔ 3D */}
              <div className="flex flex-col items-center lg:items-start">
                {ver3D && producto.modelo_url ? (
                  <model-viewer
                    src={producto.modelo_url}
                    alt={producto.nombreProducto}
                    auto-rotate
                    camera-controls
                    ar
                    shadow-intensity="1"
                    exposure="1"
                    style={{
                      width: '100%',
                      height: '500px',
                      borderRadius: '16px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                  />
                ) : (
                  <img
                    src={producto.imagen}
                    alt={producto.nombreProducto}
                    className="w-full max-w-md h-auto object-contain rounded-2xl shadow-2xl"
                  />
                )}
                {producto?.modelo_url && (
                  <button
                    onClick={toggle3D}
                    className="mt-4 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg p-3 w-full max-w-md"
                  >
                    <FaCube className="w-6 h-6" />
                    {ver3D ? 'Regresar a la Imagen' : 'Ver modelo 3D'}
                  </button>
                )}
              </div>

              {/* 🔹 INFORMACIÓN DEL PRODUCTO */}
              <div className="space-y-6">
                <h1 className="text-4xl font-bold text-gray-700">{producto.nombreProducto}</h1>

                {/* PRECIO + RATING */}
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-black">${producto.precio.toFixed(2)}</span>
                  {producto.descuento && (
                    <span className="text-xl text-gray-500 line-through">${(producto.precio * 1.2).toFixed(2)}</span>
                  )}
                  <div className="flex items-center gap-1 text-yellow-400 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={`w-5 h-5 ${i < 4.5 ? 'fill-current' : ''}`} />
                    ))}
                    <span className="ml-2 text-gray-600">(13 reseñas)</span>
                  </div>
                </div>

                {/* DESCRIPCIÓN */}
                <p className="text-gray-600 text-lg leading-relaxed">{producto.descripcion}</p>

                {/* CANTIDAD */}
                <div className="flex items-center gap-4">
                  <label className="font-semibold text-gray-700">Cantidad:</label>
                  <input
                    type="number"
                    min={1}
                    max={producto.stock}
                    value={cantidad}
                    onChange={e => setCantidad(Math.max(1, Math.min(producto.stock, Number(e.target.value))))}
                    className="w-20 h-12 border-2 border-gray-300 rounded-xl text-center text-lg focus:border-blue-500"
                  />
                  <span className="text-gray-600">de {producto.stock} disponibles</span>
                </div>

                {/* BOTONES */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    onClick={handleAgregarAlCarrito}
                    className="flex-1 h-14 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 shadow-lg p-3"
                  >
                    <FaShoppingCart className="w-6 h-6" /> Agregar al Carrito
                  </button>

                  {/* ❤️ FAVORITOS */}
                  <button
                    onClick={() => toggleFavorite(producto._id)}
                    className={`h-14 w-full sm:w-14 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${fav ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 hover:bg-red-500 hover:text-white'}`}
                  >
                    {fav ? <FaHeart className="w-6 h-6" /> : <FaRegHeart className="w-6 h-6" />}
                  </button>
                </div>

                {/* INFO ADICIONAL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <FaCheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">En Stock</p>
                      <p className="text-sm text-green-600">{producto.stock} unidades</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-zinc-100 rounded-xl">
                    <FaUser className="w-6 h-6 text-zinc-600" />
                    <div>
                      <p className="font-semibold text-zinc-800">Vendedor</p>
                      <p className="text-sm text-zinc-600">{producto.vendedor?.nombre || 'PoliVentas'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🔥 2. RESEÑAS ABAJO */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-12">Reseñas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reseñas.map((reseña, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, j) => (
                        <FaStar key={j} className={`w-5 h-5 ${j < reseña.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{reseña.fecha}</span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">{reseña.usuario}</p>
                  <p className="text-gray-600">{reseña.comentario}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🔥 3. PRODUCTOS RELACIONADOS */}
        {productosRelacionados.length > 0 && (
          <section className="py-8 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-12">Productos Relacionados</h2>
              <CarruselProductos productos={productosRelacionados} slidesPerView={4} showDots={false} />
            </div>
          </section>
        )}
      </div>

      <Footer />
    </>
  );
};

export default ProductoDetalle;
