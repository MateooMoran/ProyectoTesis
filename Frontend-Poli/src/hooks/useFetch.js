import axios from 'axios';
import { toast } from 'react-toastify';

function useFetch() {
  const fetchDataBackend = async (url, options = {}) => {
    try {
      // Si options es un objeto plano (form), asumimos POST sin config
      const isForm = !options.method && !options.config;
      const method = isForm ? 'POST' : options.method || 'POST';
      const form = isForm ? options : options.form || null;
      const config = options.config || {};

      let respuesta;
      switch (method.toUpperCase()) {
        case 'POST':
          respuesta = await axios.post(url, form, config);
          break;
        case 'GET':
          respuesta = await axios.get(url, config);
          break;
        case 'PUT':
          respuesta = await axios.put(url, form, config);
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