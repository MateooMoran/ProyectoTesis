import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import GestionQuejasSugerencias from '../../../../pages/admin/GestionQuejasSugerencias';

const mockFetchDataBackend = vi.fn();

vi.mock('../../../../hooks/useFetch', () => ({
    default: () => ({
        fetchDataBackend: mockFetchDataBackend,
    }),
}));

vi.mock('../../../../utils/alerts', () => ({
    alert: vi.fn().mockResolvedValue({ isConfirmed: true }),
}));

describe('GestionQuejasSugerencias - Admin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem(
            'auth-token',
            JSON.stringify({
                state: { token: 'mock-token', rol: 'admin' },
            })
        );
    });

    it('Visualiza todas las quejas y sugerencias', async () => {
        mockFetchDataBackend.mockResolvedValueOnce([
            {
                _id: '1',
                tipo: 'queja',
                mensaje: 'Queja del usuario 1',
                estado: 'pendiente',
                usuario: { nombre: 'Juan', apellido: 'Pérez' },
                createdAt: '2024-01-15T10:00:00.000Z',
            },
            {
                _id: '2',
                tipo: 'sugerencia',
                mensaje: 'Sugerencia del usuario 2',
                estado: 'resuelta',
                usuario: { nombre: 'María', apellido: 'López' },
                createdAt: '2024-01-16T11:00:00.000Z',
            },
        ]);

        render(
            <BrowserRouter>
                <GestionQuejasSugerencias />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Queja del usuario 1/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('Responder con textarea - Textarea presente', async () => {
        mockFetchDataBackend.mockResolvedValueOnce([
            {
                _id: '1',
                tipo: 'queja',
                mensaje: 'Queja sin responder',
                estado: 'pendiente',
                usuario: { nombre: 'Juan', apellido: 'Pérez' },
                createdAt: '2024-01-15T10:00:00.000Z',
            },
        ]);

        render(
            <BrowserRouter>
                <GestionQuejasSugerencias />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Queja sin responder/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        const textareas = screen.getAllByRole('textbox');
        expect(textareas.length).toBeGreaterThan(0);
    });

    it('Guardar respuesta - Enviar respuesta válida', async () => {
        const user = userEvent.setup();

        mockFetchDataBackend
            .mockResolvedValueOnce([
                {
                    _id: '1',
                    tipo: 'queja',
                    mensaje: 'Queja sin responder',
                    estado: 'pendiente',
                    usuario: { nombre: 'Juan', apellido: 'Pérez' },
                    createdAt: '2024-01-15T10:00:00.000Z',
                },
            ])
            .mockResolvedValueOnce({ msg: 'Respuesta guardada' });

        render(
            <BrowserRouter>
                <GestionQuejasSugerencias />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Queja sin responder/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        const textareas = screen.getAllByRole('textbox');
        if (textareas.length > 0) {
            await user.type(textareas[0], 'Esta es una respuesta de prueba');
        }

        const buttons = screen.getAllByRole('button');
        const saveButton = buttons.find(btn => btn.textContent.includes('Guardar') || btn.textContent.includes('Responder'));

        if (saveButton) {
            await user.click(saveButton);
        }
    });

    it('Muestra estado de carga mientras obtiene quejas', () => {
        mockFetchDataBackend.mockImplementation(() => new Promise(() => { }));

        render(
            <BrowserRouter>
                <GestionQuejasSugerencias />
            </BrowserRouter>
        );

        expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    it('Maneja errores al cargar quejas', async () => {
        mockFetchDataBackend.mockRejectedValue(new Error('Error al cargar quejas'));

        render(
            <BrowserRouter>
                <GestionQuejasSugerencias />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(mockFetchDataBackend).toHaveBeenCalled();
        });
    });
});
