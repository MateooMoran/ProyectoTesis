import { Outlet } from 'react-router-dom';
import Productos from '../pages/Productos';
import Sidebar from '../pages/Sidebar';
const Dashboard = () => {
    return (
        <div className='md:flex md:min-h-screen bg-blue-50'>
            {/* Sidebar */}

            {/* Main */}
            <div className='flex-1 flex flex-col justify-between h-screen bg-blue-50'>
                {/* Content */}
                <main className='overflow-y-scroll p-8'>
                    < Outlet/>
                </main>
                {/* Footer */}
                <footer className="bg-blue-950 py-4">
                    <div className="text-center">
                        <p className="text-white underline mb-2">
                            © 2025 PoliVentas - Todos los derechos reservados.
                        </p>
                        <div className="flex justify-center gap-6">
                            <a
                                href="#"
                                className="text-white hover:text-red-400 transition-colors"
                            >
                                Facebook
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-red-400 transition-colors"
                            >
                                Instagram
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-red-400 transition-colors"
                            >
                                Twitter
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Dashboard;

