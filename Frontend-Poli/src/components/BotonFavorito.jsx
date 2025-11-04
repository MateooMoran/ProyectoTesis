import React, { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useFavoritos from '../hooks/useFavoritos';

/**
 * Componente reutilizable de botón de favoritos
 * @param {string} productoId - ID del producto
 * @param {string} size - Tamaño del icono ('sm', 'md', 'lg')
 * @param {string} variant - Estilo del botón ('icon', 'button', 'floating')
 * @param {string} className - Clases adicionales
 */
const BotonFavorito = ({ 
    productoId, 
    size = 'md', 
    variant = 'icon',
    className = '' 
}) => {
    const { esFavorito, toggleFavorito } = useFavoritos();
    const [isAnimating, setIsAnimating] = useState(false);
    const isFav = esFavorito(productoId);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🖱️ Click en botón favorito, productoId:', productoId);
        
        setIsAnimating(true);
        try {
            await toggleFavorito(productoId);
            console.log('✅ Toggle completado');
        } catch (error) {
            console.error('❌ Error al toggle favorito:', error);
        }
        setTimeout(() => setIsAnimating(false), 300);
    };

    // Tamaños de iconos
    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    // Variantes de botón
    const variants = {
        icon: `p-2 rounded-full transition-all duration-200 ${
            isFav 
                ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`,
        button: `px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            isFav 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`,
        floating: `absolute top-2 right-2 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 ${
            isFav 
                ? 'bg-red-500/90 hover:bg-red-600/90 text-white' 
                : 'bg-white/90 hover:bg-gray-100/90 text-gray-600'
        }`
    };

    const iconClass = iconSizes[size];
    const buttonClass = `${variants[variant]} ${className} ${isAnimating ? 'scale-110' : ''}`;

    return (
        <button
            onClick={handleClick}
            className={buttonClass}
            title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
            {isFav ? (
                <FaHeart className={`${iconClass} ${isAnimating ? 'animate-ping' : ''}`} />
            ) : (
                <FaRegHeart className={iconClass} />
            )}
            {variant === 'button' && (
                <span>{isFav ? 'En favoritos' : 'Agregar a favoritos'}</span>
            )}
        </button>
    );
};

export default BotonFavorito;