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


import { useEffect } from 'react'
import storeProfile from './context/storeProfile'
import storeAuth from './context/storeAuth'

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

          <Route element={<PublicRoute />}>
            <Route index element={<Home />} />
            <Route path='login' element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path='register' element={<Register />} />
            <Route path='forgot/:id' element={<Forgot />} />
            <Route path='confirm/:token' element={<Confirm />} />
            <Route path='reset/:token' element={<Reset />} />
          </Route>


          <Route path='dashboard/*' element={
            <ProtectedRoute>
              <Routes>
                <Route element={<Dashboard />}>
                  <Route index element={<Productos />} />
                  <Route path='listarProd' element={<Productos />} />
                  <Route path="/productos/categoria/:id" element={<CategoriaProductos />} />
                  <Route path="/productos/buscar" element={<ProductoBuscado />} />
                  {/* Aquí puedes agregar más rutas dentro del Dashboard 
                  <Route path='listar' element={<List />} />
                  <Route path='visualizar/:id' element={<Details />} />
                  <Route path='crear' element={<Create />} />
                  <Route path='actualizar/:id' element={<Update />} />
                  <Route path='chat' element={<Chat />} />
                  */}
                </Route>  
                <Route path='perfil' element={<Perfil />} />
              </Routes>
            </ProtectedRoute>
          } />


        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App
