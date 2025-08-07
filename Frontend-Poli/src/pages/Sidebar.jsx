import { useState, useEffect } from "react";
import person from "../assets/person.png";
import { ShoppingBag, LogOut, Moon, Menu, User } from "lucide-react";
import { Link } from 'react-router-dom';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile'; 


export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { clearToken } = storeAuth();
  const { user, profile } = storeProfile(); 

  useEffect(() => {
    profile(); 
  }, [profile]);

  return (
    <>
      {/* Botón hamburguesa (solo móviles) */}
      <button
        className="md:hidden p-4 text-black flex items-center gap-2 z-50 relative"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="w-12 h-12" />
      </button>

      {/* Overlay (solo cuando isOpen) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed md:static top-0 left-0 h-screen bg-blue-950 shadow-lg flex flex-col justify-between z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 w-56 xl:w-60
      `}
      >
        {/* Sección Usuario */}
        <div className="pt-6 flex flex-col items-center gap-2">
          <img
            src={person}
            alt="avatar"
            className="h-20 w-20 rounded-full object-cover border-4 border-blue-800"
          />
          <h2 className="text-xl text-white font-bold mt-2">Bienvenido  {user?.nombre}</h2>
          <p className="text-sm text-blue-300 font-semibold">
          {user ? user?.rol.toUpperCase() : "CARGANDO..."}</p>
        </div>

        {/* Botón destacado para ir a la tienda */}
        <div className="px-6 mt-8">
          <Link
            to="/dashboard/listarProd"
            className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-800 text-white rounded-xl font-bold text-lg shadow hover:bg-red-800 transition duration-300"
          >
            <ShoppingBag className="w- h-5" />
            Ir a la tienda
          </Link>
        </div>

        {/* Navegación de usuario */}
        <div className="flex flex-col gap-2 px-6 mt-1 text-white">
          <Link to="/Profile" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <User className="w-4 h-4" />
            <span>Mi perfil</span>
          </Link>
          {/* Puedes agregar más enlaces aquí según el rol */}
        </div>

        {/* Footer */}
        <div className="p-6 text-white space-y-4">
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <button
              className="text-white mr-3 text-md block hover:bg-red-900 text-center bg-red-800 px-4 py-1 rounded-lg"
              onClick={() => clearToken()}
            >
              Salir
            </button>
          </div>
          
        </div>
      </nav>
    </>
  );
};
export default Sidebar;