import { useState } from "react";
import { Link } from "react-router-dom";  // corregido import react-router-dom
import { useForm } from "react-hook-form";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const registro = async (data) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/registro`;
            const respuesta = await axios.post(url, data);
            toast.success(respuesta.data.msg);
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error en el registro');
        }
    }

    return (
        <div className="flex flex-col sm:flex-row h-screen">
            <ToastContainer />
            {/* Contenedor del formulario a la izquierda */}
            <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center">
                <div className="md:w-4/5 sm:w-full">
                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-blue-800">Crear cuenta</h1>
                    <small className="text-gray-500 block my-4 text-sm">Llena los siguientes campos</small>

                    <form onSubmit={handleSubmit(registro)}>
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold text-blue-800">Nombre</label>
                            <input
                                type="text"
                                placeholder="Ingresa tu nombre"
                                className="block w-full rounded-md border border-gray-300 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800 py-1 px-2 text-gray-800"
                                {...register("nombre", { required: "El nombre es obligatorio" })}
                            />
                            {errors.nombre && <p className="text-red-800">{errors.nombre.message}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold text-blue-800">Apellido</label>
                            <input
                                type="text"
                                placeholder="Ingresa tu apellido"
                                className="block w-full rounded-md border border-gray-300 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800 py-1 px-2 text-gray-800"
                                {...register("apellido", { required: "El apellido es obligatorio" })}
                            />
                            {errors.apellido && <p className="text-red-800">{errors.apellido.message}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold text-blue-800">Teléfono</label>
                            <input
                                type="text"
                                placeholder="Ingresa tu número de teléfono"
                                className="block w-full rounded-md border border-gray-300 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800 py-1 px-2 text-gray-800"
                                {...register("telefono", { required: "El teléfono es obligatorio" })}
                            />
                            {errors.telefono && <p className="text-red-800">{errors.telefono.message}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold text-blue-800">Dirección</label>
                            <input
                                type="text"
                                placeholder="Ingresa tu dirección"
                                className="block w-full rounded-md border border-gray-300 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800 py-1 px-2 text-gray-800"
                                {...register("direccion", { required: "La dirección es obligatoria" })}
                            />
                            {errors.direccion && <p className="text-red-800">{errors.direccion.message}</p>}
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold text-blue-800">Correo electrónico</label>
                            <input
                                type="email"
                                placeholder="Ingresa tu correo"
                                className="block w-full rounded-md border border-gray-300 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800 py-1 px-2 text-gray-700"
                                {...register("email", { required: "El correo electrónico es obligatorio" })}
                            />
                            {errors.email && <p className="text-red-800">{errors.email.message}</p>}
                        </div>

                        {/* Campo para contraseña */}
                        <div className="mb-3 relative text-blue-800">
                            <label className="mb-2 block text-sm font-semibold">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="********************"
                                    className="block w-full rounded-md border border-gray-300 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-1 px-1.5 text-gray-500 pr-10"
                                    {...register("password", { required: "La contraseña es obligatoria" })}
                                />
                                {errors.password && <p className="text-red-800">{errors.password.message}</p>}
                                {/* Botón para mostrar/ocultar la contraseña */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                                >
                                    {/* Icono que cambia según el estado de la contraseña */}
                                    {showPassword ? (
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.95 0a9.96 9.96 0 0119.9 0m-19.9 0a9.96 9.96 0 0119.9 0M3 3l18 18" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mb-3">
                            <button className="w-full py-2 my-5 bg-blue-800 text-white rounded-xl hover:scale-105 duration-300 hover:bg-red-700">Registrarse</button>
                        </div>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-gray-600 ">¿Ya tienes una cuenta?</span>{' '}
                        <Link to="/login" className="border-b-2 hover:text-red-700">Iniciar Sesión</Link>
                    </div>
                </div>
            </div>

            {/* Imagen de fondo a la derecha */}
            <div
                className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/src/assets/Sistemas.jpg')] bg-no-repeat bg-cover bg-center sm:block hidden"
            />
        </div>
    );
}

export default Register;
