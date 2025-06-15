import { BrowserRouter, Route, Routes } from 'react-router'
import { Home } from './pages/Home'
import Login from './pages/Login'
import Dashboard from './layout/Dashboard'
import { useState } from 'react'
import Register from './pages/Register'

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home/>}/>
        <Route path='login' element={<Login/>}/>
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='register' element={<Register/>}/>

      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
