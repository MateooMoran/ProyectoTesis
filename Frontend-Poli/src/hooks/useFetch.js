import axios from 'axios';
import { toast } from 'react-toastify';

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
        case 'DELETE':
          respuesta = await axios.delete(url, config);
          break;
        default:
          throw new Error(`Método ${method} no soportado`);
      }

      if (respuesta?.data?.msg) toast.success(respuesta.data.msg);
      return respuesta?.data;

    } catch (error) {
      const errorMsg = error.response?.data?.msg || 'Error desconocido';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return { fetchDataBackend };
}

export default useFetch;