import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useFetch from '../hooks/useFetch';
import { toast } from '../utils/alerts';
import forgotImage from '../assets/forgot.webp'; 

export const Forgot = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { fetchDataBackend } = useFetch();

    const sendMail = async (data) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/recuperarpassword`;
            await fetchDataBackend(url, data, 'POST');
        } catch (error) {
            console.log(error);
            
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-blue-50 px-4">
            

            {/* Contenedor del formulario */}
            <div className="w-full max-w-sm sm:max-w-md bg-white p-6 sm:p-10 rounded-lg shadow-lg">
                <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-center uppercase text-blue-900">
                    ¿Olvidaste tu contraseña?
                </h1>
                <small className="text-gray-500 block my-4 text-sm text-center">
                    Ingresa tu correo electrónico y recibirás un enlace para restablecerla de forma segura.
                </small>

                <form onSubmit={handleSubmit(sendMail)}>
                    {/* Campo de correo electrónico */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-semibold text-blue-900">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="Ingresa un correo electrónico válido"
                            className="block w-full rounded-md border border-gray-300 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-2 px-3 text-gray-700"
                            {...register("email", { required: "El correo electrónico es requerido" })}
                        />
                        {errors.email && <p className="text-red-800 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Botón para enviar correo */}
                    <div className="mb-3">
                        <button
                            type="submit"
                            className="bg-blue-700 text-white border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 hover:bg-red-800"
                        >
                            Enviar correo
                        </button>
                    </div>
                </form>

                {/* Enlace para iniciar sesión */}
                <div className="mt-5 text-sm flex justify-between items-center">
                    <p className="text-gray-700">¿Ya tienes una cuenta?</p>
                    <Link
                        to="/login"
                        className="py-2 px-5 bg-blue-700 text-white border rounded-xl hover:scale-110 duration-300 hover:bg-red-700"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </div>

            {/* Imagen debajo del formulario */}
            <div className="mt-8">
                <img
                    src={forgotImage}
                    alt="Forgot Password"
                    className="w-48 sm:w-64 h-auto object-contain"
                />
            </div>
        </div>
    );
};

export default Forgot;