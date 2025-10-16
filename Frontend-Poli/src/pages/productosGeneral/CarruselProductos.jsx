import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductCarousel = ({
    productos,
    loading,
    error,
    title = "Productos",
    slidesPerView = 4,
    showDots = false,
    className = "mb-5 mt-12",
}) => {
    return (
        <section className={className}>
            <h3 className="text-2xl font-semibold text-gray-700 text-center mb-6">{title}</h3>

            {loading && <p className="text-center text-gray-700">Cargando productos...</p>}
            {error && <p className="text-center text-red-700">{error}</p>}
            {!loading && !error && productos.length === 0 && (
                <p className="text-center text-gray-700">No hay productos disponibles.</p>
            )}
            {!loading && !error && productos.length > 0 && (
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation
                    pagination={{ clickable: showDots }}
                    showDots={false}
                    spaceBetween={20}
                    slidesPerView={slidesPerView}
                    autoplay={{ delay: 2000, disableOnInteraction: false }}
                    breakpoints={{
                        320: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: slidesPerView },
                    }}
                >
                    {productos.map((producto) => (
                        <SwiperSlide key={producto._id}>
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4">
                                {/* ✅ IMAGEN + STOCK ARRIBA DERECHA */}
                                <div className="relative mb-3">
                                    <Link to={`/productos/${producto._id}`} className="block">
                                        <img
                                            src={producto.imagen}
                                            alt={producto.nombreProducto}
                                            className="w-full h-48 object-contain rounded-md hover:shadow-md transition-shadow duration-300"
                                        />
                                    </Link>

                                    {/* Alerta stock bajo */}
                                    {producto.stock <= 5 && (
                                        <span className="absolute top-2 left-2 bg-red-800 text-white text-xs font-semibold px-2 py-1 rounded">
                                            ¡Solo {producto.stock} Disponibles!
                                        </span>
                                    )}
                                </div>

                                {/* Nombre (link) */}
                                <Link
                                    to={`productos/${producto._id}`}
                                    className="block mb-3 hover:text-blue-600 transition-colors"
                                >
                                    <h3 className="text-base font-light text-gray-800 line-clamp-1 text-center">
                                        {producto.nombreProducto}
                                    </h3>
                                </Link>

                                {/* ✅ PRECIO */}
                                <div className="mb-3">
                                    <p className="text-1xl font-extrabold text-gray-600">${producto.precio.toFixed(2)}</p>
                                    {producto.descuento && (
                                        <p className="text-sm text-gray-500 line-through">${(producto.precio * 1.2).toFixed(2)}</p>
                                    )}
                                </div>

                                {/* 🔥 BOTONES */}
                                <div className="flex gap-2 mb-3">
                                    {/* Botón CARRITO 🛒 CON HANDLE */}
                                    <Link
                                        to="/carrito/vacio"
                                        className="flex-1 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1 hover:scale-105 transition-transform-colors duration-400"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 3.5A2 2 0 006.5 17h11a2 2 0 001.6-1.5l-1.5-3.5" />
                                        </svg>
                                        Añadir al Carrito
                                    </Link>

                                    {/* Botón LISTA DESEOS ❤️ */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            console.log(`❤️ Añadir ${producto.nombreProducto} a deseos`);
                                        }}
                                        className="p-2 bg-gray-200 hover:bg-red-500 hover:text-white text-gray-700 rounded-md transition-all  hover:scale-110 transition-transform-colors duration-500"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </section>
    );
};

export default ProductCarousel;