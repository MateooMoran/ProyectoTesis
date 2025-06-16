import React from 'react';
import { Link } from 'react-router-dom';
import comida from '../assets/comidas-rapidas.jpg';
import ropa from '../assets/Ropa.jpeg';
import pantalon from '../assets/pantalon.avif';
import Zapatos from '../assets/zapatos.jpg';
import Chaqueta from '../assets/chaqueta.jpg';
import libro from '../assets/Libros.jpeg';
import logo from '../assets/logo.png';

{/* Carrusel */}
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

// Definir productos más vendidos
const productosMasVendidos = [
    { id: 1, nombre: 'Chompa', precio: '$10', imagen: Chaqueta },
    { id: 2, nombre: 'Sanduches', precio: '$2.50', imagen: comida },
    { id: 3, nombre: 'Zapatos Adidas', precio: '$12', imagen: Zapatos },
    { id: 4, nombre: 'Libro de Ingles', precio: '$25', imagen: libro },
    { id: 5, nombre: 'Hoodie', precio: '$15', imagen: ropa },
];

export const Dashboard = ({ userName }) => {
    return (
        <>
            {/* Header */}
            <header className="bg-white shadow-md py-4">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">

                    {/* Logo */}
                    <img src={logo} alt="logo" className="w-39 h-15 object-cover mr-4" />

                    {/* Navegación */}
                    <nav className="mb-4 sm:mb-0">
                        <ul className="flex sm:flex-row items-center gap-3 sm:gap-8 text-blue-900 font-semibold">
                            <li><Link to="/" className="hover:text-red-600">Inicio</Link></li>
                            <li><Link to="/about" className="hover:text-red-700">Nosotros</Link></li>
                            <li><Link to="/products" className="hover:text-red-700 ">Productos</Link></li>
                            <li><Link to="/contact" className="hover:text-red-700 ">Contacto</Link></li>
                        </ul>
                    </nav>

                    {/* Bienvenida al usuario */}
                    <div className="flex items-center gap-5">
                        <p className="text-blue-900 font-semibold">Bienvenido Usuario</p>
                    <Link to="/login" className="bg-blue-900 text-white py-2 px-4 rounded-lg text-center hover:bg-red-700">Cerrar sesión
                        </Link>
                    </div>
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
            </main>

            {/* Categorías */}
                        <section className="bg-white py-10">
                            <div className="container mx-auto px-4">
                                <h3 className="text-3xl font-bold text-blue-900 text-center mb-6">Explora nuestras categorías</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Categoría: Ropa */}
                                    <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                                        <h4 className="text-2xl font-semibold text-blue-900 mb-4">Vistete Con Estilo</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <img src={ropa} alt="Ropa 1" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Camiseta</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={pantalon} alt="Ropa 2" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Pantalón</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={Chaqueta} alt="Ropa 3" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Chaqueta</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={Zapatos} alt="Ropa 4" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Zapatos</p>
                                            </div>
                                        </div>
                                        <Link to="/products/ropa" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                                            Ver Más
                                        </Link>
                                    </div>
            
                                    {/* Categoría: Libros */}
                                    <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                                        <h4 className="text-2xl font-semibold text-blue-900 mb-4">Libros y Cursos</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <img src={libro} alt="Libro 1" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Matemáticas</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={libro} alt="Libro 2" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Historia</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={libro} alt="Libro 3" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Ciencia</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={libro} alt="Libro 4" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Arte</p>
                                            </div>
                                        </div>
                                        <Link to="/products/libros" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                                            Ver Más
                                        </Link>
                                    </div>
            
                                    {/* Categoría: Comida */}
                                    <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                                        <h4 className="text-2xl font-semibold text-blue-900 mb-4">Poli Comida</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 1" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Pizza</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 2" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Hamburguesa</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 3" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Tacos</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 4" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Sushi</p>
                                            </div>
                                        </div>
                                        <Link to="/products/comida" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                                            Ver Más
                                        </Link>
                                    </div>
            
                                    {/* Categoría: Comida */}
                                    <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                                        <h4 className="text-2xl font-semibold text-blue-900 mb-4">Tecnología y accesorios</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 1" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Pizza</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 2" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Hamburguesa</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 3" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Tacos</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 4" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Sushi</p>
                                            </div>
                                        </div>
                                        <Link to="/products/comida" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                                            Ver Más
                                        </Link>
                                    </div>
            
                                    {/* Categoría: Comida */}
                                    <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                                        <h4 className="text-2xl font-semibold text-blue-900 mb-4">Joyeria</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 1" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Pizza</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 2" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Hamburguesa</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 3" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Tacos</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 4" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Sushi</p>
                                            </div>
                                        </div>
                                        <Link to="/products/comida" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                                            Ver Más
                                        </Link>
                                    </div>
            
                                    {/* Categoría: Comida */}
                                    <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                                        <h4 className="text-2xl font-semibold text-blue-900 mb-4">Nuevo En PoliVentas</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 1" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Pizza</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 2" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Hamburguesa</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 3" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Tacos</p>
                                            </div>
                                            <div className="text-center">
                                                <img src={comida} alt="Comida 4" className="w-full h-24 object-cover rounded-md mb-2" />
                                                <p className="text-sm text-gray-700 text-left">Sushi</p>
                                            </div>
                                        </div>
                                        <Link to="/products/comida" className="bg-blue-950 text-white py-2 px-4 rounded-lg mt-4 inline-block hover:bg-red-700">
                                            Ver Más
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
            
            
                       {/* Carrusel de productos más vendidos */}
                        <section className="bg-blue-50 py-10">
                            <div className="container mx-auto px-4">
                                <h3 className="text-3xl font-bold text-blue-900 text-center mb-6">Lo más vendido en PoliVentas</h3>
                                <Swiper
                                    modules={[Navigation, Pagination]}
                                    navigation
                                    pagination={{ clickable: true }}
                                    spaceBetween={20}
                                    slidesPerView={1}
                                    breakpoints={{
                                        640: { slidesPerView: 2 },
                                        1024: { slidesPerView: 3 },
                                    }}
                                >
                                    {productosMasVendidos.map((producto) => (
                                        <SwiperSlide key={producto.id}>
                                            <div className="bg-white p-4 rounded-lg shadow-md text-center">
                                                <img
                                                    src={producto.imagen}
                                                    alt={producto.nombre}
                                                    className="w-full h-50 object-cover rounded-md mb-4"
                                                />
                                                <h4 className="text-lg font-semibold text-blue-900">{producto.nombre}</h4>
                                                <p className="text-gray-700 pb-2 h-10" >{producto.precio}</p>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
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