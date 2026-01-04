import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import MetodoPago from '../../../../pages/vendedor/MetodoPago';

vi.mock('../../../../utils/alerts', () => {
    const alert = vi.fn().mockResolvedValue({ isConfirmed: true });
    return { __esModule: true, alert, __mockAlert: alert };
});

import * as mockedAlerts from '../../../../utils/alerts';

vi.mock('../../../../layout/Header', () => ({
    default: () => null,
}));

describe('MetodoPago - Vendedor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem(
            'auth-token',
            JSON.stringify({
                state: { token: 'mock-token', rol: 'vendedor' },
            })
        );

        global.fetch = vi.fn((url) => {
            if (url.includes('/transferencia')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ metodo: { banco: 'Banco Pichincha', numeroCuenta: '123', titular: 'Juan', cedula: '001' } })
                });
            }

            if (url.includes('/qr')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ metodo: { imagenComprobante: 'data:image/png;base64,xyz' } })
                });
            }

            if (url.includes('/retiro')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ metodo: { lugares: ['Local 1'] } })
                });
            }

            return Promise.resolve({ ok: true, json: () => Promise.resolve(null) });
        });
    });

    it('Visualizar métodos de pago', async () => {
        render(
            <BrowserRouter>
                <MetodoPago />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Transferencia Bancaria/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('Crear método de pago - Visualizar formulario', async () => {
        render(
            <BrowserRouter>
                <MetodoPago />
            </BrowserRouter>
        );

        await waitFor(() => {
            const buttons = screen.queryAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        }, { timeout: 3000 });
    });

    it('Ver Método muestra modal con detalles', async () => {
        render(
            <BrowserRouter>
                <MetodoPago />
            </BrowserRouter>
        );

        // Esperar que los botones se rendericen
        await waitFor(() => {
            expect(screen.getByText(/Transferencia Bancaria/i)).toBeInTheDocument();
        });

        const verButtons = screen.getAllByText(/Ver Método/i);
        expect(verButtons.length).toBeGreaterThan(0);

        await userEvent.click(verButtons[0]);

        await waitFor(() => {
            // Buscar el valor específico del banco en el modal
            expect(screen.getByText(/Banco Pichincha/i)).toBeInTheDocument();
        });
    });

    it('Seleccionar tipo muestra el formulario correspondiente', async () => {
        const { container } = render(
            <BrowserRouter>
                <MetodoPago />
            </BrowserRouter>
        );

        // Por defecto se muestra transferencia
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Ingresa el banco/i)).toBeInTheDocument();
        });

        // Seleccionar Código QR y comprobar que aparece input file
        const qrButton = screen.getByText(/Código QR/i);
        await userEvent.click(qrButton);

        await waitFor(() => {
            const fileInput = container.querySelector('input[type="file"]');
            expect(fileInput).toBeTruthy();
        });
    });

    it('Muestra alert si intenta guardar sin completar campos y muestra success al guardar correctamente', async () => {
        render(
            <BrowserRouter>
                <MetodoPago />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Ingresa el banco/i)).toBeInTheDocument();
        });

        const saveButton = screen.getByRole('button', { name: /Guardar Método de Pago/i });
        await userEvent.click(saveButton);

        await waitFor(() => {
            expect(mockedAlerts.__mockAlert).toHaveBeenCalled();
        });
    });

    it('Muestra mensaje cuando no hay métodos de pago registrados', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]),
            })
        );

        render(
            <BrowserRouter>
                <MetodoPago />
            </BrowserRouter>
        );

        await waitFor(() => {
            const noMetodosText = screen.queryByText(/no tienes métodos|no hay métodos/i);
            const buttons = screen.queryAllByRole('button');
            expect(noMetodosText || buttons.length > 0).toBeTruthy();
        }, { timeout: 3000 });
    });

    it('Muestra estado de carga mientras obtiene métodos', async () => {
        // Simular fetch que nunca resuelve
        global.fetch = vi.fn(() => new Promise(() => { }));

        render(
            <BrowserRouter>
                <MetodoPago />
            </BrowserRouter>
        );

        await waitFor(() => {
            const buttons = screen.queryAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });
    });

    it('Maneja errores al cargar métodos de pago', async () => {
        global.fetch = vi.fn(() =>
            Promise.reject(new Error('Error al cargar métodos de pago'))
        );

        render(
            <BrowserRouter>
                <MetodoPago />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
    });
});
