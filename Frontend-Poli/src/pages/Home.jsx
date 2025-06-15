import React from 'react';
import { Link } from 'react-router-dom';

import xd from '../assets/xd.jpeg';
import comida from '../assets/comidas-rapidas.jpg';
import ropa from '../assets/Ropa.jpeg';
import ropa2 from '../assets/Ropa2.jpeg';
import libro from '../assets/Libros.jpeg';



export const Home = () => {
    return (
        <>
            {/* Header */}
            <header className="bg-white shadow-md py-4">
                <div className="container mx-auto flex justify-between items-center px-4">
                    <h1 className="text-3xl font-bold text-blue-900">
                        <span className="text-red-700">Poli</span>Ventas
                    </h1>
                    <nav className="flex items-center gap-6">
                        <ul className="flex gap-6">
                            <li><Link to="/" className="text-blue-900 hover:text-red-600 font-semibold">Inicio</Link></li>
                            <li><Link to="/about" className="text-blue-900 hover:text-red-700 font-semibold">Nosotros</Link></li>
                            <li><Link to="/products" className="text-blue-900 hover:text-red-700 font-semibold">Productos</Link></li>
                            <li><Link to="/contact" className="text-blue-900 hover:text-red-700 font-semibold">Contacto</Link></li>
                        </ul>
                        {/* Botón de Login */}
                        <Link to="/login" className="bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-red-700">
                            Iniciar Sesión
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="bg-blue-50 py-10">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-extrabold text-blue-900 mb-4">
                        Bienvenido a <span className="text-red-700">PoliVentas</span>
                    </h2>
                    <p className="text-lg text-gray-700 mb-6">
                    Poliventas es una plataforma creada por y para estudiantes. Aquí puedes publicar, descubrir y comprar productos de otros compañeros de tu universidad de forma fácil, segura y rápida. ¡Conecta, apoya y emprende dentro de tu comunidad estudiantil!
                    </p>
                </div>
                <div className="mt-10 flex justify-center">
                </div>
            </main>

            {/* Categorías */}
            <section className="bg-white py-10">
                <div className="container mx-auto px-4">
                    <h3 className="text-3xl font-bold text-blue-900 text-center mb-6">Explora nuestras categorías</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* Categoría: Ropa */}
                        <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
                            <img src={ropa2} alt="Ropa" className="w-full h-109 object-cover rounded-md mb-4" />
                            <h4 className="text-xl font-semibold text-blue-900">Ropa</h4>
                            <p className="text-gray-700 mt-2">Encuentra ropa cómoda y moderna para estudiantes.</p>
                            <Link to="/products/ropa" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                                Ver Más
                            </Link>
                        </div>
                        {/* Categoría: Libros/Cursos */}
                        <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
                            <img src={libro} alt="Libros y Cursos" className="w-full h object-cover rounded-md mb-4" />
                            <h4 className="text-xl font-semibold text-blue-900">Libros y Cursos</h4>
                            <p className="text-gray-700 mt-2">Accede a libros y cursos para mejorar tus estudios.</p>
                            <Link to="/products/libros" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                                Ver Más
                            </Link>
                        </div>
                        {/* Categoría: Comida */}
                        <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
                            <img src={comida} alt="Comida" className="w-full h object-cover rounded-md mb-4" />
                            <h4 className="text-xl font-semibold text-blue-900">Comida</h4>
                            <p className="text-gray-700 mt-2">Descubre snacks y alimentos ideales para estudiantes.</p>
                            <Link to="/products/comida" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                                Ver Más
                            </Link>
                        </div>
                        {/* Categoría: Ropa */}
                        <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
                            <img src={ropa2} alt="Ropa" className="w-full h-109 object-cover rounded-md mb-4" />
                            <h4 className="text-xl font-semibold text-blue-900">Ropa</h4>
                            <p className="text-gray-700 mt-2">Encuentra ropa cómoda y moderna para estudiantes.</p>
                            <Link to="/products/ropa" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                                Ver Más
                            </Link>
                        </div>
                        {/* Categoría: Ropa */}
                        <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
                            <img src={ropa2} alt="Ropa" className="w-full h-109 object-cover rounded-md mb-4" />
                            <h4 className="text-xl font-semibold text-blue-900">Ropa</h4>
                            <p className="text-gray-700 mt-2">Encuentra ropa cómoda y moderna para estudiantes.</p>
                            <Link to="/products/ropa" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                                Ver Más
                            </Link>
                        </div>
                        {/* Categoría: Ropa */}
                        <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
                            <img src={ropa2} alt="Ropa" className="w-full h-109 object-cover rounded-md mb-4" />
                            <h4 className="text-xl font-semibold text-blue-900">Ropa</h4>
                            <p className="text-gray-700 mt-2">Encuentra ropa cómoda y moderna para estudiantes.</p>
                            <Link to="/products/ropa" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                                Ver Más
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white py-6 mt-10">
                <div className="container mx-auto text-center">
                    <p className="text-gray-700 font-semibold">
                        © 2025 PoliVentas - Todos los derechos reservados.
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                        <a href="#" className="text-blue-900 hover:text-red-700">Facebook</a>
                        <a href="#" className="text-blue-900 hover:text-red-700">Instagram</a>
                        <a href="#" className="text-blue-900 hover:text-red-700">Twitter</a>
                    </div>
                </div>
            </footer>
        </>
    );
};