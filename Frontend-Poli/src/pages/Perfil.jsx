import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import storeProfile from '../context/storeProfile';
import storeAuth from '../context/storeAuth';
import Header from '../layout/Header';

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
      toast.error('Error al cargar el perfil');
    }
  };

  const handleUpdateProfile = async (data) => {
    try {
      await updateProfile(data, user._id);
      resetProfile(data);
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleUpdatePassword = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    try {
      await updatePasswordProfile({ passwordactual: data.currentPassword, passwordnuevo: data.newPassword }, user._id);
      resetPassword();
      setShowPasswordFields(false);
      toast.success('Contraseña actualizada correctamente');
    } catch (err) {
      toast.error('Error al actualizar la contraseña');
    }
  };

  const handleLogout = () => {
    clearToken();
    clearUser();
    navigate('/login');
  };

  return (
    <div className=" min-h-screen">
      <ToastContainer />
      <Header />
      <main className=" py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-500 text-center mb-8">Mi Perfil</h2>
          {isLoading ? (
            <p className="text-center text-gray-700">Cargando perfil...</p>
          ) : user ? (
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-6">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-800 font-bold">Nombre</p>
                    <p className="text-gray-800">{user.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-bold">Apellido</p>
                    <p className="text-gray-800">{user.apellido}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-bold">Correo Electrónico</p>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-bold">Rol</p>
                    <p className="text-gray-800">{rol ? rol.toUpperCase() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-bold">Dirección</p>
                    <p className="text-gray-800">{user.direccion || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-bold">Teléfono</p>
                    <p className="text-gray-800">{user.telefono || 'No especificado'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Actualizar Perfil</h3>
                <form onSubmit={handleSubmitProfile(handleUpdateProfile)}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-800 font-bold">Nombre</label>
                      <input
                        type="text"
                        defaultValue={user.nombre}
                        className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 text-gray-700"
                        {...registerProfile('nombre', { required: 'El nombre es obligatorio' })}
                      />
                      {profileErrors.nombre && (
                        <p className="text-red-700 text-xs mt-1">{profileErrors.nombre.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-800 font-bold">Apellido</label>
                      <input
                        type="text"
                        defaultValue={user.apellido}
                        className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 text-gray-700"
                        {...registerProfile('apellido', { required: 'El apellido es obligatorio' })}
                      />
                      {profileErrors.apellido && (
                        <p className="text-red-700 text-xs mt-1">{profileErrors.apellido.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-800 font-bold">Dirección</label>
                      <input
                        type="text"
                        defaultValue={user.direccion}
                        className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 text-gray-700"
                        {...registerProfile('direccion')}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-800 font-bold">Teléfono</label>
                      <input
                        type="text"
                        defaultValue={user.telefono}
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
                  <form onSubmit={handleSubmitPassword(handleUpdatePassword)}>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm text-gray-800 font-bold">Contraseña Actual</label>
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
                        <label className="text-sm text-gray-800 font-bold">Nueva Contraseña</label>
                        <input
                          type="password"
                          className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-800 text-gray-700"
                          {...registerPassword('newPassword', {
                            required: 'La nueva contraseña es obligatoria',
                            minLength: { value: 4, message: 'La contraseña debe tener al menos 4 caracteres' },
                          })}
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-red-700 text-xs mt-1">{passwordErrors.newPassword.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm text-gray-800 font-bold">Confirmar Nueva Contraseña</label>
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
            <p className="text-center text-red-700">Error al cargar el perfil</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Perfil;