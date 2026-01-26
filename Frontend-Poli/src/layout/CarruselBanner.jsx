import React, { useState } from 'react';
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// BANNERS PRINCIPALES 
import banner1 from '../assets/banner3d.png';
import banner2 from '../assets/banner2.png';
import banner3 from '../assets/banner3.png';
import banner4 from '../assets/bannerIA.png';
import banner5 from '../assets/banner5.png';


const bannerImages = [
    { id: 1, src: banner1, alt: 'Mira los productos en 3D' },
    { id: 2, src: banner2, alt: 'Proximamente...' },
    { id: 3, src: banner3, alt: 'Grandes Descuentos' },
    { id: 4, src: banner4, alt: 'Nueva implementación de la IA' },
    { id: 5, src: banner5, alt: 'Conecta con la comunidad' },

];

// ASOCIACIONES UNIVERSITARIAS 
import assoc1 from '../assets/esfot.webp';
import assoc2 from '../assets/ciencias.webp';
import assoc3 from '../assets/adepon.webp';
import assoc4 from '../assets/aefca.webp';
import assoc5 from '../assets/mecanica.webp';
import assoc6 from '../assets/quimica.webp';

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
                            <div key={banner.id} className="relative w-full h-56 sm:h-64 md:h-80 lg:h-[480px] xl:h-[640px]">
                                <img
                                    src={banner.src}
                                    alt={banner.alt}
                                    className="absolute inset-0 w-full h-full object-cover object-center"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-6">
                                    <div className="text-white ml-4">
                                        <h3 className="text-2xl sm:text-3xl font-bold mb-1">{banner.alt}</h3>
                                        <p className="text-lg sm:text-xl">¡Descubre más!</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>

                {/* ASOCIACIONES - MOVIMIENTO INDEPENDIENTE */}
                <div className="max-w-full mx-auto px-4 relative">
                    <h3 className="text-2xl font-semibold text-center text-gray-700 mb-10">Somos Recomendados Por</h3>
                    <Slider {...assocSettings}>
                        {asociaciones.map((assoc) => (
                            <div key={assoc.id} className="px-2">
                                <div className="bg-white rounded-lg p-3 cursor-pointer hover:scale-115 transition-all duration-300">
                                    <img
                                        src={assoc.src}
                                        alt={assoc.alt}
                                        className="w-full h-20 sm:h-24 md:h-28 lg:h-32 object-contain rounded"
                                    />
                                    <p className="text-center text-sm font-semibold text-gray-800 mt-2 mb-6">{assoc.alt}</p>
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