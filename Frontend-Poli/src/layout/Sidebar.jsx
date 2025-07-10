import { useState } from "react";
import person from "../assets/person.png";
import { Eye, Pencil, Trash2, LogOut, Moon, Menu } from "lucide-react";

export const Sidebar = () => {
  const [user] = useState("David Muela");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón hamburguesa (solo móviles) */}
      <button
        className="md:hidden p-4 text-black  flex items-center gap-2 z-50 relative"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="w-12 h-12" />
      </button>

      {/* Overlay (solo cuando isOpen) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed md:static top-0 left-0 h-screen bg-blue-950 shadow-md flex flex-col justify-between z-50 transform transition-transform duration-300
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0 w-56 sm:w-56 md:w-56 lg:w-56 xl:w-60
  `}
      >

        {/* Sección Usuario */}
        <div className="pt-4 flex items-center flex-col">
          <img
            src={person}
            alt="avatar"
            className="h-20 w-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-[22px] text-white font-semibold">
              Bienvenido
            </h2>
            <p className="text-sm text-gray-300 font-bold text-center">{user}</p>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex flex-col gap-2 p-4 text-white">
          <div className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <Eye className="w-4 h-4" />
            <span>Visualizar</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <Eye className="w-4 h-4" />
            <span>Visualizar</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <Pencil className="w-4 h-4" />
            <span>Editar</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <Eye className="w-4 h-4" />
            <span>Visualizar</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <Eye className="w-4 h-4" />
            <span>Visualizar</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <Pencil className="w-4 h-4" />
            <span>Editar</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <Eye className="w-4 h-4" />
            <span>Visualizar</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <Eye className="w-4 h-4" />
            <span>Visualizar</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <Pencil className="w-4 h-4" />
            <span>Editar</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer transition">
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-white space-y-4">
          <div className="flex items-center gap-2 cursor-pointer hover:text-red-400 transition">
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-yellow-400 transition">
            <Moon className="w-4 h-4" />
            <span>Cambiar tema</span>
          </div>
        </div>
      </nav>
    </>
  );
};
