import { create } from 'zustand';
import useFetch from '../hooks/useFetch';
import storeAuth from '../context/storeAuth';

const storeProductos = create((set) => ({
  productos: [],
  categorias: [],
  loadingProductos: false,
  loadingCategorias: false,
  error: null,

  fetchProductos: async () => {
    const { fetchDataBackend } = useFetch();
    const { token, user } = storeAuth.getState();
    console.log('fetchProductos: token=', token, 'user.rol=', user?.rol);

    set({ loadingProductos: true, error: null });

    try {
      let url;
      let config = token ? { config: { headers: { Authorization: `Bearer ${token}` } } } : {};
      if (!token) {
        // Endpoint público (debe implementarse en el backend)
        url = `${import.meta.env.VITE_BACKEND_URL}/productos`;
        console.log('Intentando endpoint público:', url);
      } else if (user?.rol === 'estudiante') {
        url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/productos`;
        console.log('Usando endpoint estudiante:', url);
      } else if (user?.rol === 'vendedor') {
        url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/producto`;
        console.log('Usando endpoint vendedor:', url);
      } else if (user?.rol === 'admin') {
        url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/productos`; // Fallback
        console.log('Usando endpoint admin (fallback):', url);
      } else {
        throw new Error('Rol no permitido para ver productos.');
      }

      const response = await fetchDataBackend(url, { method: 'GET', ...config });
      console.log('Respuesta de productos:', response);
      set({ productos: response, loadingProductos: false });
    } catch (error) {
      const errorMessage = error.message || 'Error al cargar los productos';
      console.error('Error en fetchProductos:', errorMessage, error);
      set({ error: errorMessage, loadingProductos: false });
    }
  },

  fetchCategorias: async () => {
    const { fetchDataBackend } = useFetch();
    const { token, user } = storeAuth.getState();
    console.log('fetchCategorias: token=', token, 'user.rol=', user?.rol);

    if (!token) {
      set({ error: 'No estás autenticado para ver categorías.', loadingCategorias: false });
      return;
    }

    set({ loadingCategorias: true, error: null });
    try {
      let url;
      const config = { config: { headers: { Authorization: `Bearer ${token}` } } };
      if (user?.rol === 'estudiante') {
        url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/categoria`;
      } else if (user?.rol === 'vendedor') {
        url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/categoria`;
      } else if (user?.rol === 'admin') {
        url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/categoria`; // Fallback
      } else {
        throw new Error('Rol no permitido para ver categorías.');
      }

      const response = await fetchDataBackend(url, { method: 'GET', ...config });
      console.log('Respuesta de categorías:', response);
      set({ categorias: response, loadingCategorias: false });
    } catch (error) {
      const errorMessage = error.message || 'Error al cargar las categorías';
      console.error('Error en fetchCategorias:', errorMessage, error);
      set({ error: errorMessage, loadingCategorias: false });
    }
  },

  getProductosPorCategoria: (categoriaNombre) => {
    return storeProductos.getState().productos.filter(
      (producto) => producto.categoria?.nombreCategoria?.toLowerCase() === categoriaNombre.toLowerCase()
    );
  },
}));

export default storeProductos;