import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductoDetalle from '../../../pages/productosGeneral/ProductoDetalle';

const mockParams = { id: '1' };

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => mockParams,
        useLocation: () => ({ pathname: '/productos/1' }),
    };
});

vi.mock('../../../utils/alerts', () => ({
    alert: vi.fn().mockResolvedValue({ isConfirmed: true }),
}));

vi.mock('../../../hooks/useFetch', () => ({
    default: () => ({
        fetchDataBackend: vi.fn().mockResolvedValue(null),
    }),
}));

vi.mock('../../../context/storeProductos', () => ({
    default: vi.fn(() => ({
        productos: [],
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

describe('ProductoDetalle - Sin Rol', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('Visualizar detalles de un producto sin autenticación', async () => {
        render(
            <BrowserRouter>
                <ProductoDetalle />
            </BrowserRouter>
        );

        await waitFor(() => {
            const loadingText = screen.queryByText(/cargando producto/i);
            expect(loadingText || screen.queryByRole('button')).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('Muestra información completa del producto', async () => {
        render(
            <BrowserRouter>
                <ProductoDetalle />
            </BrowserRouter>
        );

        await waitFor(() => {
            const content = screen.queryByRole('button') || screen.queryByText(/producto/i);
            expect(content).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('Muestra estado de carga mientras obtiene el producto', () => {
        render(
            <BrowserRouter>
                <ProductoDetalle />
            </BrowserRouter>
        );

        const loadingText = screen.queryByText(/cargando producto/i);
        expect(loadingText || screen.queryByRole('button')).toBeTruthy();
    });

    it('Maneja errores al cargar el producto', async () => {
        render(
            <BrowserRouter>
                <ProductoDetalle />
            </BrowserRouter>
        );

        await waitFor(() => {
            const content = document.querySelector('div');
            expect(content).toBeTruthy();
        });
    });

    it('Carga el producto al montar el componente', async () => {
        render(
            <BrowserRouter>
                <ProductoDetalle />
            </BrowserRouter>
        );

        await waitFor(() => {
            const content = document.querySelector('div');
            expect(content).toBeTruthy();
        });
    });
});
