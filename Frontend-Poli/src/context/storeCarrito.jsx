import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";
import storeAuth from "../context/storeAuth"; 

const storeCarrito = create((set, get) => ({
  carrito: null,
  loading: false,
  error: null,

  fetchCarrito: async () => {
    const { token } = storeAuth.getState();
    if (!token) return;

    set({ loading: true });
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/estudiante/carrito`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ carrito: data, loading: false });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al cargar carrito");
      set({ loading: false });
    }
  },

  agregarProducto: async (productoId, cantidad) => {
    const { token } = storeAuth.getState();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/estudiante/carrito`,
        { productos: [{ producto: productoId, cantidad }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.msg);
      set({ carrito: data.carrito });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al agregar producto");
    }
  },

  disminuirCantidad: async (itemId) => {
    const { token } = storeAuth.getState();
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/estudiante/carrito/disminuir/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.msg);
      set({ carrito: data.carrito });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al disminuir cantidad");
    }
  },

  eliminarProducto: async (itemId) => {
    const { token } = storeAuth.getState();
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/estudiante/carrito/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.msg);
      set({ carrito: data.carrito });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al eliminar producto");
    }
  },

  vaciarCarrito: async () => {
    const { token } = storeAuth.getState();
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/estudiante/carrito`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.msg);
      set({ carrito: data.carrito });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al vaciar carrito");
    }
  }
}));

export default storeCarrito;
