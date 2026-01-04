import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockFetchDataBackend = vi.fn();

vi.mock('../../../../../src/hooks/useFetch', () => ({
    default: () => ({ fetchDataBackend: mockFetchDataBackend }),
}));

vi.mock('../../../../../src/utils/alerts', () => ({
    alert: vi.fn(),
}));
import * as alertsModule from '../../../../../src/utils/alerts';

vi.mock('../../../../../src/layout/Header', () => ({ default: () => null }));

import QuejasSugerencias from '../../../../../src/pages/QuejasSugerencias';

describe('QuejasSugerencias - General', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // set authenticated estudiante
        localStorage.setItem('auth-token', JSON.stringify({ state: { token: 'mock-token', rol: 'estudiante' } }));
    });

    it('Muestra el formulario y un mensaje cuando el usuario no tiene quejas o sugerencias', async () => {
        mockFetchDataBackend.mockResolvedValueOnce([]); // initial GET

        render(
            <MemoryRouter>
                <QuejasSugerencias />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Nueva Queja\/Sugerencia/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/No tienes quejas o sugerencias enviadas/i)).toBeInTheDocument();
        });
    });

    it('Muestra la lista de quejas y sugerencias cuando existen registros', async () => {
        const list = [
            { _id: '1', tipo: 'queja', mensaje: 'Mensaje 1', estado: 'pendiente', createdAt: new Date().toISOString() },
        ];
        // GET
        mockFetchDataBackend.mockResolvedValueOnce(list);

        render(
            <MemoryRouter>
                <QuejasSugerencias />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Mis Registros \(1\)/i)).toBeInTheDocument();
            expect(screen.getByText(/Mensaje 1/i)).toBeInTheDocument();
            // delete button present for pending (find inside the item container)
            const item = screen.getByText(/Mensaje 1/i);
            const container = item.closest('.bg-gray-50') || item.closest('div');
            expect(container.querySelector('button')).toBeTruthy();
        });
    });

    it('Envía una nueva queja o sugerencia y recarga la lista de registros', async () => {
        const initial = [];
        const after = [
            { _id: '2', tipo: 'sugerencia', mensaje: 'Nueva', estado: 'pendiente', createdAt: new Date().toISOString() },
        ];
        // sequence: GET (initial), POST ({}), GET (after)
        mockFetchDataBackend.mockResolvedValueOnce(initial);
        mockFetchDataBackend.mockResolvedValueOnce({});
        mockFetchDataBackend.mockResolvedValueOnce(after);

        render(
            <MemoryRouter>
                <QuejasSugerencias />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByPlaceholderText(/Escribe tu mensaje/i)).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText(/Escribe tu mensaje/i), { target: { value: 'Nueva' } });
        fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));

        await waitFor(() => {
            // POST should be called
            const postCall = mockFetchDataBackend.mock.calls.find((c) => c[1]?.method === 'POST');
            expect(postCall).toBeTruthy();
            expect(postCall[1].body).toEqual(expect.objectContaining({ mensaje: expect.any(String) }));
            // after reload, new item shown (exact match to avoid header match)
            const matches = screen.getAllByText(/^Nueva$/i);
            expect(matches.length).toBeGreaterThan(0);
        });
    });

    it('Solicita confirmación y elimina una queja cuando el usuario confirma', async () => {
        const list = [
            { _id: '3', tipo: 'queja', mensaje: 'Borrar esto', estado: 'pendiente', createdAt: new Date().toISOString() },
        ];
        // initial GET
        mockFetchDataBackend.mockResolvedValueOnce(list);
        // DELETE
        mockFetchDataBackend.mockResolvedValueOnce({});

        global.confirm = vi.fn(() => true);

        render(
            <MemoryRouter>
                <QuejasSugerencias />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText(/Borrar esto/i)).toBeInTheDocument());

        // click the delete button inside the item container
        const item = screen.getByText(/Borrar esto/i);
        const container = item.closest('.bg-gray-50') || item.closest('div');
        const deleteBtn = container.querySelector('button');
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            // expect delete call (method DELETE)
            const delCall = mockFetchDataBackend.mock.calls.find((c) => c[1]?.method === 'DELETE');
            expect(global.confirm).toHaveBeenCalled();
            expect(delCall).toBeTruthy();
        });
    });

    it('Bloquea el botón de envío si el mensaje está vacío', async () => {
        mockFetchDataBackend.mockResolvedValueOnce([]);

        render(
            <MemoryRouter>
                <QuejasSugerencias />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByRole('button', { name: /Enviar/i })).toBeInTheDocument());

        const btn = screen.getByRole('button', { name: /Enviar/i });
        const form = btn.closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(alertsModule.alert).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', title: expect.any(String) }));
        });
    });
});
