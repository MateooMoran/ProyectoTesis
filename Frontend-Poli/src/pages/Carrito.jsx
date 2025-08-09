import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import storeProfile from '../context/storeProfile';
import storeAuth from '../context/storeAuth';
import storeProductos from '../context/storeProductos';
import { User, LogOut, ShoppingCart, Search, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// IMPORTA storeCarrito si tienes
import storeCarrito from '../context/storeCarrito'; // Asegúrate que exista este import

const Carrito = () => {
    const { user } = storeProfile();
    const { token, clearToken } = storeAuth();
    const { categorias, loadingCategorias, error, fetchCategorias } = storeProductos();
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const categoriesRef = useRef(null);
    const userDropdownRef = useRef(null);

    const { carrito, fetchCarrito, disminuirCantidad, eliminarProducto, vaciarCarrito, loading } =
        storeCarrito();

    useEffect(() => {
        fetchCategorias();
        fetchCarrito();
    }, []);

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
        navigate('/login');
        toast.info('Sesión cerrada');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/productos/buscar?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    if (loading) return <p className="text-center">Cargando carrito...</p>;

    return (
        <>
            {/* Header */}
            <header className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Link to="/dashboard">
                        <img src={logo} alt="PoliVentas" className="w-36 h-12 object-cover" />
                    </Link>
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
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors"
                        >
                            <Star className="w-5 h-5" />
                            Destacado
                        </button>
                        <div className="relative" ref={categoriesRef}>
                            <button
                                className="text-blue-800 font-semibold hover:text-red-800 transition-colors"
                                onMouseEnter={() => setIsCategoriesOpen(true)}
                                onMouseLeave={() => setIsCategoriesOpen(false)}
                            >
                                Categorías
                            </button>
                            {isCategoriesOpen && (
                                <div
                                    className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200"
                                    onMouseEnter={() => setIsCategoriesOpen(true)}
                                    onMouseLeave={() => setIsCategoriesOpen(false)}
                                >
                                    {loadingCategorias && (
                                        <p className="px-4 py-2 text-gray-500 text-sm">Cargando categorías...</p>
                                    )}
                                    {error && <p className="px-4 py-2 text-red-700 text-sm">{error}</p>}
                                    {!loadingCategorias && !error && categorias.length === 0 && (
                                        <p className="px-4 py-2 text-gray-500 text-sm">No hay categorías disponibles.</p>
                                    )}
                                    {!loadingCategorias && !error &&
                                        categorias.length > 0 &&
                                        categorias.map((cat) => (
                                            <Link
                                                key={cat._id}
                                                to={`/productos/categoria/${cat._id}`}
                                                className="block px-4 py-2 text-blue-800 hover:bg-red-100 hover:text-red-700 text-sm"
                                                onClick={() => setIsCategoriesOpen(false)}
                                            >
                                                {cat.nombreCategoria}
                                            </Link>
                                        ))}
                                </div>
                            )}
                        </div>

                        {token && user?.rol === 'estudiante' && (
                            <Link to="/dashboard/estudiante/carrito" className="relative">
                                <ShoppingCart className="w-6 h-6 text-blue-800 hover:text-red-800 transition-colors" />
                            </Link>
                        )}

                        {token ? (
                            <div className="relative" ref={userDropdownRef}>
                                <button
                                    className="flex items-center gap-2 text-blue-800 font-semibold hover:text-red-800 transition-colors"
                                    onMouseEnter={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <User className="w-5 h-5" />
                                    <span>{user?.nombre ? `Hola, ${user.nombre}` : 'Usuario'}</span>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                                        <div className="px-4 py-2 text-sm text-blue-800 border-b">
                                            <p>
                                                <strong>Nombre:</strong> {user?.nombre || 'Usuario'}
                                            </p>
                                            <p>
                                                <strong>Rol:</strong> {user?.rol ? user.rol.toUpperCase() : 'N/A'}
                                            </p>
                                        </div>
                                        <Link
                                            to="/dashboard/perfil"
                                            className="block px-4 py-2 text-blue-800 hover:bg-blue-50"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            Mi Perfil
                                        </Link>
                                        <button
                                            className="block w-full text-left px-4 py-2 text-blue-800 hover:bg-blue-50"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="w-4 h-4 inline mr-2" />
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

            <div className="h-20 sm:h-24"></div>

            {/* Contenido carrito */}
            <main className="container mx-auto px-4 py-6">
                {(!carrito || !carrito.productos?.length) ? (
                    <p className="text-center mt-6">No tienes productos en el carrito.</p>
                ) : (
                    <div className="max-w-4xl mx-auto mt-6 p-4 bg-white rounded-lg shadow">
                        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tu Carrito</h2>

                        {carrito.productos.map((item) => (
                            <div key={item._id} className="flex items-center justify-between border-b py-3">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={item.producto.imagen}
                                        alt={item.producto.nombreProducto}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div>
                                        <p className="font-semibold">{item.producto.nombreProducto}</p>
                                        <p className="text-gray-600">Cantidad: {item.cantidad}</p>
                                        <p className="text-sm text-gray-500">
                                            Precio: ${item.precioUnitario} | Subtotal: ${item.subtotal}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => disminuirCantidad(item._id)}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                                    >
                                        -
                                    </button>
                                    <button
                                        onClick={() => eliminarProducto(item._id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between mt-4 font-bold">
                            <span>Total:</span>
                            <span>${carrito.total}</span>
                        </div>

                        <button
                            onClick={vaciarCarrito}
                            className="mt-4 w-full bg-red-700 text-white py-2 rounded hover:bg-red-800 transition"
                        >
                            Vaciar carrito
                        </button>
                    </div>
                )}
            </main>
        </>
    );
};

export default Carrito;
