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
            await fetchDataBackend(url, data, 'POST');

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
                await fetchDataBackend(url, null, 'GET');
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
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-semibold text-blue-900">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Ingresa tu nueva contraseña"
                            className="block w-full rounded-md border border-gray-300 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-2 px-3 text-gray-700"
                            {...register("password", { required: "La contraseña es obligatoria" })}
                        />
                        {errors.password && <p className="text-red-700 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    {/* Campo de confirmar contraseña */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-semibold text-blue-900">
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Repite tu contraseña"
                            className="block w-full rounded-md border border-gray-300 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-2 px-3 text-gray-700"
                            {...register("confirmPassword", { required: "La confirmación es obligatoria" })}
                        />
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