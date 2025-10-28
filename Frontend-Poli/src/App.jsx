import { BrowserRouter, Route, Routes } from 'react-router-dom'; 
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Outlet } from 'react-router-dom';
import { Home } from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Confirm from './pages/Confirm';
import Forgot from './pages/Forgot';
import Reset from './pages/Reset';
import Dashboard from './layout/Dashboard';
import PublicRoute from './routes/PublicRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import Productos from './pages/productosGeneral/Productos';
import CategoriaProductos from './pages/productosGeneral/Categorias';
import Perfil from "./pages/Perfil";
import ProductoBuscado from './pages/productosGeneral/ProductoBuscado';
import AuthCallback from './pages/AuthCallback';
import CarritoVacio from './pages/productosGeneral/CarritoVacio';
import Carrito from './pages/pagos/Carrito';
import ProductoDetalle from './pages/productosGeneral/ProductoDetalle';
import GestionarUsuario from './pages/admin/GestionarUsuario';
import QuejasSugerencias from "./pages/QuejasSugerencias";
import GestionQuejasSugerencias from './pages/admin/GestionQuejasSugerencias';
import BuscarPriv from './pages/productosGeneral/BuscarPriv';

import Categorias from './pages/vendedor/Categorias';
import ProductosVendedor from './pages/vendedor/ProductosVendedor';
import Historial from './pages/vendedor/Historial';
import EditarProductos from './pages/vendedor/EditarProductos';
import HistorialPagos from './pages/pagos/HistorialPagos';
import Favoritos from './pages/productosGeneral/Favoritos'

import MetodoPago from './pages/vendedor/MetodoPago'

// Componentes de pago que creamos
import OrdenPendiente from './pages/pagos/OrdenPendiente';
import Pagos from './pages/pagos/Pagos';
import ConfirmarOrden from './pages/pagos/ConfirmarOrden';
import Exito from './pages/pagos/Exito';

import { useEffect, useRef } from 'react';
import storeProfile from './context/storeProfile';
import storeAuth from './context/storeAuth';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
  const { profile } = storeProfile();
  const { token } = storeAuth();
  const hasCalledProfile = useRef(false);

  useEffect(() => {
    if (token && !hasCalledProfile.current) {
      hasCalledProfile.current = true;
      profile();
    }
  }, [token, profile]); 

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot/:id" element={<Forgot />} />
          <Route path="confirm/:token" element={<Confirm />} />
          <Route path="reset/:token" element={<Reset />} />
          <Route path="productos/categoria/:id" element={<CategoriaProductos />} />
          <Route path="carrito/vacio" element={<CarritoVacio />} />
          <Route path="productos/:id" element={<ProductoDetalle />} />
          <Route path="auth/callback" element={<AuthCallback />} />
          <Route path="productos/buscar" element={<ProductoBuscado />} />
          <Route path="favoritos" element={<Favoritos />} />
        </Route>

        {/* Rutas protegidas con Dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />}>
            <Route index element={<Productos />} />
            <Route path="listarProd" element={<Productos />} />
            <Route path="estudiante/carrito" element={<Carrito />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="admin/gestionusuarios" element={<GestionarUsuario />} />
            <Route path="admin/gestionquejas" element={<GestionQuejasSugerencias />} />
            <Route path="estudiante/quejas-sugerencias" element={<QuejasSugerencias />} />
            <Route path="estudiante/historial-pagos" element={<HistorialPagos />} />
            <Route path="productos/buscar" element={<BuscarPriv />} />
            <Route path="productos/:id" element={<ProductoDetalle />} />
            <Route path="productos/categoria/:id" element={<CategoriaProductos />} />
            <Route path="favoritos" element={<Favoritos />} />
            
            {/* Rutas para vendedor */}
            <Route path="vendedor/categorias" element={<Categorias />} />
            <Route path="vendedor/productos" element={<ProductosVendedor />} />
            <Route path="vendedor/visualizar/producto" element={<EditarProductos />} />
            <Route path="vendedor/historial-ventas" element={<Historial />} />
            <Route path="vendedor/quejas-sugerencias" element={<QuejasSugerencias />} />
            <Route path="vendedor/metodo-pago" element={<MetodoPago />} />

            {/* Nueva ruta para crear orden pendiente */}
            <Route path="orden-pendiente" element={<OrdenPendiente />} />

            {/* Rutas para pago con Stripe */}
            <Route
              path="pagos"
              element={
                <Elements stripe={stripePromise}>
                  <Pagos />
                </Elements>
              }
            />

            {/* Rutas de confirmación y éxito */}
            <Route path="pagos/confirmar" element={<ConfirmarOrden />} />
            <Route path="pagos/exito" element={<Exito />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;