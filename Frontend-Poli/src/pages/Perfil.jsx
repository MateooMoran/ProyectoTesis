import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/logo.png';
import storeProfile from '../context/storeProfile';
import storeAuth from '../context/storeAuth';
import { User, LogOut, ShoppingCart, Search, Star } from 'lucide-react';

const Perfil = () => {
  const navigate = useNavigate();
  const { user, setUser } = storeProfile();
  const { token, rol, clearToken } = storeAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const categoriesRef = useRef(null);
  const userDropdownRef = useRef(null);
  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, formState: { errors: profileErrors } } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchProfile();
    }
  }, [token, navigate]);

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

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/perfil`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener el perfil');
      const data = await response.json();
      setUser(data);
      resetProfile({
        nombre: data.nombre,
        apellido: data.apellido,
        direccion: data.direccion,
        telefono: data.telefono,
      });
    } catch (err) {
      toast.error(err.message || 'Error al cargar el perfil');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/perfil/actualizarperfil/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al actualizar el perfil');
      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success('Perfil actualizado con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el perfil');
    }
  };

  const updatePassword = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/perfil/actualizarpassword/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: data.newPassword }),
      });
      if (!response.ok) throw new Error('Error al actualizar la contraseña');
      toast.success('Contraseña actualizada con éxito');
      resetPassword();
      setShowPasswordFields(false);
    } catch (err) {
      toast.error(err.message || 'Error al actualizar la contraseña');
    }
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos/buscar?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const scrollToCarousel = () => {
    navigate('/productos');
  };

  return (
    <div className="bg-blue-50 min-h-screen">
      <ToastContainer />
      {/* Header */}
      <header className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link to="/productos">
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
              onClick={scrollToCarousel}
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
                  <p className="px-4 py-2 text-gray-500 text-sm">Cargando categorías...</p>
                </div>
              )}
            </div>
            {token && rol === 'estudiante' && (
              <Link to="/estudiante/carrito" className="relative">
                <ShoppingCart className="w-6 h-6 text-blue-800 hover:text-red-800 transition-colors" />
              </Link>
            )}
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-blue-800 border-b">
                      <p><strong>Nombre:</strong> {user?.nombre || 'Usuario'}</p>
                      <p><strong>Rol:</strong> {rol ? rol.toUpperCase() : 'N/A'}</p>
                    </div>
                    <Link
                      to="/perfil"
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

      {/* Espacio para el header fijo */}
      <div className="h-20 sm:h-24"></div>

      {/* Main Section */}
      <main className="bg-blue-50 py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-800 text-center mb-8">Mi Perfil</h2>
          {user ? (
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
              {/* Información del perfil */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="text-gray-800">{user.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Apellido</p>
                    <p className="text-gray-800">{user.apellido}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Correo Electrónico</p>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rol</p>
                    <p className="text-gray-800">{rol ? rol.toUpperCase() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="text-gray-800">{user.direccion || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="text-gray-800">{user.telefono || 'No especificado'}</p>
                  </div>
                </div>
              </div>

              {/* Formulario para actualizar perfil */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Actualizar Perfil</h3>
                <form onSubmit={handleSubmitProfile(updateProfile)}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-800 mb-2">Nombre</label>
                      <input
                        type="text"
                        className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 text-gray-700"
                        {...registerProfile('nombre', { required: 'El nombre es obligatorio' })}
                      />
                      {profileErrors.nombre && (
                        <p className="text-red-700 text-xs mt-1">{profileErrors.nombre.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-800 mb-2">Apellido</label>
                      <input
                        type="text"
                        className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 text-gray-700"
                        {...registerProfile('apellido', { required: 'El apellido es obligatorio' })}
                      />
                      {profileErrors.apellido && (
                        <p className="text-red-700 text-xs mt-1">{profileErrors.apellido.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-800 mb-2">Dirección</label>
                      <input
                        type="text"
                        className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 text-gray-700"
                        {...registerProfile('direccion')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-800 mb-2">Teléfono</label>
                      <input
                        type="text"
                        className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 text-gray-700"
                        {...registerProfile('telefono')}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-4 w-full bg-blue-800 text-white py-2 rounded-xl font-semibold hover:bg-red-800 transition-colors hover:scale-105 duration-300"
                  >
                    Guardar Cambios
                  </button>
                </form>
              </div>

              {/* Formulario para cambiar contraseña */}
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-4">
                  <button
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="flex items-center text-blue-800 hover:text-red-800"
                  >
                    {showPasswordFields ? 'Ocultar' : 'Cambiar Contraseña'}
                  </button>
                </h3>
                {showPasswordFields && (
                  <form onSubmit={handleSubmitPassword(updatePassword)}>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-blue-800 mb-2">Contraseña Actual</label>
                        <input
                          type="password"
                          className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 text-gray-700"
                          {...registerPassword('currentPassword', { required: 'La contraseña actual es obligatoria' })}
                        />
                        {passwordErrors.currentPassword && (
                          <p className="text-red-700 text-xs mt-1">{passwordErrors.currentPassword.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-blue-800 mb-2">Nueva Contraseña</label>
                        <input
                          type="password"
                          className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 text-gray-700"
                          {...registerPassword('newPassword', {
                            required: 'La nueva contraseña es obligatoria',
                            minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
                          })}
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-red-700 text-xs mt-1">{passwordErrors.newPassword.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-blue-800 mb-2">Confirmar Nueva Contraseña</label>
                        <input
                          type="password"
                          className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 text-gray-700"
                          {...registerPassword('confirmNewPassword', { required: 'Confirma la nueva contraseña' })}
                        />
                        {passwordErrors.confirmNewPassword && (
                          <p className="text-red-700 text-xs mt-1">{passwordErrors.confirmNewPassword.message}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-4 w-full bg-blue-800 text-white py-2 rounded-xl font-semibold hover:bg-red-800 transition-colors hover:scale-105 duration-300"
                    >
                      Cambiar Contraseña
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-700">Cargando perfil...</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-100 py-6 mt-10">
        <div className="container mx-auto text-center">
          <p className="text-gray-800 font-semibold">
            © 2025 PoliVentas - Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="text-gray-800 hover:text-red-800 transition-colors">
              Facebook
            </a>
            <a href="#" className="text-gray-800 hover:text-red-800 transition-colors">
              Instagram
            </a>
            <a href="#" className="text-gray-800 hover:text-red-800 transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Perfil;