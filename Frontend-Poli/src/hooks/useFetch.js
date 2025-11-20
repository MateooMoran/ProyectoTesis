import axios from 'axios';
import { alert } from '../utils/alerts';

function useFetch() {
  const fetchDataBackend = async (url, options = {}) => {
    try {
      const isPlainPost = !options.method && !options.config;
      const method = isPlainPost ? 'POST' : options.method || 'POST';
      const body = isPlainPost ? options : options.body || null;
      const config = options.config || {};

      let respuesta;

      switch (method.toUpperCase()) {
        case 'POST':
          respuesta = await axios.post(url, body, config);
          break;
        case 'GET':
          respuesta = await axios.get(url, config);
          break;
        case 'PUT':
          respuesta = await axios.put(url, body || {}, config);
          break;
        case 'PATCH':
          respuesta = await axios.patch(url, body || {}, config);
          break;
        case 'DELETE':
          respuesta = await axios.delete(url, config);
          break;
        default:
          throw new Error(`Método ${method} no soportado`);
      }

      if (respuesta?.data?.msg) alert({ icon: 'success', title: respuesta.data.msg });
      return respuesta?.data;

    } catch (error) {
        if (error.response?.data?.errores && Array.isArray(error.response.data.errores)) {
        error.response.data.errores.forEach(({ msg }) => alert({ icon: 'error', title: msg }));
        throw new Error('Errores en el formulario');
      }

      // Manejo del mensaje único de error
      const errorMsg = error.response?.data?.msg || 'Error desconocido';
      alert({ icon: 'error', title: errorMsg });
      throw new Error(errorMsg);
    }
  };

  return { fetchDataBackend };
}

export default useFetch;
