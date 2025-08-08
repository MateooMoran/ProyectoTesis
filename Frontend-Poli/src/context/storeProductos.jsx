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
      let url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/productos`;
      let config = token ? { config: { headers: { Authorization: `Bearer ${token}` } } } : {};

      if (token && user?.rol === 'vendedor') {
        url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/producto`;
        console.log('Usando endpoint vendedor:', url);
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

    set({ loadingCategorias: true, error: null });

    try {
      let url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/categoria`;
      let config = token ? { config: { headers: { Authorization: `Bearer ${token}` } } } : {};

      if (token && user?.rol === 'vendedor') {
        url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/categoria`;
        console.log('Usando endpoint vendedor/categoria:', url);
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

  getProductosPorCategoria: (categoriaId) => {
    return storeProductos.getState().productos.filter(
      (producto) => producto.categoria?._id === categoriaId
    );
  },
}));

export default storeProductos;