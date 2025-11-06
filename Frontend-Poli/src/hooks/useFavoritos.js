import { useState, useEffect, useCallback } from 'react';
import storeAuth from '../context/storeAuth';
import useFetch from './useFetch';

const useFavoritos = () => {
    const [favoritos, setFavoritos] = useState([]);
    const [favoritosIds, setFavoritosIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const { token } = storeAuth();
    const { fetchDataBackend } = useFetch();

    // Cargar favoritos al inicio
    useEffect(() => {
        const cargarFavoritos = async () => {
            setLoading(true);
            try {
                if (token) {
                    const data = await fetchDataBackend(
                        `${import.meta.env.VITE_BACKEND_URL}/estudiante/favoritos`,
                        {
                            method: 'GET',
                            config: { headers: { Authorization: `Bearer ${token}` } },
                        }
                    );
                    setFavoritos(data.favoritos || []);
                    setFavoritosIds(new Set((data.favoritos || []).map(f => f._id)));
                } else {
                    const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
                    setFavoritosIds(new Set(localFavs));
                }
            } catch (err) {
                console.error('Error al cargar favoritos:', err);
            } finally {
                setLoading(false);
            }
        };

        cargarFavoritos();
    }, [token]);

    // Verificar si un producto está en favoritos
    const esFavorito = useCallback(
        productoId => favoritosIds.has(productoId),
        [favoritosIds]
    );

    // Agregar o quitar favorito
    const toggleFavorito = async productoId => {
        if (token) {
            try {
                await fetchDataBackend(
                    `${import.meta.env.VITE_BACKEND_URL}/estudiante/favorito/${productoId}`,
                    {
                        method: 'PATCH',
                        config: { headers: { Authorization: `Bearer ${token}` } },
                    }
                );

                const data = await fetchDataBackend(
                    `${import.meta.env.VITE_BACKEND_URL}/estudiante/favoritos`,
                    {
                        method: 'GET',
                        config: { headers: { Authorization: `Bearer ${token}` } },
                    }
                );

                setFavoritos(data.favoritos || []);
                setFavoritosIds(new Set((data.favoritos || []).map(f => f._id)));
            } catch (err) {
                console.error('Error al actualizar favorito:', err);
            }
        } else {
            let localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
            const index = localFavs.indexOf(productoId);

            if (index === -1) localFavs.push(productoId);
            else localFavs.splice(index, 1);

            localStorage.setItem('favorites', JSON.stringify(localFavs));
            setFavoritosIds(new Set(localFavs));
        }
    };

    // Eliminar un favorito específico
    const eliminarFavorito = async productoId => {
        if (token) {
            try {
                await fetchDataBackend(
                    `${import.meta.env.VITE_BACKEND_URL}/estudiante/favorito/${productoId}`,
                    {
                        method: 'DELETE',
                        config: { headers: { Authorization: `Bearer ${token}` } },
                    }
                );

                setFavoritos(favoritos.filter(fav => fav._id !== productoId));
                setFavoritosIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productoId);
                    return newSet;
                });
            } catch (err) {
                console.error('Error al eliminar favorito:', err);
            }
        } else {
            let localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
            localFavs = localFavs.filter(id => id !== productoId);
            localStorage.setItem('favorites', JSON.stringify(localFavs));
            setFavoritosIds(new Set(localFavs));
        }
    };

    // Vaciar todos los favoritos
    const vaciarFavoritos = async () => {
        if (token) {
            try {
                await fetchDataBackend(
                    `${import.meta.env.VITE_BACKEND_URL}/estudiante/favoritas/id`,
                    {
                        method: 'DELETE',
                        config: { headers: { Authorization: `Bearer ${token}` } },
                    }
                );
                setFavoritos([]);
                setFavoritosIds(new Set());
            } catch (err) {
                console.error('Error al vaciar favoritos:', err);
            }
        } else {
            localStorage.removeItem('favorites');
            setFavoritos([]);
            setFavoritosIds(new Set());
        }
    };

    // Recargar favoritos manualmente
    const recargarFavoritos = async () => {
        try {
            if (token) {
                const data = await fetchDataBackend(
                    `${import.meta.env.VITE_BACKEND_URL}/estudiante/favoritos`,
                    {
                        method: 'GET',
                        config: { headers: { Authorization: `Bearer ${token}` } },
                    }
                );
                setFavoritos(data.favoritos || []);
                setFavoritosIds(new Set((data.favoritos || []).map(f => f._id)));
            } else {
                const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
                setFavoritosIds(new Set(localFavs));
            }
        } catch (err) {
            console.error('Error al recargar favoritos:', err);
        }
    };

    return {
        favoritos,
        favoritosIds,
        loading,
        esFavorito,
        toggleFavorito,
        eliminarFavorito,
        vaciarFavoritos,
        recargarFavoritos,
    };
};

export default useFavoritos;
