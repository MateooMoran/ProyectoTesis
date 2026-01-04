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

describe('Productos Registrados - Vendedor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('auth-token', JSON.stringify({ state: { token: 'mock-token', rol: 'vendedor' } }));
        alertsModule.__mockAlert.mockResolvedValue({ isConfirmed: true });
    });

    it('Muestra los productos en la pestaña de registrados', async () => {
        const productos = [
            { _id: '1', nombreProducto: 'P1', precio: 10, stock: 5, categoria: { nombreCategoria: 'C' } },
        ];
        useFetchMock.__mockFetch.mockResolvedValue(productos);

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        await waitFor(() => {
            const tab = screen.getByText('Productos Registrados');
            fireEvent.click(tab);
        });

        await waitFor(() => expect(screen.getByText('P1')).toBeTruthy());
    });

    it('Permite editar un producto desde la lista de registrados', async () => {
        const productos = [
            { _id: '1', nombreProducto: 'P1', precio: 10, stock: 5, descripcion: 'D', categoria: { _id: 'c1', nombreCategoria: 'C' } },
        ];
        useFetchMock.__mockFetch.mockResolvedValue(productos);

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        await waitFor(() => {
            fireEvent.click(screen.getByText('Productos Registrados'));
        });

        await waitFor(() => {
            const editBtn = screen.getByTitle('Editar');
            fireEvent.click(editBtn);
        });

        await waitFor(() => {
            expect(screen.getByDisplayValue('P1')).toBeTruthy();
            expect(screen.getByText('Actualizar')).toBeTruthy();
        });
    });

    it('Permite eliminar un producto registrado tras confirmación', async () => {
        const productos = [
            { _id: '1', nombreProducto: 'P1', precio: 10, stock: 5, descripcion: 'D', categoria: { nombreCategoria: 'C' } },
        ];
        useFetchMock.__mockFetch.mockResolvedValueOnce(productos);
        useFetchMock.__mockFetch.mockResolvedValueOnce({}); // delete

        const confirmSpy = vi.spyOn(window, 'confirm');
        confirmSpy.mockReturnValue(true);

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        await waitFor(() => fireEvent.click(screen.getByText('Productos Registrados')));

        await waitFor(() => {
            const delBtn = screen.getByTitle('Eliminar');
            fireEvent.click(delBtn);
        });

        await waitFor(() => {
            const delCall = useFetchMock.__mockFetch.mock.calls.find((c) => c[1]?.method === 'DELETE');
            expect(confirmSpy).toHaveBeenCalled();
            expect(delCall).toBeTruthy();
        });

        confirmSpy.mockRestore();
    });
});
