import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
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
                    console.log('🔍 Cargando favoritos con token...');
                    // Usuario autenticado → traer desde backend
                    const data = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/favoritos`, {
                        method: 'GET',
                        config: { headers: { Authorization: `Bearer ${token}` } }
                    });
                    console.log('📦 Favoritos cargados inicialmente:', data);
                    setFavoritos(data.favoritos || []);
                    setFavoritosIds(new Set(data.favoritos.map(f => f._id)));
                } else {
                    console.log('🔍 Cargando favoritos desde localStorage...');
                    // Usuario sin sesión → traer desde localStorage
                    const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
                    console.log('📦 Favoritos desde localStorage:', localFavs);
                    setFavoritosIds(new Set(localFavs));
                }
            } catch (err) {
                console.error('❌ Error al cargar favoritos:', err);
            } finally {
                setLoading(false);
            }
        };
        
        cargarFavoritos();
    }, [token]); // Solo depende de token

    // Verificar si un producto está en favoritos
    const esFavorito = useCallback((productoId) => {
        return favoritosIds.has(productoId);
    }, [favoritosIds]);

    // Toggle favorito (agregar o quitar)
    const toggleFavorito = async (productoId) => {
        if (token) {
            // Usuario autenticado
            try {
                console.log('🔄 Toggling favorito:', productoId);
                
                const response = await fetchDataBackend(
                    `${import.meta.env.VITE_BACKEND_URL}/estudiante/favorito/${productoId}`,
                    {
                        method: 'PATCH',
                        config: { headers: { Authorization: `Bearer ${token}` } }
                    }
                );
                
                console.log('✅ Response toggle:', response);
                
                // Recargar favoritos completos desde el backend
                const data = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/favoritos`, {
                    method: 'GET',
                    config: { headers: { Authorization: `Bearer ${token}` } }
                });
                
                console.log('📦 Favoritos recargados:', data);
                
                setFavoritos(data.favoritos || []);
                setFavoritosIds(new Set((data.favoritos || []).map(f => f._id)));
                
                toast.success(response.msg || 'Favorito actualizado');
                return response;
            } catch (err) {
                console.error('❌ Error en toggleFavorito:', err);
                toast.error('Error al actualizar favorito');
                throw err;
            }
        } else {
            // Usuario sin sesión → guardar en localStorage
            let localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
            const index = localFavs.indexOf(productoId);
            
            if (index === -1) {
                localFavs.push(productoId);
                toast.success('Producto agregado a favoritos');
            } else {
                localFavs.splice(index, 1);
                toast.success('Producto removido de favoritos');
            }
            
            localStorage.setItem('favorites', JSON.stringify(localFavs));
            setFavoritosIds(new Set(localFavs));
        }
    };

    // Eliminar un favorito específico
    const eliminarFavorito = async (productoId) => {
        if (token) {
            try {
                await fetchDataBackend(
                    `${import.meta.env.VITE_BACKEND_URL}/estudiante/favorito/${productoId}`,
                    {
                        method: 'DELETE',
                        config: { headers: { Authorization: `Bearer ${token}` } }
                    }
                );
                
                setFavoritos(favoritos.filter(fav => fav._id !== productoId));
                setFavoritosIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productoId);
                    return newSet;
                });
                toast.success('Producto eliminado de favoritos');
            } catch (err) {
                toast.error('Error al eliminar favorito');
                throw err;
            }
        } else {
            let localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
            localFavs = localFavs.filter(id => id !== productoId);
            localStorage.setItem('favorites', JSON.stringify(localFavs));
            setFavoritosIds(new Set(localFavs));
            toast.success('Producto removido de favoritos');
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
                        config: { headers: { Authorization: `Bearer ${token}` } }
                    }
                );
                setFavoritos([]);
                setFavoritosIds(new Set());
                toast.success('Todos los favoritos han sido eliminados');
            } catch (err) {
                toast.error('Error al vaciar favoritos');
                throw err;
            }
        } else {
            localStorage.removeItem('favorites');
            setFavoritos([]);
            setFavoritosIds(new Set());
            toast.success('Favoritos vaciados');
        }
    };

    // Recargar favoritos manualmente cuando sea necesario
    const recargarFavoritos = async () => {
        try {
            if (token) {
                const data = await fetchDataBackend(`${import.meta.env.VITE_BACKEND_URL}/estudiante/favoritos`, {
                    method: 'GET',
                    config: { headers: { Authorization: `Bearer ${token}` } }
                });
                setFavoritos(data.favoritos || []);
                setFavoritosIds(new Set(data.favoritos.map(f => f._id)));
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
        recargarFavoritos
    };
};

export default useFavoritos;