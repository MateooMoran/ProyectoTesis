import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-blue-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                    {/* Sección Contáctanos */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contáctanos</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <FaPhone className="mr-2 text-red-400" />
                                <a href="tel:+1234567890" className="hover:text-red-400 transition-colors">
                                    +593 98 440 9644
                                </a>
                            </li>
                            <li className="flex items-center">
                                <FaEnvelope className="mr-2 text-red-400" />
                                <a href="mailto:contacto@poliventas.com" className="hover:text-red-400 transition-colors">
                                    poli.ventas.u@gmail.com
                                </a>
                            </li>
                            <li className="flex items-center">
                                <FaMapMarkerAlt className="mr-2 text-red-400" />
                                <span>Escuela Politecnica Nacional, Quito, Ecuador</span>
                            </li>
                        </ul>
                    </div>

                    {/* Sección Acerca de */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Acerca de PoliVentas</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/contacto" className="hover:text-red-400 transition-colors">
                                    Contacto
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="hover:text-red-400 transition-colors">
                                    Mi Cuenta
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Sección Redes Sociales */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
                        <div className="flex gap-6">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-red-400 transition-colors"
                            >
                                <FaFacebook className="mr-2 text-red-400" /> Facebook
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-red-400 transition-colors"
                            >
                                <FaInstagram className="mr-2 text-red-400" /> Instagram
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-red-400 transition-colors"
                            >
                                <FaTwitter className="mr-2 text-red-400" /> Twitter
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 text-center text-gray-300">
                    <p className="underline">
                        © {new Date().getFullYear()} PoliVentas - Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;