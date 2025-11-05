import { create } from 'zustand';
import useFetch from '../hooks/useFetch';
import storeAuth from '../context/storeAuth';

const storeProductos = create((set, get) => {
  let fetchingProductos = false;
  let fetchingCategorias = false;

  return {
    productos: [],
    categorias: [],
    loadingProductos: false,
    loadingCategorias: false,
    error: null,

    fetchProductos: async () => {
      // Evita múltiples llamadas simultáneas
      if (fetchingProductos) return;
      fetchingProductos = true;

      const { fetchDataBackend } = useFetch();
      const token = storeAuth.getState().token;
      const rol = storeAuth.getState().rol;

      set({ loadingProductos: true, error: null });

      try {
        let url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/productos`;
        let config = {};

        if (token && rol === 'vendedor') {
          url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/producto`;
          config = { config: { headers: { Authorization: `Bearer ${token}` } } };
          console.log('Usando endpoint vendedor:', url);
        } else {
          console.log('Usando endpoint público:', url);
        }

        const response = await fetchDataBackend(url, { method: 'GET', ...config });
        console.log('Respuesta de productos:', response);
        set({ productos: response, loadingProductos: false });
      } catch (error) {
        const errorMessage = error.message || 'Error al cargar los productos';
        console.error('Error en fetchProductos:', errorMessage, error);
        set({ error: errorMessage, loadingProductos: false });
      } finally {
        fetchingProductos = false;
      }
    },

    fetchCategorias: async () => {
      // Evita múltiples llamadas simultáneas
      if (fetchingCategorias) return;
      fetchingCategorias = true;

      const { fetchDataBackend } = useFetch();
      const token = storeAuth.getState().token;
      const rol = storeAuth.getState().rol;
      console.log('fetchCategorias: token=', token, 'user.rol=', rol);

      set({ loadingCategorias: true, error: null });

      try {
        let url = `${import.meta.env.VITE_BACKEND_URL}/estudiante/categoria`;
        let config = {};

        if (token && rol === 'vendedor') {
          url = `${import.meta.env.VITE_BACKEND_URL}/vendedor/visualizar/categoria`;
          config = { config: { headers: { Authorization: `Bearer ${token}` } } };
          console.log('Usando endpoint vendedor/categoria:', url);
        } else {
          console.log('Usando endpoint público:', url);
        }

        const response = await fetchDataBackend(url, { method: 'GET', ...config });
        console.log('Respuesta de categorías:', response);
        set({ categorias: response, loadingCategorias: false });
      } catch (error) {
        const errorMessage = error.message || 'Error al cargar las categorías';
        console.error('Error en fetchCategorias:', errorMessage, error);
        set({ error: errorMessage, loadingCategorias: false });
      } finally {
        fetchingCategorias = false;
      }
    },

    getProductosPorCategoria: (categoriaId) => {
      return get().productos.filter(
        (producto) => producto.categoria?._id === categoriaId
      );
    },
  };
});

export default storeProductos;