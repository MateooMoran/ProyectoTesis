import { BrowserRouter, Route, Routes } from 'react-router'
import { Home } from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Confirm from './pages/Confirm'
import Forgot from './pages/Forgot'
import Reset from './pages/Reset'
import { Dashboard } from './layout/Dashboard'

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home/>}/>
        <Route path='login' element={<Login/>}/>
        <Route path='register' element={<Register/>}/>
        <Route path='confirm/:token' element={<Confirm/>}/>
        <Route path='forgot/:id' element={<Forgot/>}/>
        <Route path='reset/:token' element={<Reset/>}/>
        <Route path='dashboard' element={<Dashboard/>}/>





      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
