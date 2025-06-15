import { Link } from "react-router-dom";

const Register = () => {

    return (
        <div className="flex flex-col sm:flex-row h-screen">
            {/* Imagen de fondo */}
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/src/assets/Sistemas.jpg')] 
            bg-no-repeat bg-cover bg-center sm:block hidden">
            </div>

            {/* Contenedor del formulario */}
            <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center">
                <div className="md:w-4/5 sm:w-full">
                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-blue-700">Crear cuenta</h1>
                    <small className="text-gray-500 block my-4 text-sm">Llena los siguientes campos</small>

                    <form>
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold text-blue-700">Nombre</label>
                            <input type="text" placeholder="Ingresa tu nombre" className="block w-full rounded-md border border-gray-300 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-1 px-2 text-gray-700" />
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold text-blue-700">Apellido</label>
                            <input type="text" placeholder="Ingresa tu apellido" className="block w-full rounded-md border border-gray-300 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-1 px-2 text-gray-700" />
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold text-blue-700">Teléfono</label>
                            <input type="text" placeholder="Ingresa tu número de teléfono" className="block w-full rounded-md border border-gray-300 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-1 px-2 text-gray-700" />
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold text-blue-700">Dirección</label>
                            <input type="text" placeholder="Ingresa tu dirección" className="block w-full rounded-md border border-gray-300 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-1 px-2 text-gray-700" />
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold text-blue-700">Correo electrónico</label>
                            <input type="email" placeholder="Ingresa tu correo" className="block w-full rounded-md border border-gray-300 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-1 px-2 text-gray-700" />
                        </div>

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold text-blue-700">Contraseña</label>
                            <input type="password" placeholder="Ingresa tu contraseña" className="block w-full rounded-md border border-gray-300 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-1 px-2 text-gray-700" />
                        </div>

                        <button type="submit" className="w-full py-2 my-5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 duration-300">Registrarse</button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-gray-600">¿Ya tienes una cuenta?</span>{' '}
                        <Link to="/login" className="
                        border-b-2">Iniciar Sesión</Link>
                    </div>
                </div>
            </div>
        </div>


    );
}

export default Register;