import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { toast } from 'react-toastify';
import storeAuth from '../context/storeAuth'; 

const storeProfile = create(
  persist(
    (set, get) => ({
      user: null,
      clearUser: () => set({ user: null }),

      profile: async () => {
        try {
          const { token } = storeAuth.getState();
          if (!token) throw new Error('No hay token');
          const url = `${import.meta.env.VITE_BACKEND_URL}/perfil`;
          const respuesta = await axios.get(url, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          set({ user: respuesta.data });
          return respuesta.data;
        } catch (error) {
          console.error('Error en profile:', error);
          toast.error(error.response?.data?.msg || 'Error al cargar el perfil');
          set({ user: null });
          throw error;
        }
      },

      updateProfile: async (data, id) => {
        try {
          const { token } = storeAuth.getState();
          if (!token) throw new Error('No hay token');
          const url = `${import.meta.env.VITE_BACKEND_URL}/perfil/actualizarperfil/${id}`;
          const respuesta = await axios.put(url, data, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          set({ user: respuesta.data });
          toast.success('Perfil actualizado correctamente');
          return respuesta.data;
        } catch (error) {
          console.error('Error en updateProfile:', error);
          toast.error(error.response?.data?.msg || 'Error al actualizar el perfil');
          throw error;
        }
      },

      updatePasswordProfile: async (data, id) => {
        try {
          const { token } = storeAuth.getState();
          if (!token) throw new Error('No hay token');
          const url = `${import.meta.env.VITE_BACKEND_URL}/perfil/actualizarpassword/${id}`;
          const respuesta = await axios.put(url, data, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          toast.success(respuesta?.data?.msg || 'Contraseña actualizada correctamente');
          return respuesta;
        } catch (error) {
          console.error('Error en updatePasswordProfile:', error);
          toast.error(error.response?.data?.msg || 'Error al actualizar la contraseña');
          throw error;
        }
      },
    }),
    {
      name: 'profile-storage',
    }
  )
);

export default storeProfile;