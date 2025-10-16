import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// FLECHAS PERSONALIZADAS
const SamplePrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} ${style} custom-arrow custom-prev-arrow`}
            onClick={onClick}
        />
    );
};

const SampleNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} ${style} custom-arrow custom-next-arrow`}
            onClick={onClick}
        />
    );
};

// COMPONENTE CARRUSEL CATEGORÍAS
const CategoriesCarousel = ({ categorias, productos, loadingCategorias, errorCategorias }) => {
    // Configuración react-slick
    const settings = {
        dots: false,
        infinite: true,
        speed: 700,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        pauseOnHover: true,
        prevArrow: <SamplePrevArrow />,
        nextArrow: <SampleNextArrow />,
        responsive: [
            {
                breakpoint: 1536, // 2xl
                settings: { slidesToShow: 5 }
            },
            {
                breakpoint: 1280, // xl
                settings: { slidesToShow: 4 }
            },
            {
                breakpoint: 1024, // lg
                settings: { slidesToShow: 3 }
            },
            {
                breakpoint: 768, // md
                settings: { slidesToShow: 2 }
            },
            {
                breakpoint: 640, // sm
                settings: { slidesToShow: 1 }
            }
        ]
    };

    return (
        <section className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-700 text-center mb-8">Explora por Categorías</h3>

            {loadingCategorias && <p className="text-center text-gray-700">Cargando categorías...</p>}
            {errorCategorias && <p className="text-center text-red-700">{errorCategorias}</p>}
            {!loadingCategorias && !errorCategorias && categorias.length === 0 && (
                <p className="text-center text-gray-700">No hay categorías disponibles.</p>
            )}

            {!loadingCategorias && !errorCategorias && categorias.length > 0 && (
                <div className="relative mx-[-10px]">
                    <Slider {...settings}>
                        {/* Categorías */}
                        {categorias.map((categoria) => (
                            <div key={categoria._id} className="px-2">
                                <Link
                                    to={`/productos/categoria/${categoria._id}`}
                                    className="group bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-6 text-center hover:from-blue-100 hover:to-indigo-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block h-full"
                                >
                                    {/* Ícono de Categoría */}
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-2xl text-white font-bold">
                                            {categoria.icono || '🛍️'}
                                        </span>
                                    </div>

                                    {/* Nombre Categoría */}
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                                        {categoria.nombreCategoria}
                                    </h3>

                                    {/* Cantidad de Productos */}
                                    <p className="text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full inline-block">
                                        {productos.filter(p => p.categoria?._id === categoria._id).length} productos
                                    </p>

                                    {/* Flecha Animada */}
                                    <div className="mt-3 text-blue-600 group-hover:translate-x-1 transition-transform">
                                        →
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </Slider>
                </div>
            )}
        </section>
    );
};

export default CategoriesCarousel;