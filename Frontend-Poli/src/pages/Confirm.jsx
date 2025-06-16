import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confirmImage from '../assets/Escuela_Politécnica_Nacional.png';
import backimg from '../assets/fondoConfirmar.jpeg'; 

export const Confirm = () => {
    const { token } = useParams();

    const verifyToken = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/confirmar/${token}`;
            const respuesta = await axios.get(url);
            toast.success(respuesta?.data?.msg, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            toast.error(error?.response?.data?.msg || 'Error al confirmar cuenta', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    useEffect(() => {
        verifyToken();
    }, []);

    return (
        <div className="relative h-screen w-full">
            {/* Imagen de fondo difuminada */}
            <div
                className="absolute inset-0 bg-cover bg-center filter blur-md"
                style={{ backgroundImage: `url(${backimg})` }}
            ></div>

            {/* Contenido principal */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
                <ToastContainer />

                {/* Imagen de confirmación */}
                <img
                    className="h-32 w-32 sm:h-48 sm:w-48 lg:h-60 lg:w-60 object-contain"
                    src={confirmImage}
                    alt="Confirmación exitosa"
                />

                {/* Mensaje de confirmación */}
                <div className="flex flex-col items-center justify-center mt-8 bg-white/50 bg-opacity-90 p-4 sm:p-6 shadow-lg">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 text-center">
                        ¡Gracias por unirte a <span className="text-red-700">PoliVentas</span>!
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-800 mt-4 text-center">
                        Tu cuenta ha sido confirmada exitosamente. Ahora puedes iniciar sesión y comenzar a explorar los mejores productos de nuestra comunidad.
                    </p>

                    {/* Botón para iniciar sesión */}
                    <Link
                        to="/login"
                        className="mt-6 py-2 px-4 sm:py-3 sm:px-6 bg-blue-800 text-white font-semibold rounded-lg shadow-md hover:bg-red-800 hover:scale-105 transition-transform duration-300 text-sm sm:text-base"
                    >
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Confirm;