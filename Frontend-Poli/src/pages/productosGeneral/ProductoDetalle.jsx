import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import storeCarrito from '../../context/storeCarrito';
import storeProductos from '../../context/storeProductos';
import storeProfile from '../../context/storeProfile';
import storeAuth from '../../context/storeAuth';
import CarruselProductos from '../productosGeneral/CarruselProductos';
import BotonFavorito from '../../components/BotonFavorito';
import { FaStar, FaCheckCircle, FaCube, FaCreditCard, FaUser } from 'react-icons/fa';
import { Banknote, CreditCardIcon, DollarSign, QrCode, X, HandCoins } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';

const ProductoDetalle = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [reseñas, setReseñas] = useState([]);
  const [ver3D, setVer3D] = useState(false);
  const [modalMetodosPago, setModalMetodosPago] = useState(false);
  const [metodosPago, setMetodosPago] = useState({ transferencia: null, qr: null, efectivo: null });
  const [loadingMetodos, setLoadingMetodos] = useState(false);
  const navigate = useNavigate();

  const { agregarProducto } = storeCarrito();
  const { productos } = storeProductos();
  const { user } = storeProfile();
  const { token } = storeAuth();

  const productosRelacionados = productos
    .filter(p => p.categoria?._id === producto?.categoria?._id && p._id !== id)
    .slice(0, 8);

  const handleAgregarAlCarrito = () => {
    agregarProducto(producto._id, cantidad);
    if (!token) navigate('/carrito/procesopago');
    else navigate(`/dashboard/productos/${producto._id}`);
  };

  const toggle3D = () => setVer3D(!ver3D);

  // VISUALIZAR MÉTODOS DE PAGO - PRODUCTO DETALLE
  const cargarMetodosPago = async (vendedorId) => {
    if (!vendedorId) return;
    setLoadingMetodos(true);
    try {
      const tipos = ['transferencia', 'qr', 'efectivo'];
      const resultados = {};

      for (const tipo of tipos) {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/vendedor/pago/${tipo}?vendedorId=${vendedorId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!res.ok) {
            resultados[tipo] = null;
            continue;
          }

          const data = await res.json();
          resultados[tipo] = data.metodos?.[0] || null;
        } catch (err) {
          console.error(`Error cargando ${tipo}:`, err);
          resultados[tipo] = null;
        }
      }

      setMetodosPago(resultados);
    } catch (err) {
      console.error('Error general:', err);
      toast.error('No se pudieron cargar los métodos de pago');
    } finally {
      setLoadingMetodos(false);
    }
  };

  const abrirModalMetodosPago = () => {
    setModalMetodosPago(true);
    if (producto?.vendedor?._id) {
      cargarMetodosPago(producto.vendedor._id);
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
        console.log(data);
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

  return (
    <>
      <Header />
      <div className="mt-40 md:mt-15"></div>
      <div className="min-h-screen bg-gray-50 mt-24 md:mt-10">
        <section className="py-3 sm:pb-8 bg-blue-50">
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

                {/* ✅ BOTONES CON BOTON FAVORITO */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    onClick={handleAgregarAlCarrito}
                    className="flex-1 h-14 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-300 shadow-lg p-3"
                  >
                    <HandCoins className="w-6 h-6" /> Proceder al pago
                  </button>

                  {/* ❤️ BOTÓN FAVORITO REUTILIZABLE */}
                  <BotonFavorito 
                    productoId={producto._id}
                    variant="icon"
                    size="lg"
                    className="h-14 w-full sm:w-14 shadow-lg"
                  />
                </div>

                {/* INFO ADICIONAL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={abrirModalMetodosPago}
                    className="flex items-center justify-center gap-2 p-6 bg-blue-300/20 cursor-pointer text-blue-700 rounded-xl w-full hover:bg-blue-100 transition font-semibold"
                  >
                    <FaCreditCard className="w-5 h-5" />
                    Métodos de Pago
                  </button>
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

      {/* MODAL MÉTODOS DE PAGO */}
      {modalMetodosPago && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-100 rounded-3xl overflow-y-auto shadow-xl border border-gray-100">

            {/* HEADER */}
            <div className="sticky top-0 bg-gray-100 border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <CreditCardIcon className="w-6 h-6 text-blue-600" />
                Métodos de Pago
              </h2>
              <button
                onClick={() => setModalMetodosPago(false)}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6">
              {loadingMetodos ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 animate-pulse">Cargando métodos de pago...</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:overflow-x-auto sm:gap-4 gap-6">
                  {/* TRANSFERENCIA */}
                  {metodosPago.transferencia && (
                    <div className="min-w-[250px] bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition flex-shrink-0">
                      <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-blue-600" />
                        Transferencia Bancaria
                      </h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p><span className="font-semibold">Banco:</span> {metodosPago.transferencia.banco}</p>
                        <p><span className="font-semibold">N° Cuenta:</span> {metodosPago.transferencia.numeroCuenta}</p>
                        <p><span className="font-semibold">Titular:</span> {metodosPago.transferencia.titular}</p>
                        <p><span className="font-semibold">Cédula:</span> {metodosPago.transferencia.cedula}</p>
                      </div>
                    </div>
                  )}

                  {/* QR */}
                  {metodosPago.qr?.imagenComprobante && (
                    <div className="min-w-[250px] bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition flex-shrink-0">
                      <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-purple-600" />
                        Código QR
                      </h3>
                      <img
                        src={metodosPago.qr.imagenComprobante}
                        alt="Código QR"
                        className="w-full max-w-xs mx-auto rounded-lg shadow-md border border-purple-300"
                      />
                    </div>
                  )}

                  {/* EFECTIVO */}
                  {metodosPago.efectivo?.lugarRetiro?.length > 0 && (
                    <div className="min-w-[250px] bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition flex-shrink-0">
                      <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Retiro en Efectivo
                      </h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        {metodosPago.efectivo.lugarRetiro.map((lugar, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 font-bold text-lg">•</span>
                            <span>{lugar}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* SIN MÉTODOS */}
                  {!metodosPago.transferencia && !metodosPago.qr?.imagenComprobante && !metodosPago.efectivo?.lugarRetiro?.length && (
                    <div className="text-center py-12 w-full">
                      <p className="text-gray-400 italic">El vendedor aún no ha configurado métodos de pago.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductoDetalle;