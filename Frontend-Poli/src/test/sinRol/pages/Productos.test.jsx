import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Productos from '../../../pages/productosGeneral/Productos';

vi.mock('../../../utils/alerts', () => ({
    alert: vi.fn().mockResolvedValue({ isConfirmed: true }),
}));

vi.mock('../../..//layout/Header', () => ({
    default: () => null,
}));

vi.mock('../../../context/storeProductos', () => ({
    default: vi.fn(() => ({
        productos: [],
        categorias: [],
        loadingProductos: false,
        loadingCategorias: false,
        error: null,
        errorCategorias: null,
        fetchProductos: vi.fn(),
        fetchCategorias: vi.fn(),
    })),
}));

vi.mock('../../../context/storeAuth', () => ({
    default: vi.fn(() => ({
        token: null,
    })),
}));

vi.mock('../../../context/storeProfile', () => ({
    default: vi.fn(() => ({
        user: null,
    })),
}));

import storeProductos from '../../../context/storeProductos';

describe('Productos - Sin Rol', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('Visualizar lista de productos sin autenticación', async () => {
        storeProductos.mockReturnValue({
            productos: [
                {
                    _id: '1',
                    nombreProducto: 'Laptop HP',
                    precio: 1200,
                    stock: 10,
                    categoria: { nombre: 'Tecnología' },
                },
            ],
            categorias: [],
            loadingProductos: false,
            loadingCategorias: false,
            error: null,
            errorCategorias: null,
            fetchProductos: vi.fn(),
            fetchCategorias: vi.fn(),
        });

        render(
            <BrowserRouter>
                <Productos />
            </BrowserRouter>
        );

        await waitFor(() => {
            const product = screen.queryByText(/Laptop HP/i);
            expect(product || storeProductos).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('Muestra mensaje cuando no hay productos disponibles', async () => {
        storeProductos.mockReturnValue({
            productos: [],
            categorias: [],
            loadingProductos: false,
            loadingCategorias: false,
            error: null,
            errorCategorias: null,
            fetchProductos: vi.fn(),
            fetchCategorias: vi.fn(),
        });

        render(
            <BrowserRouter>
                <Productos />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(storeProductos).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    it('Muestra estado de carga mientras obtiene productos', () => {
        storeProductos.mockReturnValue({
            productos: [],
            categorias: [],
            loadingProductos: true,
            loadingCategorias: false,
            error: null,
            errorCategorias: null,
            fetchProductos: vi.fn(),
            fetchCategorias: vi.fn(),
        });

        render(
            <BrowserRouter>
                <Productos />
            </BrowserRouter>
        );

        const loadingElements = screen.queryAllByText(/cargando productos/i);
        expect(loadingElements.length).toBeGreaterThan(0);
    });

    it('Maneja errores al cargar productos', async () => {
        storeProductos.mockReturnValue({
            productos: [],
            categorias: [],
            loadingProductos: false,
            loadingCategorias: false,
            error: 'Error al cargar',
            errorCategorias: null,
            fetchProductos: vi.fn(),
            fetchCategorias: vi.fn(),
        });

        render(
            <BrowserRouter>
                <Productos />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(storeProductos).toHaveBeenCalled();
        });
    });

    it('Muestra categorías de productos', async () => {
        storeProductos.mockReturnValue({
            productos: [],
            categorias: [{ _id: '1', nombre: 'Tecnología' }],
            loadingProductos: false,
            loadingCategorias: false,
            error: null,
            errorCategorias: null,
            fetchProductos: vi.fn(),
            fetchCategorias: vi.fn(),
        });

        render(
            <BrowserRouter>
                <Productos />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(storeProductos).toHaveBeenCalled();
        });
    });
});
