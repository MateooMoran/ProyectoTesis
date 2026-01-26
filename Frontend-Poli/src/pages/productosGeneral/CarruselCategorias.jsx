import React from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import HogarImg from "../../assets/hogar.webp";
import MascotasImg from "../../assets/mscotas.webp";
import JuguetesImg from "../../assets/juguetes.webp";
import TecnologiaImg from "../../assets/tecno.webp";
import ComidaImg from "../../assets/comidaaa.webp";
import RopaImg from "../../assets/Ropa2.webp";
import MaterialesImg from "../../assets/materiales.webp";
import LibrosImg from "../../assets/Libros.webp";
import AutomotrizImg from "../../assets/automotriz.webp";
import ZapatosImg from "../../assets/zapatoss.webp";
import OtrosImg from "../../assets/otros.webp";
import storeAuth from "../../context/storeAuth";

const categoryImages = {
    Hogar: HogarImg,
    Mascotas: MascotasImg,
    Juguetes: JuguetesImg,
    Tecnología: TecnologiaImg,
    Comida: ComidaImg,
    Ropa: RopaImg,
    Materiales: MaterialesImg,
    Libros: LibrosImg,
    Automotriz: AutomotrizImg,
    Zapatos: ZapatosImg,
    Otros: OtrosImg
};

const CategoriesCarousel = ({
    categorias = [],
    loadingCategorias,
    errorCategorias,
    title = "Explora por Categorías",
    className = "my-12",
}) => {
    const { token } = storeAuth();

    const getCategoryLink = (id) => {
        return token ? `/dashboard/productos/categoria/${id}` : `/productos/categoria/${id}`;
    };

    const settings = {
        dots: false,
        infinite: true,
        speed: 700,
        slidesToShow: 6,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: false,
        responsive: [
            { breakpoint: 1280, settings: { slidesToShow: 4 } },
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <section className={className}>
            <h3 className="text-2xl font-semibold text-gray-600 text-center mb-6">
                {title}
            </h3>

            {loadingCategorias && (
                <p className="text-center text-gray-700">Cargando categorías...</p>
            )}
            {errorCategorias && (
                <p className="text-center text-red-700">{errorCategorias}</p>
            )}
            {!loadingCategorias && !errorCategorias && categorias.length === 0 && (
                <p className="text-center text-gray-700">No hay categorías disponibles.</p>
            )}

            {!loadingCategorias && !errorCategorias && categorias.length > 0 && (
                <Slider {...settings} className="mx-[-10px]">
                    {categorias.map((categoria) => (
                        <div key={categoria._id} className="px-2">
                            <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                                {/* Título */}
                                <div className="bg-red-900 text-white text-center text-xl font-semibold py-3">
                                    {categoria.nombreCategoria}
                                </div>

                                {/* Imagen */}
                                <img
                                    src={categoria.Imagen || categoryImages[categoria.nombreCategoria] || RopaImg}
                                    alt={categoria.nombreCategoria}
                                    className="w-full h-52 sm:h-60 md:h-[300px] object-cover"
                                />

                                {/* Botón “Ver más” ancho completo */}
                                <Link
                                    to={getCategoryLink(categoria._id)}
                                    className="block bg-blue-900 text-white font-semibold py-3 text-center hover:bg-blue-800 transition-colors w-full hover:scale-115 duration-300 mt-auto"
                                >
                                    Ver más
                                </Link>
                            </div>
                        </div>
                    ))}
                </Slider>
            )}
        </section>
    );
};

export default CategoriesCarousel;
