import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductosVendedor from '../../../../pages/vendedor/ProductosVendedor';

vi.mock('../../../../hooks/useFetch', () => {
    const fetchDataBackend = vi.fn();
    return { __esModule: true, default: () => ({ fetchDataBackend }), __mockFetch: fetchDataBackend };
});

vi.mock('../../../../utils/alerts', () => {
    const alert = vi.fn();
    return { __esModule: true, alert, __mockAlert: alert };
});

const mockIniciarGeneracion = vi.fn();
vi.mock('../../../../context/storeModelo3D', () => ({
    default: () => ({ generando: false, progreso: 0, estado: '', iniciarGeneracion: mockIniciarGeneracion }),
}));

import * as useFetchMock from '../../../../hooks/useFetch';
import * as alertsModule from '../../../../utils/alerts';

describe('Modelo 3D - Productos', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('auth-token', JSON.stringify({ state: { token: 'mock-token', rol: 'vendedor' } }));
        alertsModule.__mockAlert.mockResolvedValue({ isConfirmed: true });
    });

    it('No permite generar el modelo 3D si no hay un producto seleccionado', async () => {
        useFetchMock.__mockFetch.mockResolvedValue([]);

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        await waitFor(() => {
            const generarButton = screen.getByText('Generar Modelo 3D').closest('button');
            expect(generarButton.disabled).toBe(true);
            expect(screen.getByText('Primero guarda el producto para generar el modelo 3D')).toBeTruthy();
        });
    });

    it('Muestra una alerta cuando se alcanza el límite de generación de modelos 3D', async () => {
        const prod = [{ _id: '1', nombreProducto: 'P1', precio: 1, stock: 1, intentosModelo3D: 1 }];
        // initial GET products then categories
        useFetchMock.__mockFetch.mockResolvedValueOnce(prod);
        useFetchMock.__mockFetch.mockResolvedValueOnce([]);
        // POST generar -> response indicating no attempts left
        useFetchMock.__mockFetch.mockResolvedValueOnce({ intentosRestantes: 0, msg: 'Límite' });

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        // go to registrados and edit
        await waitFor(() => fireEvent.click(screen.getByText('Productos Registrados')));
        await waitFor(() => fireEvent.click(screen.getByTitle('Editar')));

        // click generar
        const generarButton = await waitFor(() => screen.getByText('Generar Modelo 3D').closest('button'));
        fireEvent.click(generarButton);

        await waitFor(() => {
            expect(alertsModule.__mockAlert).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' }));
        });
    });

    it('Inicia la generación del modelo 3D cuando hay intentos disponibles', async () => {
        const prod = [{ _id: '2', nombreProducto: 'P2', precio: 1, stock: 1, intentosModelo3D: 1 }];
        useFetchMock.__mockFetch.mockResolvedValueOnce(prod);
        useFetchMock.__mockFetch.mockResolvedValueOnce([]);
        useFetchMock.__mockFetch.mockResolvedValueOnce({ intentosRestantes: 2, intentosUsados: 1 });

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        await waitFor(() => fireEvent.click(screen.getByText('Productos Registrados')));
        await waitFor(() => fireEvent.click(screen.getByTitle('Editar')));

        const generarButton = await waitFor(() => screen.getByText('Generar Modelo 3D').closest('button'));
        fireEvent.click(generarButton);

        await waitFor(() => {
            expect(mockIniciarGeneracion).toHaveBeenCalledWith('2', 'P2');
            expect(alertsModule.__mockAlert).toHaveBeenCalledWith(expect.objectContaining({ icon: 'info' }));
        });
    });
});
