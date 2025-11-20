import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { alert } from '../utils/alerts';
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
          storeAuth.getState().setRol(respuesta.data.rol);
          set({ user: respuesta.data });
          return respuesta.data;
        } catch (error) {
          set({ user: null });
          storeAuth.getState().clearToken();
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
          alert({ icon: 'success', title: 'Actualizado correctamente' });
          return respuesta.data;
        } catch (error) {
          if (error.response?.data?.errores && Array.isArray(error.response.data.errores)) {
            error.response.data.errores.forEach(({ msg }) => alert({ icon: 'error', title: msg }));
            throw new Error('Errores en el formulario');
          }
          else if (error.response?.data?.msg) {
            alert({ icon: 'error', title: error.response.data.msg });
          }
          else {
            alert({ icon: 'error', title: 'Error al actualizar el perfil' });
          }
          throw error;
        }
      },

      updatePasswordProfile: async ({ passwordactual, passwordnuevo }, id) => {
        try {
          const { token } = storeAuth.getState();
          if (!token) throw new Error('No hay token');
          const url = `${import.meta.env.VITE_BACKEND_URL}/perfil/actualizarpassword/${id}`;
          const respuesta = await axios.put(url, { passwordactual, passwordnuevo }, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          alert({ icon: 'success', title: 'Actualizado correctamente' });
          return respuesta.data;
        } catch (error) {
          if (error.response?.data?.errores && Array.isArray(error.response.data.errores)) {
            error.response.data.errores.forEach(({ msg }) => alert({ icon: 'error', title: msg }));
            throw new Error('Errores en el formulario');
          } else if (error.response?.data?.msg) {
            alert({ icon: 'error', title: error.response.data.msg });
          } else {
            alert({ icon: 'error', title: 'Error al actualizar la contraseña' });
          }
          throw error;
        }
      },

    }),
    { name: 'profile-storage' }
  )
);

export default storeProfile;
