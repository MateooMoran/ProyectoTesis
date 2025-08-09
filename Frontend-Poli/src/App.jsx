import { BrowserRouter, Route, Routes } from 'react-router'
import { Home } from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Confirm from './pages/Confirm'
import Forgot from './pages/Forgot'
import Reset from './pages/Reset'
import Dashboard  from './layout/Dashboard'
import PublicRoute from './routes/PublicRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import Productos from './pages/Productos';
import CategoriaProductos from './pages/Categorias';
import Perfil from "./pages/Perfil";
import ProductoBuscado from './pages/ProductoBuscado';
import AuthCallback from './pages/AuthCallback';
import CarritoVacio from './pages/CarritoVacio';
import Pagos from './pages/Pagos';


import { useEffect } from 'react'
import storeProfile from './context/storeProfile'
import storeAuth from './context/storeAuth'
import Carrito from './pages/Carrito'
import ProductoDetalle from './pages/ProductoDetalle';
import GestionarUsuario from './pages/admin/GestionarUsuario'

function App() {
  const { profile } = storeProfile()
  const { token } = storeAuth()

  useEffect(() => {
    if (token) {
      profile()
    }
  }, [token])
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
          <Route path="productos/categoria/:id" element={<CategoriaProductos />} />
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
          <Route path="productos/categoria/:id" element={<CategoriaProductos />} />
          <Route path="productos/buscar" element={<ProductoBuscado />} />
          <Route path="estudiante/carrito" element={<Carrito />} />
          <Route path="productos/:id" element={<ProductoDetalle />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="pagos" element={<Pagos />} />
          {/* Otras rutas hijas */}
          {/* Ruta Admin */}
          <Route path='admin' element={<GestionarUsuario/>}></Route>

        </Route>

      </Routes>
    </BrowserRouter>
    </>
  )
}
export default App
