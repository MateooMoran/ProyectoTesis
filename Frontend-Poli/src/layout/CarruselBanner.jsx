import React, { useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// BANNERS PRINCIPALES 
import banner1 from '../assets/banner1.jpg';
import banner2 from '../assets/banner2.jpg';
import banner3 from '../assets/banner3.png';
import banner4 from '../assets/banner4.png';

const bannerImages = [
    { id: 1, src: banner1, alt: 'Material de Estudio' },
    { id: 2, src: banner2, alt: 'Nuevos Productos' },
    { id: 3, src: banner3, alt: 'Grandes Descuentos' },
    { id: 4, src: banner4, alt: 'Compra Segura' },
];

// ASOCIACIONES UNIVERSITARIAS 
import assoc1 from '../assets/esfot.png';
import assoc2 from '../assets/ciencias.png';
import assoc3 from '../assets/adepon.png';
import assoc4 from '../assets/aefca.jpg';
import assoc5 from '../assets/mecanica.jpg';
import assoc6 from '../assets/quimica.jpeg';

const asociaciones = [
    { id: 1, src: assoc1, alt: 'ESFOT' },
    { id: 2, src: assoc2, alt: 'FACULTAD DE CIENCIAS' },
    { id: 3, src: assoc3, alt: 'ADEPON' },
    { id: 4, src: assoc4, alt: 'CIENCIAS ADMINISTRATIVAS' },
    { id: 5, src: assoc5, alt: 'INGENIERIA MECANICA' },
    { id: 6, src: assoc6, alt: 'INGENIERIA QUIMICA' },
];

const Carrusel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Flechas
    const PrevArrow = ({ onClick }) => (
        <button
            onClick={onClick}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300 text-gray-800 font-bold text-xl"
        >
            ‹
        </button>
    );

    const NextArrow = ({ onClick }) => (
        <button
            onClick={onClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300 text-gray-800 font-bold text-xl"
        >
            ›
        </button>
    );

    const ThumbnailPrevArrow = ({ onClick }) => (
        <button
            onClick={onClick}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md -ml-2 text-gray-600 font-bold text-sm"
        >
            ‹
        </button>
    );

    const ThumbnailNextArrow = ({ onClick }) => (
        <button
            onClick={onClick}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md -mr-2 text-gray-600 font-bold text-sm"
        >
            ›
        </button>
    );

    const bannerSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        beforeChange: (current, next) => setCurrentSlide(next),
        arrows: true,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
    };

    const assocSettings = {
        dots: false,
        infinite: true,
        speed: 1000,
        slidesToShow: 5,
        slidesToScroll: 1,
        centerMode: true,
        focusOnSelect: false,
        centerPadding: '20px',
        arrows: true,
        prevArrow: <ThumbnailPrevArrow />,
        nextArrow: <ThumbnailNextArrow />,
        autoplay: true,
        autoplaySpeed: 1500,
        pauseOnHover: false,
        pauseOnFocus: false,
        swipe: true,
        responsive: [
            { breakpoint: 768, settings: { slidesToShow: 3, centerPadding: '10px' } },
            { breakpoint: 480, settings: { slidesToShow: 2, centerPadding: '5px' } }
        ]
    };

    return (
        <section className="mb-8 mt-4">
            <div className="relative">
                {/* BANNER PRINCIPAL - FULL WIDTH */}
                <div className="mb-10">
                    <Slider {...bannerSettings}>
                        {bannerImages.map((banner) => (
                            <div key={banner.id} className="relative">
                                <img
                                    src={banner.src}
                                    alt={banner.alt}
                                    className="w-full h-150 object-fill"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-6">
                                    <div className="text-white ml-4">
                                        <h3 className="text-3xl font-bold mb-1">{banner.alt}</h3>
                                        <p className="text-xl">¡Descubre más!</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>

                {/* ASOCIACIONES - MOVIMIENTO INDEPENDIENTE */}
                <div className="max-w-full mx-auto px-4 relative">
                    <h3 className="text-2xl font-semibold text-center text-gray-700 mb-1">Asociaciones Universitarias</h3>
                    <Slider {...assocSettings}>
                        {asociaciones.map((assoc) => (
                            <div key={assoc.id} className="px-2">
                                <div className="bg-white rounded-lg shadow-md p-3 cursor-pointer hover:shadow-lg transition-all duration-300">
                                    <img
                                        src={assoc.src}
                                        alt={assoc.alt}
                                        className="w-full h-24 object-contain rounded"
                                    />
                                    <p className="text-center text-sm font-semibold text-gray-800 mt-2">{assoc.alt}</p>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
};

export default Carrusel;