import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Favoritos from '../../../../pages/productosGeneral/Favoritos';

const mockFavoritos = [
    { _id: '1', nombreProducto: 'Laptop HP', precio: 1200 },
    { _id: '2', nombreProducto: 'Mouse Logitech', precio: 25 },
];

const mockUseFavoritos = {
    favoritos: mockFavoritos,
    favoritosIds: new Set(['1', '2']),
    loading: false,
    eliminarFavorito: vi.fn(),
    cargarFavoritos: vi.fn(),
    vaciarFavoritos: vi.fn(),
    recargarFavoritos: vi.fn(),
    esFavorito: vi.fn(() => true),
    toggleFavorito: vi.fn(),
};

vi.mock('../../../../hooks/useFavoritos', () => ({
    default: () => mockUseFavoritos,
}));

vi.mock('../../../../context/storeProductos', () => ({
    default: () => ({ productos: [], fetchProductos: vi.fn() }),
}));

vi.mock('../../../../context/storeAuth', () => ({
    default: () => ({ token: 'mock-token' }),
}));

vi.mock('../../../../layout/Header', () => ({
    default: () => null,
}));

vi.mock('../../../../utils/alerts', () => ({
    alert: vi.fn().mockResolvedValue({ isConfirmed: true }),
}));

describe('Favoritos - Estudiante', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem(
            'auth-token',
            JSON.stringify({
                state: { token: 'mock-token', rol: 'estudiante' },
            })
        );
        mockUseFavoritos.favoritos = mockFavoritos;
        mockUseFavoritos.loading = false;
    });
    it('Renderiza los productos favoritos en el componente', async () => {
        render(
            <BrowserRouter>
                <Favoritos />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Laptop HP/i)).toBeInTheDocument();
        });
    });

    it('Muestra un mensaje de estado vacío cuando no existen favoritos', async () => {
        mockUseFavoritos.favoritos = [];

        render(
            <BrowserRouter>
                <Favoritos />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Sin favoritos aún/i)).toBeInTheDocument();
        });
    });

    it('Muestra cada favorito con los botones de ver detalle y eliminar', async () => {
        render(
            <BrowserRouter>
                <Favoritos />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/Laptop HP/i)).toBeInTheDocument());

        const verBtns = screen.getAllByTitle('Ver detalle');
        const delBtns = screen.getAllByTitle('Eliminar de favoritos');
        expect(verBtns.length).toBeGreaterThan(0);
        expect(delBtns.length).toBeGreaterThan(0);
    });

    it('Renderiza las acciones principales: continuar comprando y vaciar favoritos', async () => {
        render(
            <BrowserRouter>
                <Favoritos />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/Laptop HP/i)).toBeInTheDocument());

        expect(screen.getByText(/Continuar Comprando/i)).toBeInTheDocument();
        expect(screen.getByText(/Vaciar Favoritos/i)).toBeInTheDocument();
    });

    it('Elimina un favorito cuando el usuario confirma la acción', async () => {
        window.confirm = vi.fn(() => true);

        render(
            <BrowserRouter>
                <Favoritos />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/Laptop HP/i)).toBeInTheDocument());

        const deleteButtons = screen.getAllByTitle('Eliminar de favoritos');
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(window.confirm).toHaveBeenCalled();
            expect(mockUseFavoritos.eliminarFavorito).toHaveBeenCalledWith('1');
        });
    });

    it('Vacía todos los favoritos cuando el usuario confirma la acción', async () => {
        window.confirm = vi.fn(() => true);

        render(
            <BrowserRouter>
                <Favoritos />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/Laptop HP/i)).toBeInTheDocument());

        const vaciarBtn = screen.getByText(/Vaciar Favoritos/i);
        fireEvent.click(vaciarBtn);

        await waitFor(() => {
            expect(window.confirm).toHaveBeenCalled();
            expect(mockUseFavoritos.vaciarFavoritos).toHaveBeenCalled();
        });
    });
});
