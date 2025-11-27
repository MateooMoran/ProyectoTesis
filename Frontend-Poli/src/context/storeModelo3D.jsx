import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const storeModelo3D = create(
  persist(
    (set) => ({
      generando: false,
      progreso: 0,
      estado: '',
      productoId: null,
      productoNombre: '',
      
      iniciarGeneracion: (productoId, productoNombre) => 
        set({ 
          generando: true, 
          progreso: 0, 
          estado: 'Iniciando...', 
          productoId,
          productoNombre 
        }),
      
      actualizarProgreso: (progreso, estado) => 
        set({ progreso, estado }),
      
      completarGeneracion: () => 
        set({ 
          generando: false, 
          progreso: 100, 
          estado: '¡Completado!',
          productoId: null,
          productoNombre: ''
        }),
      
      cancelarGeneracion: () => 
        set({ 
          generando: false, 
          progreso: 0, 
          estado: '', 
          productoId: null,
          productoNombre: ''
        }),
      
      resetearModelo: () =>
        set({
          generando: false,
          progreso: 0,
          estado: '',
          productoId: null,
          productoNombre: ''
        })
    }),
    {
      name: 'modelo3d-storage',
    }
  )
);

export default storeModelo3D;
