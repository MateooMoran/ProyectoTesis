import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import GestionarQuejasSugerencias from "./GestionQuejasSugerencias";
import { ToastContainer } from 'react-toastify'
function GestionarUsuario() {
    const { fetchDataBackend } = useFetch();
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const obtenerUsuarios = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/admin/usuario`;
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser?.state?.token || ''}`,
            };
            const response = await fetchDataBackend(url, {
                method: "GET",
                config: { headers },
            });
            setUsuarios(response);
        };
        obtenerUsuarios();
    }, []);

    const cambiarRolUsuario = async (idUsuario, nuevoRol) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/admin/rol/${idUsuario}`;
        const storedUser = JSON.parse(localStorage.getItem("auth-token"));
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser?.state?.token || ''}`,
        };
        const body = { rol: nuevoRol };
        await fetchDataBackend(url, {
            method: "PUT",
            form: body,
            config: { headers },
        });
        setUsuarios((prev) =>
            prev.map((user) =>
                user._id === idUsuario ? { ...user, rol: nuevoRol } : user
            )
        );
    };

    return (
        <>
            <ToastContainer></ToastContainer>
            <GestionarQuejasSugerencias></GestionarQuejasSugerencias>
            <div className="p-6 max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6  text-gray-500">Gestión de Usuarios</h2>

                {usuarios.length === 0 ? (
                    <p className="text-center text-gray-500">Cargando usuarios...</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {/* Encabezado */}
                        <div className="hidden sm:flex text-blue-800 text-sm font-semibold px-4">
                            <div className="flex-1">Nombre</div>
                            <div className="flex-1">Teléfono</div>
                            <div className="flex-[0.7]">Rol</div>
                            <div className="flex-[0.7]">Estado</div>
                            <div className="flex-[0.9]">Cambiar Rol</div>
                        </div>

                        {/* Lista de usuarios */}
                        {usuarios.map((user) => (
                            <div
                                key={user._id}
                                className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-0 bg-white shadow-sm rounded-lg px-4 py-3 hover:shadow-md transition-shadow"
                            >
                                {/* Nombre */}
                                <div className="flex-1 flex items-center space-x-3 text-gray-800 font-medium text-sm">
                                    <img
                                        src="https://media-public.canva.com/rVvfU/MAFlPzrVvfU/1/tl.png"
                                        alt={`${user.nombre} avatar`}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span>{user.nombre} {user.apellido}</span>
                                </div>

                                {/* Telefono */}
                                <div className="flex-1 text-gray-600 text-sm">{user.telefono}</div>

                                {/* Rol */}
                                <div className="flex-[0.7] text-gray-700 capitalize text-sm">{user.rol}</div>

                                {/* Estado */}
                                <div className="flex-[0.7]">
                                    {user.estado ? (
                                        <span className="inline-block px-2 py-0.5 text-green-800 bg-green-100 rounded-full text-xs font-semibold">
                                            Activo
                                        </span>
                                    ) : (
                                        <span className="inline-block px-2 py-0.5 text-red-800 bg-red-100 rounded-full text-xs font-semibold">
                                            Inactivo
                                        </span>
                                    )}
                                </div>

                                {/* Seleccionamos el Rol */}
                                <div className="flex-[0.9]">
                                    <select
                                        value={user.rol}
                                        onChange={(e) => cambiarRolUsuario(user._id, e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 cursor-pointer appearance-none"
                                    >
                                        <option value="estudiante">Estudiante</option>
                                        <option value="vendedor">Vendedor</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default GestionarUsuario;
