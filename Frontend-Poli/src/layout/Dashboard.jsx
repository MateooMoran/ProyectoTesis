import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer'

const Dashboard = () => {
    return (
        <>
            <Header />
            <div className='flex flex-col min-h-screen bg-blue-50'>
                <main className='flex-1 overflow-y-auto pt-8'>
                    <Outlet />
                </main>
                <Footer />
            </div>
        </>
    );
};

export default Dashboard;