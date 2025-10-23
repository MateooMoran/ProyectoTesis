import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../layout/Header';
import storeProfile from '../../context/storeProfile';
import storeAuth from '../../context/storeAuth';
import storeProductos from '../../context/storeProductos';
import Carrusel from '../../layout/CarruselBanner';
import CarruselProductos from '../productosGeneral/CarruselProductos';
import CarruselCategorias from '../productosGeneral/CarruselCategorias';
import Footer from '../../layout/Footer';

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
    errorCategorias,
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
     
      <Carrusel />
      <main className="bg-white py-1">
        <div className="container mx-auto px-4">
          {/* Hero Section */}

          {/* CARRUSEL DE CATEGORÍAS */}
          <CarruselCategorias
            categorias={categorias}
            productos={productos}
            loadingCategorias={loadingCategorias}
            errorCategorias={errorCategorias}
          />
          {/* CARRUSEL 1: DESCUBRE LO NUEVO */}
          <CarruselProductos
            productos={productos}
            loading={loadingProductos}
            error={error}
            title="Descubre lo Nuevo"
            showDots={false}
            onAddToCart={handleAgregarAlCarrito}
          />

          {/* CARRUSEL 2: ÚLTIMAS UNIDADES */}
          <CarruselProductos
            productos={productos.filter(p => p.stock <= 5)}
            loading={loadingProductos}
            error={error}
            title="Últimas Unidades"
            showDots={false}
            onAddToCart={handleAgregarAlCarrito}
          />


        </div>
      </main>

      <Footer />
    </>
  );
};

export default Productos;
