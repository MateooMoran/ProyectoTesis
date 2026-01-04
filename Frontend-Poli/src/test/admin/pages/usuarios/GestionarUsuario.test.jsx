import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GestionarUsuario from '../../../../pages/admin/GestionarUsuario';

const mockFetchDataBackend = vi.fn();

vi.mock('../../../../hooks/useFetch', () => ({
    default: () => ({
        fetchDataBackend: mockFetchDataBackend,
    }),
}));

vi.mock('../../../../utils/alerts', () => ({
    alert: vi.fn().mockResolvedValue({ isConfirmed: true }),
}));

describe('GestionarUsuario - Admin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem(
            'auth-token',
            JSON.stringify({
                state: { token: 'mock-token', rol: 'admin' },
            })
        );
        global.confirm = vi.fn(() => true);
    });

    it('Visualizar todos los usuarios', async () => {
        const mockUsuarios = [
            {
                _id: '1',
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan@example.com',
                rol: 'estudiante',
                estado: true,
            },
            {
                _id: '2',
                nombre: 'María',
                apellido: 'López',
                email: 'maria@example.com',
                rol: 'vendedor',
                estado: true,
            },
        ];

        mockFetchDataBackend.mockResolvedValue(mockUsuarios);

        render(
            <BrowserRouter>
                <GestionarUsuario />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryAllByText(/Juan/i).length).toBeGreaterThan(0);
            expect(screen.queryAllByText(/María/i).length).toBeGreaterThan(0);
        });
    });

    it('Muestra estado de carga mientras obtiene usuarios', () => {
        mockFetchDataBackend.mockImplementation(() => new Promise(() => { }));

        render(
            <BrowserRouter>
                <GestionarUsuario />
            </BrowserRouter>
        );

        expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    it('Maneja errores al cargar usuarios', async () => {
        mockFetchDataBackend.mockRejectedValue(new Error('Error al cargar'));

        render(
            <BrowserRouter>
                <GestionarUsuario />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(mockFetchDataBackend).toHaveBeenCalled();
        });
    });

    it('Filtra usuarios por rol', async () => {
        const mockUsuarios = [
            {
                _id: '1',
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan@example.com',
                rol: 'estudiante',
                estado: true,
            },
            {
                _id: '2',
                nombre: 'María',
                apellido: 'López',
                email: 'maria@example.com',
                rol: 'vendedor',
                estado: true,
            },
        ];

        mockFetchDataBackend.mockResolvedValue(mockUsuarios);

        render(
            <BrowserRouter>
                <GestionarUsuario />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryAllByText(/Juan/i).length).toBeGreaterThan(0);
            expect(screen.queryAllByText(/María/i).length).toBeGreaterThan(0);
        });

        const selects = screen.getAllByRole('combobox');
        const selectRol = selects.find(s => Array.from(s.options).some(o => /Todos los roles/i.test(o.text)));
        expect(selectRol).toBeTruthy();

        fireEvent.change(selectRol, { target: { value: 'estudiante' } });

        expect(screen.queryAllByText(/Juan/i).length).toBeGreaterThan(0);
        expect(screen.queryAllByText(/María/i).length).toBe(0);
    });

    it('Muestra paginación cuando hay usuarios', async () => {
        const mockUsuarios = Array.from({ length: 10 }, (_, i) => ({
            _id: `${i + 1}`,
            nombre: `Usuario${i + 1}`,
            apellido: 'Test',
            email: `user${i + 1}@example.com`,
            rol: 'estudiante',
            estado: true,
        }));

        mockFetchDataBackend.mockResolvedValue(mockUsuarios);

        render(
            <BrowserRouter>
                <GestionarUsuario />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryAllByText(/Usuario1/i).length).toBeGreaterThan(0);
        });
    });
});
