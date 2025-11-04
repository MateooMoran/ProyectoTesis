import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import storeProfile from '../context/storeProfile';
import storeAuth from '../context/storeAuth';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { User, Key, Save, X, Edit } from 'lucide-react';

const Perfil = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, updatePasswordProfile, clearUser } = storeProfile();
  const { token, rol, clearToken } = storeAuth();
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, formState: { errors: profileErrors } } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchProfile();
    }
  }, [token, navigate]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      await profile();
      setIsLoading(false);
      if (user) {
        resetProfile({
          nombre: user.nombre,
          apellido: user.apellido,
          direccion: user.direccion,
          telefono: user.telefono,
        });
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (data) => {
    try {
      await updateProfile(data, user._id);
      resetProfile(data);
    } catch (err) {
    }
  };

  const handleUpdatePassword = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      return;
    }
    try {
      await updatePasswordProfile({ passwordactual: data.currentPassword, passwordnuevo: data.newPassword }, user._id);
      resetPassword();
      setShowPasswordFields(false);
    } catch (err) {
    }
  };

  const handleLogout = () => {
    clearToken();
    clearUser();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
          <p className="text-center text-gray-700 text-lg">Cargando perfil...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <Header />
      <div className="mt-24 md:mt-8"></div>
      <main className="py-10 bg-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          {/* TÍTULO */}
          <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <h1 className="text-4xl font-bold text-gray-700">
                                Perfil de Usuario
                            </h1>
                        </div>
                        <p className="text-gray-600">Gestiona y actualiza tus datos personales</p>
                    </div>

          {user ? (
            <div className="grid lg:grid-cols-2 gap-8">

              {/* COLUMNA IZQUIERDA */}
              <div className="space-y-6">

                {/* INFORMACIÓN PERSONAL */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <User className="text-blue-600 w-6 h-6" /> Información Personal
                    </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="text-gray-600 font-semibold">Nombre</p>
                      <p className="text-gray-900 font-bold">{user.nombre}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 font-semibold">Apellido</p>
                      <p className="text-gray-900 font-bold">{user.apellido}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 font-semibold">Email</p>
                      <p className="text-gray-900 font-bold">{user.email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 font-semibold">Rol</p>
                      <p className={`font-bold ${rol === 'admin' ? 'text-green-600' : 'text-blue-600'}`}>
                        {rol ? rol.toUpperCase() : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 font-semibold">Dirección</p>
                      <p className="text-gray-900">{user.direccion || 'No especificada'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 font-semibold">Teléfono</p>
                      <p className="text-gray-900">{user.telefono || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                {/* ACTUALIZAR PERFIL */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Edit className="text-blue-600 w-6 h-6"/> Actualizar Perfil
                  </h3>
                  <form onSubmit={handleSubmitProfile(handleUpdateProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          className="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                          {...registerProfile('nombre', { required: 'El nombre es obligatorio' })}
                        />
                        {profileErrors.nombre && <p className="text-red-600 text-xs mt-1">{profileErrors.nombre.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
                        <input
                          type="text"
                          className="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                          {...registerProfile('apellido', { required: 'El apellido es obligatorio' })}
                        />
                        {profileErrors.apellido && <p className="text-red-600 text-xs mt-1">{profileErrors.apellido.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                        <input
                          type="text"
                          className="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                          {...registerProfile('direccion')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                        <input
                          type="text"
                          className="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                          {...registerProfile('telefono')}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      <Save className="w-5 h-5" /> Guardar Cambios
                    </button>
                  </form>
                </div>
              </div>

              {/* COLUMNA DERECHA: CAMBIO CONTRASEÑA */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Key className="text-blue-600 w-6 h-6" /> {showPasswordFields ? 'Actualizar Contraseña' : 'Actualizar Contraseña'}
                  </h3>

                  {showPasswordFields ? (
                    <form onSubmit={handleSubmitPassword(handleUpdatePassword)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña Actual</label>
                        <input
                          type="password"
                          className="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                          {...registerPassword('currentPassword', { required: 'La contraseña actual es obligatoria' })}
                        />
                        {passwordErrors.currentPassword && <p className="text-red-600 text-xs mt-1">{passwordErrors.currentPassword.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva Contraseña</label>
                        <input
                          type="password"
                          className="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                          {...registerPassword('newPassword', {
                            required: 'La nueva contraseña es obligatoria',
                            minLength: { value: 4, message: 'Mínimo 4 caracteres' },
                          })}
                        />
                        {passwordErrors.newPassword && <p className="text-red-600 text-xs mt-1">{passwordErrors.newPassword.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Nueva</label>
                        <input
                          type="password"
                          className="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                          {...registerPassword('confirmNewPassword', { required: 'Confirma la nueva contraseña' })}
                        />
                        {passwordErrors.confirmNewPassword && <p className="text-red-600 text-xs mt-1">{passwordErrors.confirmNewPassword.message}</p>}
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="flex-1 h-12 bg-gradient-to-r from-green-800 to-green-900 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                          <Save className="w-5 h-5" /> Actualizar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordFields(false);
                            resetPassword();
                          }}
                          className="flex-1 h-12 bg-gray-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-600 transform hover:scale-105 transition-all duration-300"
                        >
                          <X className="w-5 h-5" /> Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowPasswordFields(true)}
                      className="w-full h-12 bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      <Key className="w-5 h-5" /> Cambiar Contraseña
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-red-600 text-xl">Error al cargar el perfil</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Perfil;