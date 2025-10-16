import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ShoppingCart, Search, Star, Heart } from 'lucide-react';
import logo from '../assets/logo.png';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile';
import storeProductos from '../context/storeProductos';
import NotificacionesAdmin from '../pages/admin/Notificaciones';
import { MessageCircle } from "lucide-react";
import Chat from '../pages/chat/Chat'
import storeCarrito from '../context/storeCarrito';



const Header = () => {
    const navigate = useNavigate();
    const { token, clearToken } = storeAuth();
    const { user, profile } = storeProfile(); // obtener perfil para rol confiable
    const { categorias, loadingCategorias, error, fetchCategorias } = storeProductos();

    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const categoriesRef = useRef(null);
    const userDropdownRef = useRef(null);
    const { carrito } = storeCarrito();

    const { clear, clearUser } = storeProfile()


    const totalCantidad = carrito?.productos?.reduce((acc, item) => acc + item.cantidad, 0) || 0;

    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    useEffect(() => {
        // Cargar perfil si no está cargado pero hay token
        if (token && !user) {
            profile();
        }
    }, [token, user, profile]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
                setIsCategoriesOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        clearToken();
        clearUser()
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/dashboard/productos/buscar?query=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const scrollToCarousel = () => {
        navigate('/');
    };

    const rol = user?.rol || 'estudiante';
    return (
        <>
            <header className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50 ">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Logo */}
                    <Link to={token ? '/' : '/'}>
                        <img src={logo} alt="PoliVentas" className="w-36 h-12 object-cover" />
                    </Link>

                    {/* Barra de Búsqueda */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar productos en PoliVentas..."
                                className="w-full py-2 px-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 transition-colors text-gray-700"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <Search className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </form>

                    {/* Botones */}
                    <div className="flex items-center gap-2 flex-col sm:flex-row w-full sm:w-auto">
                        {(rol === 'estudiante' || rol === 'admin' || rol === 'vendedor'|| rol === null ) && 
                        
                        <NotificacionesAdmin />}

                        <button
                            onClick={scrollToCarousel}
                            className="flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors"
                        >
                            <Heart className="w-5 h-5" />
                            Favoritos
                        </button>

                        <button
                            onClick={() => setOpen(!open)}
                            className="fixed bottom-5 right-5 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
                        >
                            <MessageCircle size={24} />
                        </button>
                        {open && <Chat onClose={() => setOpen(false)} />}

                        {/* Carrito */}
                        {token && rol === 'estudiante' && (
                            <Link to="/dashboard/estudiante/carrito" className="relative">
                                <ShoppingCart className="w-6 h-6 text-blue-800 hover:text-red-800 transition-colors" />

                                {totalCantidad > 0 && (
                                    <span
                                        className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow"
                                    >
                                        {totalCantidad}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Perfil o login/register */}
                        {token ? (
                            <div className="relative" ref={userDropdownRef}>
                                <button
                                    className="flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <User className="w-5 h-5" />
                                    <span>{user?.nombre ? `Hola, ${user.nombre}` : 'Usuario'}</span>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg py-3 z-50   ">
                                        <div className="px-5 py-3 text-sm text-blue-700">
                                            <p><strong>Nombre:</strong> {user?.nombre || 'Usuario'}</p>
                                            <p><strong>Rol:</strong> {rol ? rol.toUpperCase() : 'N/A'}</p>
                                        </div>
                                        <Link
                                            to="/dashboard/perfil"
                                            className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            Mi Perfil
                                        </Link>

                                        {/* Opciones extras según rol */}
                                        {rol === 'admin' && (
                                            <>
                                                <Link
                                                    to="/dashboard/admin/gestionusuarios"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Gestión Usuarios
                                                </Link>
                                                <Link
                                                    to="/dashboard/admin/gestionquejas"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Gestión Quejas y Sugerencias
                                                </Link>
                                                <Link
                                                    to="/dashboard/vendedor/categorias"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    
                                                    Creacion de Categorías
                                                </Link>

                                            </>
                                        )}
                                        {rol === 'vendedor' && (
                                            <>
                                                
                                                <Link
                                                    to="/dashboard/vendedor/quejas-sugerencias"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Mis Quejas y Sugerencias
                                                </Link>
                                                <Link
                                                    to="/dashboard/vendedor/productos"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Gestionar Productos
                                                </Link>


                                                <Link
                                                    to="/dashboard/vendedor/historial-ventas"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Historial Ventas
                                                </Link>
                                            </>
                                        )}
                                        {rol === 'estudiante' &&  (
                                            <>
                                                <Link
                                                    to="/dashboard/estudiante/quejas-sugerencias"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Mis Quejas y Sugerencias
                                                </Link>
                                                <Link
                                                    to="/dashboard/estudiante/historial-pagos"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Mis Compras
                                                </Link>
                                                <Link
                                                    to="/dashboard/estudiante/carrito"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Carrito
                                                </Link>
                                            </>
                                        )}

                                        <button
                                            className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-red-500"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="w-4 h-4 inline mr-2 text-red-500" />
                                            Salir
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <Link
                                    to="/login"
                                    className="bg-blue-800 text-white py-2 px-6 rounded-xl font-semibold border hover:bg-red-800 transition-colors hover:scale-105 duration-300"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-800 text-white py-2 px-6 rounded-xl font-semibold border hover:bg-red-800 transition-colors hover:scale-105 duration-300"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Espacio para compensar header fijo */}
            <div className="h-40 sm:h-7" />
        </>
    );
};

export default Header;
