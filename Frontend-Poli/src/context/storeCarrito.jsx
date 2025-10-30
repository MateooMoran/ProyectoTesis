// src/context/storeCarrito.js
import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";
import storeAuth from "../context/storeAuth";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const useCarritoStore = create((set, get) => ({
  carrito: null,
  loading: false,
  error: null,

  getToken: () => storeAuth.getState()?.token || null,
  getAuthHeaders: (token) => ({ headers: { Authorization: `Bearer ${token}` } }),

  fetchCarrito: async () => {
    const token = get().getToken();
    if (!token) return;

    set({ loading: true, error: null });
    try {
      const { data } = await axios.get(`${API_BASE}/estudiante/carrito`, get().getAuthHeaders(token));
      set({ carrito: data, loading: false });
    } catch (error) {
      const msg = error.response?.data?.msg || "Error al cargar";
      toast.error(msg);
      set({ loading: false, error: msg });
    }
  },

  agregarProducto: async (productoId, cantidad = 1) => {
    const token = get().getToken();
    if (!token) return toast.error("Inicia sesión");

    try {
      const { data } = await axios.post(
        `${API_BASE}/estudiante/carrito`,
        { productos: [{ producto: productoId, cantidad }] },
        get().getAuthHeaders(token)
      );
      set({ carrito: data.carrito });
      toast.success(data.msg);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al agregar");
    }
  },

  disminuirCantidad: async (itemId) => {
    const token = get().getToken();
    if (!token) return;

    set({ loading: true });
    try {
      const { data } = await axios.put(
        `${API_BASE}/estudiante/carrito/disminuir/${itemId}`,
        {},
        get().getAuthHeaders(token)
      );
      set({ carrito: data.carrito, loading: false });
      toast.success(data.msg);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error");
      set({ loading: false });
    }
  },

  aumentarCantidad: async (itemId) => {
    const token = get().getToken();
    if (!token) return;

    set({ loading: true });
    try {
      const { data } = await axios.put(
        `${API_BASE}/estudiante/carrito/aumentar/${itemId}`,
        {},
        get().getAuthHeaders(token)
      );
      set({ carrito: data.carrito, loading: false });
      toast.success(data.msg);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Stock insuficiente");
      set({ loading: false });
    }
  },

  eliminarProducto: async (itemId) => {
    const token = get().getToken();
    if (!token) return;

    try {
      const { data } = await axios.delete(
        `${API_BASE}/estudiante/carrito/${itemId}`,
        get().getAuthHeaders(token)
      );
      set({ carrito: data.carrito || null });
      toast.success(data.msg);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al eliminar");
    }
  },

  vaciarCarrito: async () => {
    const token = get().getToken();
    if (!token) return;

    try {
      const { data } = await axios.delete(`${API_BASE}/estudiante/carrito`, get().getAuthHeaders(token));
      set({ carrito: null });
      toast.success(data.msg);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al vaciar");
    }
  },

  hasProducts: () => !!get().carrito?.productos?.length,
  getTotalItems: () => get().carrito?.productos?.length || 0,
  getTotalPrice: () => get().carrito?.total || 0,
}));

export default useCarritoStore;