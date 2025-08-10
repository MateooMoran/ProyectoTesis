import { BrowserRouter, Route, Routes } from 'react-router';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import { Home } from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Confirm from './pages/Confirm';
import Forgot from './pages/Forgot';
import Reset from './pages/Reset';
import Dashboard from './layout/Dashboard';
import PublicRoute from './routes/PublicRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import Productos from './pages/Productos';
import CategoriaProductos from './pages/Categorias';
import Perfil from "./pages/Perfil";
import ProductoBuscado from './pages/ProductoBuscado';
import AuthCallback from './pages/AuthCallback';
import CarritoVacio from './pages/CarritoVacio';
import Carrito from './pages/Carrito';
import ProductoDetalle from './pages/ProductoDetalle';
import GestionarUsuario from './pages/admin/GestionarUsuario';
import QuejasSugerencias from "./pages/QuejasSugerencias";
import GestionQuejasSugerencias from './pages/admin/GestionQuejasSugerencias';

import Categorias from './pages/vendedor/Categorias';
import ProductosVendedor from './pages/vendedor/ProductosVendedor';
import Historial from './pages/vendedor/Historial';


// Componentes de pago que creamos
import OrdenPendiente from './pages/OrdenPendiente';
import Pagos from './pages/Pagos';
import ConfirmarOrden from './pages/ConfirmarOrden';
import Exito from './pages/Exito';

import { useEffect } from 'react';
import storeProfile from './context/storeProfile';
import storeAuth from './context/storeAuth';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
  const { profile } = storeProfile();
  const { token } = storeAuth();

  useEffect(() => {
    if (token) {
      profile();
    }
  }, [token]);

  return (
    <>
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
            <Route path="/productos/categoria/:id" element={<CategoriaProductos />} />
            <Route path="carrito/vacio" element={<CarritoVacio />} />
            <Route path="productos/:id" element={<ProductoDetalle />} />
            <Route path="auth/callback" element={<AuthCallback />} />
          </Route>

          {/* Rutas protegidas */}
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }>
            <Route index element={<Productos />} />
            <Route path="listarProd" element={<Productos />} />
            <Route path="/dashboard/productos/categoria/:id" element={<CategoriaProductos />} />
            <Route path="productos/buscar" element={<ProductoBuscado />} />
            <Route path="estudiante/carrito" element={<Carrito />} />
            <Route path="productos/:id" element={<ProductoDetalle />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path='admin/gestionusuarios' element={<GestionarUsuario />} />
            <Route path='admin/gestionquejas' element={<GestionQuejasSugerencias />} />
            <Route path='estudiante/quejas-sugerencias' element={<QuejasSugerencias />} />

            {/* Rutas para vendedor */}
            <Route path="vendedor/categorias" element={<Categorias />} />
            <Route path="vendedor/productos" element={<ProductosVendedor />} />
            <Route path="vendedor/historial-ventas" element={<Historial />} />


            {/* Nueva ruta para crear orden pendiente */}
            <Route path="orden-pendiente" element={<OrdenPendiente />} />

            {/* Rutas para pago con Stripe - envolver en Elements */}
            <Route
              path="pagos"
              element={
                <Elements stripe={stripePromise}>
                  <Pagos />
                </Elements>
              }
            />

            {/* Rutas de confirmación y éxito (pueden ser simples páginas) */}
            <Route path="pagos/confirmar" element={<ConfirmarOrden />} />
            <Route path="pagos/exito" element={<Exito />} />

          </Route>

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
