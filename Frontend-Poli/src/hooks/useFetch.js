import axios from "axios";
import { toast } from "react-toastify";

function useFetch() {
  const fetchDataBackend = async (
    url,
    data = null,
    method = "GET",
    headers = {}
  ) => {
    const loadingToast = toast.loading("Procesando solicitud...");
    try {
      // Construimos la configuración base para axios
      const options = {
        method: method.toUpperCase(),
        url,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      // Para métodos que envían body (POST, PUT, PATCH, DELETE a veces)
      // incluimos data solo si no es GET o HEAD
      if (!["GET", "HEAD"].includes(options.method) && data) {
        options.data = data;
      }

      // Ejecutamos la llamada con axios
      const response = await axios(options);

      // Mostramos mensaje si viene en respuesta
      if (response?.data?.msg) toast.success(response.data.msg);

      return response.data;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Error desconocido");
      throw error; // para que el componente que llama pueda capturar el error también
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return { fetchDataBackend };
}

export default useFetch;
