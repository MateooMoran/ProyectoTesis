import { Outlet } from 'react-router-dom';

import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import Footer from './Footer'


const Dashboard = () => {
    return (
        <div className='md:flex md:min-h-screen bg-blue-50'>
            {/* Sidebar */}

            {/* Main */}
            <div className='flex-1 flex flex-col justify-between h-screen bg-blue-50'>
                {/* Content */}
                <main className='overflow-y-scroll p-8'>
                    < Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default Dashboard;

