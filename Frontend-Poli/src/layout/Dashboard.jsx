import { Outlet } from 'react-router-dom';
import Sidebar from '../pages/Sidebar';
const Dashboard = () => {
    return (
        <div className='md:flex md:min-h-screen bg-blue-50'>
            {/* Sidebar */}
            <Sidebar />

            {/* Main */}
            <div className='flex-1 flex flex-col justify-between h-screen bg-blue-50'>
                {/* Content */}
                <main className='overflow-y-scroll p-8'>
                    <Outlet />
                </main>
                {/* Footer */}
                <footer className='bg-blue-950 h-12'>
                    <p className='text-center text-white leading-[2.9rem] underline'>
                        © 2025 PoliVentas - Todos los derechos reservados.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Dashboard;