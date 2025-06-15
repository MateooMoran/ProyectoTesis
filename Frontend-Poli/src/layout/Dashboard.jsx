import { Link, Outlet, useLocation } from 'react-router-dom';

const Dashboard = () => {
    const location = useLocation();
    const urlActual = location.pathname;

    return (
        <div className="md:flex md:min-h-screen">
            {/* Sidebar */}
            <div className="md:w-1/5 bg-blue-700 px-5 py-4">
                <h2 className="text-4xl font-black text-center text-white">Poli<span className="text-red-600">Ventas</span></h2>

                <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    alt="img-client"
                    className="m-auto mt-8 p-1 border-2 border-white rounded-full"
                    width={120}
                    height={120}
                />
                <p className="text-white text-center my-4 text-sm">
                    <span className="bg-green-600 w-3 h-3 inline-block rounded-full"></span> Bienvenido - 
                </p>
                <p className="text-white text-center my-4 text-sm">Rol - </p>
                <hr className="mt-5 border-white" />

                <ul className="mt-5">
                    <li className="text-center">
                        <Link
                            to="/dashboard"
                            className={`${
                                urlActual === '/dashboard'
                                    ? 'text-white bg-red-600 px-3 py-2 rounded-md'
                                    : 'text-white hover:bg-red-600 hover:text-white'
                            } text-xl block mt-2`}
                        >
                            Perfil
                        </Link>
                    </li>
                    <li className="text-center">
                        <Link
                            to="/dashboard/listar"
                            className={`${
                                urlActual === '/dashboard/listar'
                                    ? 'text-white bg-red-600 px-3 py-2 rounded-md'
                                    : 'text-white hover:bg-red-600 hover:text-white'
                            } text-xl block mt-2`}
                        >
                            Listar
                        </Link>
                    </li>
                    <li className="text-center">
                        <Link
                            to="/dashboard/crear"
                            className={`${
                                urlActual === '/dashboard/crear'
                                    ? 'text-white bg-red-600 px-3 py-2 rounded-md'
                                    : 'text-white hover:bg-red-600 hover:text-white'
                            } text-xl block mt-2`}
                        >
                            Crear
                        </Link>
                    </li>
                    <li className="text-center">
                        <Link
                            to="/dashboard/chat"
                            className={`${
                                urlActual === '/dashboard/chat'
                                    ? 'text-white bg-red-600 px-3 py-2 rounded-md'
                                    : 'text-white hover:bg-red-600 hover:text-white'
                            } text-xl block mt-2`}
                        >
                            Chat
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-between h-screen bg-white">
                {/* Header */}
                <div className="bg-blue-700 py-2 flex md:justify-end items-center gap-5 justify-center">
                    <div className="text-md font-semibold text-white">Usuario - </div>
                    <div>
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
                            alt="img-client"
                            className="border-2 border-green-600 rounded-full"
                            width={50}
                            height={50}
                        />
                    </div>
                    <div>
                        <Link
                            to="/"
                            className="text-white mr-3 text-md block hover:bg-red-900 text-center bg-red-800 px-4 py-1 rounded-lg"
                        >
                            Salir
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-scroll p-8">
                    <Outlet />
                </div>

                {/* Footer */}
                <div className="bg-blue-700 h-12">
                    <p className="text-center text-white leading-[2.9rem] underline">
                        © 2025 PoliVentas - Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;