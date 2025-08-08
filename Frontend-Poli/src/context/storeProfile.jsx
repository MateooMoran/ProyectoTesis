import { create } from "zustand"
import axios from "axios"
import { toast } from 'react-toastify'
const getAuthHeaders = () => {
    const storeUser = JSON.parse(localStorage.getItem("auth-token"))
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storeUser.state.token}`
        }
    }
}


const storProfile = create(set => ({
    user: null,
    clearUser: () => set({ user: null }),

    profile: async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/perfil`
            const respuesta = await axios.get(url, getAuthHeaders())
            set({ user: respuesta.data })
            console.log(respuesta.data)
        } catch (error) {
            console.log(error)
        }
    },
    updateProfile: async (data, id) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/perfil/actualizarperfil/${id}`
            const respuesta = await axios.put(url, data, getAuthHeaders())
            set({ user: respuesta.data })
            toast.success("Perfil actualizado correctamente")
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.msg)
        }
    },
    updatePasswordProfile: async (data, id) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/perfil/actualizarpassword/${id}`
            const respuesta = await axios.put(url, data, getAuthHeaders())
            toast.success(respuesta?.data?.msg)
            return respuesta
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.msg)
        }
    }
}))

export default storProfile