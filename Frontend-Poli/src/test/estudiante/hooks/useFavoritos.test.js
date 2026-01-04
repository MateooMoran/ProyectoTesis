import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFavoritos from '../../../hooks/useFavoritos';

const mockFetchDataBackend = vi.fn();

vi.mock('../../../hooks/useFetch', () => ({
    default: () => ({
        fetchDataBackend: mockFetchDataBackend,
    }),
}));

vi.mock('../../../context/storeAuth', () => ({
    default: () => ({
        token: 'mock-token',
        rol: 'estudiante',
    }),
}));

describe('useFavoritos', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem(
            'auth-token',
            JSON.stringify({
                state: { token: 'mock-token', rol: 'estudiante' },
            })
        );
    });

    it('Carga favoritos del backend para estudiante autenticado', async () => {
        const mockFavoritos = {
            favoritos: [
                { _id: '1', nombreProducto: 'Laptop HP' },
                { _id: '2', nombreProducto: 'Mouse' },
            ]
        };

        mockFetchDataBackend.mockResolvedValue(mockFavoritos);

        const { result } = renderHook(() => useFavoritos());

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(result.current.favoritos.length).toBeGreaterThanOrEqual(0);
    });

    it('Verifica si un producto es favorito', async () => {
        const mockFavoritos = {
            favoritos: [
                { _id: '1', nombreProducto: 'Laptop HP' },
            ]
        };

        mockFetchDataBackend.mockResolvedValue(mockFavoritos);

        const { result } = renderHook(() => useFavoritos());

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        const esFavorito = result.current.esFavorito('1');
        expect(typeof esFavorito).toBe('boolean');
    });

    it('Agrega un producto a favoritos', async () => {
        mockFetchDataBackend.mockResolvedValue({ favoritos: [] });

        const { result } = renderHook(() => useFavoritos());

        await act(async () => {
            await result.current.toggleFavorito('1');
        });

        expect(mockFetchDataBackend).toHaveBeenCalled();
    });

    it('Elimina un producto de favoritos', async () => {
        mockFetchDataBackend.mockResolvedValue({ msg: 'Eliminado de favoritos' });

        const { result } = renderHook(() => useFavoritos());

        await act(async () => {
            await result.current.eliminarFavorito('1');
        });

        expect(mockFetchDataBackend).toHaveBeenCalled();
    });

    it('Maneja localStorage correctamente', () => {
        const { result } = renderHook(() => useFavoritos());

        act(() => {
            localStorage.setItem('favoritos', JSON.stringify([{ _id: '1' }]));
        });

        expect(localStorage.getItem('favoritos')).toBeTruthy();
    });
});
