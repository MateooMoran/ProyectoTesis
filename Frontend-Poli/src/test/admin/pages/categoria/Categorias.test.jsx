import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockFetchDataBackend = vi.fn();

vi.mock('../../../../hooks/useFetch', () => ({
    default: () => ({ fetchDataBackend: mockFetchDataBackend }),
}));

vi.mock('../../../../utils/alerts', () => ({
    alert: vi.fn(),
}));
import * as alertsModule from '../../../../utils/alerts';
import CategoriasPage from '../../../../pages/vendedor/Categorias';

describe('Categorias - Admin/Vendedor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('auth-token', JSON.stringify({ state: { token: 'mock-token' } }));
        mockFetchDataBackend.mockReset();
    });

    it('Muestra el formulario para crear categoría y lista de categorías existentes', async () => {
        const mockCategorias = [
            { _id: '1', nombreCategoria: 'Ropa' },
        ];
        mockFetchDataBackend.mockImplementation((url) => {
            if (url && url.includes('/admin/visualizar/categoria')) return Promise.resolve(mockCategorias);
            return Promise.resolve({});
        });

        render(
            <BrowserRouter>
                <CategoriasPage />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText(/Nueva categoría/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Crear/i })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/Ropa/i)).toBeInTheDocument();
        });
    });

    it('Muestra paginación cuando hay más categorías de las permitidas por página', async () => {
        const mockCategorias = Array.from({ length: 7 }, (_, i) => ({ _id: `${i + 1}`, nombreCategoria: `Cat${i + 1}` }));
        mockFetchDataBackend.mockImplementation((url) => {
            if (url && url.includes('/admin/visualizar/categoria')) return Promise.resolve(mockCategorias);
            return Promise.resolve({});
        });

        render(
            <BrowserRouter>
                <CategoriasPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            // Hay más de 5 => debe mostrar paginador (botón 'Siguiente' o botón para página 2)
            expect(screen.getByText(/Siguiente/i) || screen.getByText('2')).toBeTruthy();
        });
    });

    it('No permite crear categoría si el campo está vacío', async () => {
        mockFetchDataBackend.mockImplementation((url) => {
            if (url && url.includes('/admin/visualizar/categoria')) return Promise.resolve([]);
            return Promise.resolve({});
        }); // GET

        render(
            <BrowserRouter>
                <CategoriasPage />
            </BrowserRouter>
        );

        // Click en crear sin rellenar
        fireEvent.click(screen.getByRole('button', { name: /Crear/i }));

        await waitFor(() => {
            // Expect mostrar mensaje de validación y que no se haya llamado al POST
            expect(screen.getByText(/El nombre de la categoría es obligatorio/i)).toBeInTheDocument();
            // Sólo llamada inicial GET
            expect(mockFetchDataBackend).toHaveBeenCalledTimes(1);
        });
    });

    it('Al crear categoría correctamente se actualiza la lista', async () => {
        // Implementación por URL: GET inicial vacío, POST ok, GET recarga con nueva
        const nueva = [{ _id: '99', nombreCategoria: 'NuevaCat' }];
        mockFetchDataBackend.mockImplementation((url) => {
            if (url && url.includes('/admin/visualizar/categoria')) return Promise.resolve(nueva);
            if (url && url.includes('/admin/crear/categoria')) return Promise.resolve({});
            return Promise.resolve({});
        });

        render(
            <BrowserRouter>
                <CategoriasPage />
            </BrowserRouter>
        );

        // Rellenar input y enviar
        fireEvent.change(screen.getByPlaceholderText(/Nueva categoría/i), { target: { value: 'NuevaCat' } });
        fireEvent.click(screen.getByRole('button', { name: /Crear/i }));

        await waitFor(() => {
            // llamadas: GET inicial, POST, GET recarga
            expect(mockFetchDataBackend).toHaveBeenCalledTimes(3);
            expect(screen.getByText(/NuevaCat/i)).toBeInTheDocument();
        });
    });

    it('Muestra alerta si falla la carga de categorías', async () => {
        mockFetchDataBackend.mockImplementation((url) => {
            if (url && url.includes('/admin/visualizar/categoria')) return Promise.reject(new Error('Error al cargar'));
            return Promise.resolve({});
        });

        render(
            <BrowserRouter>
                <CategoriasPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(alertsModule.alert).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', title: expect.any(String) }));
        });
    });
});
