import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter, FaCopyright } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-blue-950 text-white relative overflow-hidden">
            {/* Fondo decorativo S */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-72 h-72 rounded-full mix-blend-multiply blur-3xl animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72  rounded-full mix-blend-multiply blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72  rounded-full mix-blend-multiply blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Contenido Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-12">
                    {/* Logo + Acerca de */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center mb-6">
                            <h2 className="text-2xl text-white  font-bold bg-gradient-to-r ">
                                PoliVentas
                            </h2>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            Plataforma universitaria para comprar y vender productos
                            creados por estudiantes. ¡Apoya tu comunidad!
                        </p>
                        {/* Redes Sociales */}
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com/profile.php?id=61582749197042" target="_blank" rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 hover:bg-red-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <FaFacebook className="text-white" />
                            </a>
                            <a href="https://www.instagram.com/poliventas.uni/" target="_blank" rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 hover:bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <FaInstagram className="text-white" />
                            </a>
                        </div>
                    </div>

                    {/* Enlaces Rápidos */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 flex items-center">
                            <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                            Enlaces Rápidos
                        </h4>
                        <ul className="space-y-3">
                            {[

                                { to: "/login", label: "  Mi Cuenta" },
                                { to: "/carrito/vacio", label: "  Carrito" }
                            ].map((item) => (
                                <li key={item.to}>
                                    <Link to={item.to} className="flex items-center text-gray-300 hover:text-white transition-all duration-300 group">
                                        <span className="mr-3 group-hover:translate-x-1 transition-transform">{item.label.split(' ')[0]}</span>
                                        <span className="text-sm">{item.label.slice(2)}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contáctanos */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 flex items-center">
                            <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                            Contáctanos
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-center text-gray-300 hover:text-white transition-all duration-300">
                                <FaPhone className="mr-3 text-red-400 w-5 h-5" />
                                <a href="tel:+593984409644" className="hover:underline">+593 98 440 9644</a>
                            </li>
                            <li className="flex items-center text-gray-300 hover:text-white transition-all duration-300">
                                <FaEnvelope className="mr-3 text-red-400 w-5 h-5" />
                                <a href="mailto:poli.ventas.u@gmail.com" className="hover:underline">poli.ventas.u@gmail.com</a>
                            </li>
                            <li className="flex items-center text-gray-300">
                                <FaMapMarkerAlt className="mr-3 text-red-400 w-5 h-5" />
                                <span>EPN, Quito, Ecuador</span>
                            </li>
                        </ul>
                    </div>

                    {/* MAPA GOOGLE MAPS */}
                    <div className="p-6 border-t border-white/10 pt-6 lg:border-t-0 lg:pt-0">
                        <h4 className="text-lg font-semibold mb-4 flex items-center text-center sm:text-left">
                            <FaMapMarkerAlt className="mr-2 text-red-400" />
                            Encuentranos en EPN
                        </h4>
                        <div className="rounded-xl overflow-hidden shadow-2xl">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.791448451573!2d-78.4919169890584!3d-0.2102860353965694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59a107e1cd44b%3A0x88a284f66939ed4!2sESCUELA%20POLIT%C3%89CNICA%20NACIONAL!5e0!3m2!1ses!2sec!4v1760584126135!5m2!1ses!2sec"
                                width="100%"
                                height="250"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="EPN - Escuela Politécnica Nacional"
                                className="w-full h-64 rounded-xl"
                            />
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/10 pt-6 text-center mb-3">
                    <div className="flex flex-col sm:flex-row justify-center items-center text-gray-300">
                        <p className="flex items-center text-center">
                            <FaCopyright className="mr-2" />
                            {new Date().getFullYear()} PoliVentas. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;