import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { alert } from '../utils/alerts';
import confirmImage from '../assets/logo.png';

export const Confirm = () => {
    const { token } = useParams();

    const verifyToken = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/confirmar/${token}`;
            const respuesta = await axios.get(url);
            alert({ icon: 'success', title: respuesta?.data?.msg });
        } catch (error) {
            alert({ icon: 'error', title: error?.response?.data?.msg || 'Error al confirmar cuenta' });
        }
    };

    useEffect(() => {
        verifyToken();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
            

            {/* Imagen de confirmación */}
            <img
                className="h-50 w-50 sm:h-48 sm:w-48 lg:h-60 lg:w-60"
                src={confirmImage}
                alt="Confirmación exitosa"
            />

            {/* Mensaje de confirmación */}
            <div className="w-full max-w-lg bg-white p-10 rounded-lg shadow-lg text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
                    ¡Gracias por unirte a <span className="text-red-700">PoliVentas</span>!
                </h1>
                <p className="text-sm sm:text-base text-gray-700 mt-4">
                    Tu cuenta ha sido confirmada exitosamente. Ahora puedes iniciar sesión y comenzar a explorar los mejores productos de nuestra comunidad.
                </p>

                {/* Botón para iniciar sesión */}
                <Link
                    to="/login"
                    className="mt-6 inline-block py-2 px-6 bg-blue-800 text-white font-semibold rounded-lg shadow-md hover:bg-red-800 hover:scale-105 transition-transform duration-300"
                >
                    Iniciar Sesión
                </Link>
            </div>
        </div>
    );
};

export default Confirm;