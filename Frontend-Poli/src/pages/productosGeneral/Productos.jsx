import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../layout/Header';
import storeProfile from '../../context/storeProfile';
import storeAuth from '../../context/storeAuth';
import storeProductos from '../../context/storeProductos';
import Carrusel from '../../layout/CarruselBanner';
import CarruselProductos from '../productosGeneral/CarruselProductos'
import Footer from '../../layout/Footer';


const placeholderImage = 'https://via.placeholder.com/150?text=Sin+Imagen';

const Productos = () => {
  const navigate = useNavigate();
  const { user } = storeProfile();
  const { token } = storeAuth();
  const { 
    productos, 
    categorias, 
    loadingProductos, 
    loadingCategorias, 
    error, 
    fetchProductos, 
    fetchCategorias, 
    agregarProducto 
  } = storeProductos();

  
  const handleAgregarAlCarrito = (producto, cantidad = 1) => {
    agregarProducto(producto._id, cantidad);
    if (!token) {
      navigate(`/carrito/vacio`);
    } else {
      navigate(`/dashboard/productos/${producto._id}`);
      toast.success(`Producto ${producto.nombreProducto} agregado al carrito`);
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, [fetchProductos, fetchCategorias]);

  return (
    <>
      <Header />
      {/* Espacio para compensar header fijo */}
      <div className="h-20 sm:h-7"></div>
      
      <main className="bg-blue-50 py-10">
        <div className="container mx-auto px-4">

          {/* Hero Section */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-blue-800 mb-4">
              Bienvenido a <span className="text-red-700">PoliVentas</span>
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Descubre productos únicos creados por estudiantes para estudiantes. ¡Explora, compra y apoya a tu comunidad universitaria!
            </p>
            <Carrusel />
          </div>

          {/* ✅ CARRUSEL 1: LO NUEVO (SIN DOTS) */}
          <CarruselProductos
            productos={productos}
            loading={loadingProductos}
            error={error}
            title="Descubre lo nuevo en PoliVentas"
            showDots={false}
            onAddToCart={handleAgregarAlCarrito} // ✅ HANDLE PASADO
          />

          {/* ✅ CARRUSEL 2: DESCUENTOS (CON DOTS) */}
          <CarruselProductos
            productos={productos.filter(p => p.descuento)}
            loading={loadingProductos}
            error={error}
            title="🔥 Ofertas Especiales"
            showDots={true}
            onAddToCart={handleAgregarAlCarrito} // ✅ HANDLE PASADO
          />

          {/* ✅ CARRUSEL 3: TODOS LOS PRODUCTOS (GRILLA NO CARRUSEL) */}
          <section className="mb-12">
            <h3 className="text-3xl font-semibold text-blue-800 text-center mb-6">Todos los Productos</h3>
            {loadingProductos && <p className="text-center text-gray-700">Cargando productos...</p>}
            {error && <p className="text-center text-red-700">{error}</p>}
            {!loadingProductos && !error && productos.length === 0 && (
              <p className="text-center text-gray-700">No hay productos disponibles.</p>
            )}
            {!loadingProductos && !error && productos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productos.map((producto) => (
                  <Link key={producto._id} to={`/productos/${producto._id}`} className="block">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4">
                      <div className="relative mb-3">
                        <img
                          src={producto.imagen || placeholderImage}
                          alt={producto.nombreProducto}
                          className="w-full h-48 object-contain rounded-md"
                        />
                        <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          📦 {producto.stock}
                        </span>
                        {producto.stock <= 5 && (
                          <span className="absolute top-2 left-2 bg-red-800 text-white text-xs font-semibold px-2 py-1 rounded">
                            ¡Solo {producto.stock}!
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-light text-gray-800 line-clamp-2 text-center mb-2">
                        {producto.nombreProducto}
                      </h3>
                      <p className="text-lg font-bold text-gray-600 mb-2">${producto.precio.toFixed(2)}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAgregarAlCarrito(producto);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md"
                        >
                          🛒 Carrito
                        </button>
                        <button className="p-2 bg-gray-200 hover:bg-red-500 hover:text-white rounded-md">
                          ❤️
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
};

export default Productos; 