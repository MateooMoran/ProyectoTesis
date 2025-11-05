import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import storeProfile from '../../context/storeProfile';
import storeAuth from '../../context/storeAuth';
import storeProductos from '../../context/storeProductos';
import Carrusel from '../../layout/CarruselBanner';
import CarruselProductos from '../productosGeneral/CarruselProductos';
import CarruselCategorias from '../productosGeneral/CarruselCategorias';
import Header from '../../layout/Header';
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
    fetchCategorias
  } = storeProductos();

  useEffect(() => {
    // Solo hace fetch UNA VEZ al montar el componente
    const loadData = async () => {
      if (productos.length === 0) {
        fetchProductos();
      }
      if (categorias.length === 0) {
        fetchCategorias();
      }
    };
    loadData();
  }, []);

  return (
    <>
      <Header />
      <div className="mt-24 md:mt-5"></div>
      <Carrusel />
      <main className="bg-blue-50 py-1">
        <div className="container mx-auto px-4">
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
          />

          {/* CARRUSEL 2: ÚLTIMAS UNIDADES */}
          <CarruselProductos
            productos={productos.filter(p => p.stock <= 5)}
            loading={loadingProductos}
            error={error}
            title="Últimas Unidades"
            showDots={false}
          />
        </div>
      </main>
    </>
  );
};

export default Productos;