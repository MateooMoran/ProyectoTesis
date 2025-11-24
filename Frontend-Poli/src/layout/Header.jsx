import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Search, Heart } from 'lucide-react';
import { MessageCircle } from "lucide-react";
import logo from '../assets/logo.png';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile';
import storeProductos from '../context/storeProductos';
import NotificacionesAdmin from '../pages/admin/Notificaciones';
import ChatBadge from '../components/ChatBadge';

const Header = () => {
    const navigate = useNavigate();
    const { token, clearToken } = storeAuth();
    const { user, profile, clearUser } = storeProfile();
    const { categorias, fetchCategorias } = storeProductos();

    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const categoriesRef = useRef(null);
    const userDropdownRef = useRef(null);

    // Cargar categorías solo una vez
    useEffect(() => {
        if (categorias.length === 0) fetchCategorias();
    }, []);

    // Cargar perfil si hay token y no hay usuario cargado
    useEffect(() => {
        if (token && !user) profile();
    }, [token, user]);

    // Cerrar dropdowns al hacer clic fuera
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
        clearUser();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const query = encodeURIComponent(searchQuery.trim());
            if (token) {
                navigate(`/dashboard/productos/buscar?query=${query}`);
            } else {
                navigate(`/productos/buscar?query=${query}`);
            }
            setSearchQuery('');
        }
    };

    const rol = user?.rol || 'estudiante';

    return (
        <>
            <header className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50">
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
                        {/* Notificaciones- Solo para usuarios autenticados */}

                        {token && (rol === 'estudiante' || rol === 'admin' || rol === 'vendedor') && <NotificacionesAdmin />}

                        {/* Chat Badge - Solo para usuarios autenticados */}
                        {token && (rol === 'estudiante' || rol === 'admin' || rol === 'vendedor') && <ChatBadge />}

                        {(rol === "estudiante" || rol === null) && (
                            <Link
                                to={token ? "/dashboard/favoritos" : "/favoritos"}
                                className="z-50 flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors"
                            >
                                <Heart className="w-5 h-5" />
                                Favoritos
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
                                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg py-3 z-50">
                                        <div className="px-5 py-3 text-sm text-blue-700">
                                            <p><strong>Nombre:</strong> {user?.nombre || 'Usuario'}</p>
                                            <p><strong>Rol:</strong> {rol ? rol.toUpperCase() : 'N/A'}</p>
                                        </div>

                                        <Link
                                            to="/dashboard/perfil"
                                            className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            Perfil
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
                                                    Creación de Categorías
                                                </Link>
                                                <Link
                                                    to="/dashboard/estudiante/historial-pagos"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Historial de Compras
                                                </Link>
                                            </>
                                        )}

                                        {rol === 'vendedor' && (
                                            <>
                                                <Link
                                                    to="/dashboard/vendedor/productos"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Gestionar Productos
                                                </Link>
                                                <Link
                                                    to="/dashboard/vendedor/metodo-pago"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Métodos de Pago
                                                </Link>
                                                <Link
                                                    to="/dashboard/vendedor/historial-ventas"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Historial Ventas
                                                </Link>
                                                <Link
                                                    to="/dashboard/estudiante/historial-pagos"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Historial de Compras
                                                </Link>
                                                <Link
                                                    to="/dashboard/vendedor/quejas-sugerencias"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Quejas y Sugerencias
                                                </Link>
                                            </>
                                        )}

                                        {rol === 'estudiante' && (
                                            <>
                                                <Link
                                                    to="/dashboard/estudiante/historial-pagos"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Historial de Compras
                                                </Link>
                                                <Link
                                                    to="/dashboard/estudiante/quejas-sugerencias"
                                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    Quejas y Sugerencias
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
            </header >

            {/* Espacio para compensar header fijo */}
            < div className="h-18 sm:h-1" />
        </>
    );
};

export default Header;
