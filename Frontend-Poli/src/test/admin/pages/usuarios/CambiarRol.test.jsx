import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockFetchDataBackend = vi.fn();

vi.mock('../../../../hooks/useFetch', () => ({
    default: () => ({
        fetchDataBackend: mockFetchDataBackend,
    }),
}));

vi.mock('../../../../utils/alerts', () => ({
    alert: vi.fn(),
}));

import GestionarUsuario from '../../../../pages/admin/GestionarUsuario';

describe('CambiarRol - Admin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem(
            'auth-token',
            JSON.stringify({ state: { token: 'mock-token', rol: 'admin' } })
        );
    });

    it('Muestra el select para cambiar el rol del usuario', async () => {
        const mockUsuarios = [
            { _id: '1', nombre: 'Juan', apellido: 'Pérez', telefono: '099', rol: 'estudiante', estado: true },
        ];
        mockFetchDataBackend.mockResolvedValueOnce(mockUsuarios);

        render(
            <BrowserRouter>
                <GestionarUsuario />
            </BrowserRouter>
        );

        await waitFor(() => {
            const selects = screen.getAllByRole('combobox');
            const selectRol = selects.find(s => s.value === 'estudiante');
            expect(selectRol).toBeTruthy();
        });
    });

    it('Al cambiar rol y confirmar llama a la API (PUT)', async () => {
        const mockUsuarios = [
            { _id: '1', nombre: 'Juan', apellido: 'Pérez', telefono: '099', rol: 'estudiante', estado: true },
        ];
        mockFetchDataBackend.mockResolvedValueOnce(mockUsuarios); // GET
        mockFetchDataBackend.mockResolvedValueOnce({}); // PUT

        global.confirm = vi.fn(() => true);

        render(
            <BrowserRouter>
                <GestionarUsuario />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0));

        const selects = screen.getAllByRole('combobox');
        const selectRol = selects.find(s => s.value === 'estudiante');
        fireEvent.change(selectRol, { target: { value: 'vendedor' } });

        await waitFor(() => {
            // primera llamada GET, segunda PUT
            expect(mockFetchDataBackend).toHaveBeenCalledTimes(2);
            const putCall = mockFetchDataBackend.mock.calls[1];
            expect(putCall[1].method).toBe('PUT');
            expect(putCall[1].body).toEqual({ rol: 'vendedor' });
        });
    });

    it('Después de actualizar, la UI muestra el nuevo rol', async () => {
        const mockUsuarios = [
            { _id: '1', nombre: 'Juan', apellido: 'Pérez', telefono: '099', rol: 'estudiante', estado: true },
        ];
        mockFetchDataBackend.mockResolvedValueOnce(mockUsuarios); // GET
        mockFetchDataBackend.mockResolvedValueOnce({}); // PUT

        global.confirm = vi.fn(() => true);

        render(
            <BrowserRouter>
                <GestionarUsuario />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0));

        const selects = screen.getAllByRole('combobox');
        const selectRol = selects.find(s => s.value === 'estudiante');
        fireEvent.change(selectRol, { target: { value: 'vendedor' } });

        await waitFor(() => {
            expect(screen.getAllByText(/vendedor/i).length).toBeGreaterThan(0);
        });
    });

    it('Si el usuario cancela la confirmación no llama a la API', async () => {
        const mockUsuarios = [
            { _id: '1', nombre: 'Juan', apellido: 'Pérez', telefono: '099', rol: 'estudiante', estado: true },
        ];
        mockFetchDataBackend.mockResolvedValueOnce(mockUsuarios); // GET

        global.confirm = vi.fn(() => false);

        render(
            <BrowserRouter>
                <GestionarUsuario />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0));

        const selects = screen.getAllByRole('combobox');
        const selectRol = selects.find(s => s.value === 'estudiante');
        fireEvent.change(selectRol, { target: { value: 'vendedor' } });

        await waitFor(() => {
            // Only the initial GET call
            expect(mockFetchDataBackend).toHaveBeenCalledTimes(1);
        });
    });
});
