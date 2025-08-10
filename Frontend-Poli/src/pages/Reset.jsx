import logoReset from '../assets/reset.webp';
import { ToastContainer, toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useForm } from 'react-hook-form';
import 'react-toastify/dist/ReactToastify.css';

const Reset = () => {
    const { token } = useParams();
    const [tokenValid, setTokenValid] = useState(false);
    const { fetchDataBackend } = useFetch();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const changePassword = async (data) => {
        const { password, confirmPassword } = data;

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            return;
        }

        // Validar la longitud de la contraseña
        if (password.length < 4) {
            toast.error('La contraseña debe tener al menos 4 caracteres.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/nuevopassword/${token}`;
            await fetchDataBackend(url, { method: 'POST', body: data });

            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.log(error);

        }
    };

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/recuperarpassword/${token}`;
                await fetchDataBackend(url, { method: 'GET' });
                setTokenValid(true);
            } catch (error) {
                console.log(error);
            }
        };
        verifyToken();
    }, []);


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-blue-50 px-4">
            <ToastContainer />

            <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-blue-900">
                Restablecer Contraseña
            </h1>
            <small className="text-gray-500 block my-4 text-sm text-center">
                Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
            </small>

            <img
                className="w-40 h-40 sm:w-60 sm:h-60 object-contain mb-6"
                src={logoReset}
                alt="Reset Password"
            />

            {tokenValid && (
                <form className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg" onSubmit={handleSubmit(changePassword)}>
                    {/* Campo de nueva contraseña */}
                    <div className="mb-4 relative">
                        <label className="mb-2 block text-sm font-semibold text-blue-900">
                            Nueva contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword1 ? "text" : "password"}
                                placeholder="Ingresa tu nueva contraseña"
                                className="block w-full rounded-md border border-gray-300 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-2 px-3 text-gray-700 pr-10"
                                {...register("password", { required: "La contraseña es obligatoria" })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword1(!showPassword1)}
                                className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword1 ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.95 0a9.96 9.96 0 0119.9 0M3 3l18 18" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-700 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    {/* Campo de confirmar contraseña */}
                    <div className="mb-4 relative">
                        <label className="mb-2 block text-sm font-semibold text-blue-900">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword2 ? "text" : "password"}
                                placeholder="Repite tu contraseña"
                                className="block w-full rounded-md border border-gray-300 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-2 px-3 text-gray-700 pr-10"
                                {...register("confirmPassword", { required: "La confirmación es obligatoria" })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword2(!showPassword2)}
                                className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword2 ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.95 0a9.96 9.96 0 0119.9 0M3 3l18 18" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-700 text-sm mt-1">{errors.confirmPassword.message}</p>}
                    </div>


                    {/* Botón para enviar */}
                    <div className="mb-3">
                        <button
                            type="submit"
                            className="bg-blue-700 text-white border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 hover:bg-red-700"
                        >
                            Restablecer Contraseña
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Reset;