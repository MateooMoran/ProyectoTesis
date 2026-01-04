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
    default: () => ({
        generando: false,
        progreso: 0,
        estado: '',
        iniciarGeneracion: mockIniciarGeneracion,
    }),
}));

import * as useFetchMock from '../../../../hooks/useFetch';
import * as alertsModule from '../../../../utils/alerts';

describe('ProductosVendedor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem(
            'auth-token',
            JSON.stringify({
                state: { token: 'mock-token', rol: 'vendedor' },
            })
        );
        alertsModule.__mockAlert.mockResolvedValue({ isConfirmed: true });
    });
    it('Renderiza formulario y muestra tabs principales', async () => {
        useFetchMock.__mockFetch.mockResolvedValue([]);

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Ej: Laptop HP')).toBeTruthy();
            expect(screen.getAllByText('Crear Producto').length).toBeGreaterThan(0);
            expect(screen.getByText('Productos Registrados')).toBeTruthy();
        });
    });

    it('Permite cambiar entre tabs Nuevo Producto y Productos Registrados', async () => {
        const mockProductos = [
            { _id: '1', nombreProducto: 'Laptop HP', precio: 1200, stock: 10, categoria: { _id: 'cat1', nombreCategoria: 'Tecnología' } },
        ];

        useFetchMock.__mockFetch.mockResolvedValue(mockProductos);

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        await waitFor(() => {
            const registradosTab = screen.getByText('Productos Registrados');
            fireEvent.click(registradosTab);
        });

        await screen.findByText('Laptop HP');
        const nuevoTab = screen.getByText('Crear Producto');
        fireEvent.click(nuevoTab);
        expect(await screen.findByPlaceholderText('Ej: Laptop HP')).toBeTruthy();
    });

    it('Muestra indicador de carga cuando la API tarda en responder', async () => {
        useFetchMock.__mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        const registradosTab = screen.getByText('Productos Registrados');
        fireEvent.click(registradosTab);

        await waitFor(() => {
            expect(screen.queryByText('Cargando productos...')).toBeTruthy();
        });
    });

    it('No permite crear producto con campos vacíos y muestra alert', async () => {
        useFetchMock.__mockFetch.mockResolvedValue([]);

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText('Nuevo Producto')).toBeTruthy());

        const nuevoSection = screen.getByText('Nuevo Producto').closest('div');
        const buttons = Array.from(nuevoSection.querySelectorAll('button'));
        const crearButton = buttons.find(b => b.textContent.includes('Crear Producto')) || buttons.pop();
        fireEvent.click(crearButton);

        await waitFor(() => {
            expect(alertsModule.__mockAlert).toHaveBeenCalledWith({ icon: 'error', title: 'Todos los campos son obligatorios' });
        });
    });

    it('Modelo 3D: bloqueado sin producto y permite generar si hay intentos', async () => {
        // sin productos -> bloqueado
        useFetchMock.__mockFetch.mockResolvedValue([]);

        const { rerender } = render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        await waitFor(() => {
            const generarBtn = screen.getByText('Generar Modelo 3D').closest('button');
            expect(generarBtn.disabled).toBe(true);
        });

        // con producto disponible para generar
        const mockProductoDisponible = [
            { _id: '2', nombreProducto: 'Mouse Logitech', precio: 25, stock: 50, imagen: 'mouse.jpg', descripcion: 'Test', categoria: { _id: 'cat1', nombreCategoria: 'Accesorios' }, intentosModelo3D: 1 },
        ];

        useFetchMock.__mockFetch.mockResolvedValue(mockProductoDisponible);

        rerender(
            <BrowserRouter>
                <ProductosVendedor key="disponible" />
            </BrowserRouter>
        );

        await waitFor(() => {
            const registradosTab = screen.getByText('Productos Registrados');
            fireEvent.click(registradosTab);
        });

        await waitFor(() => {
            const editButton = screen.getByTitle('Editar');
            fireEvent.click(editButton);
        });

        await waitFor(() => {
            const generarBtn = screen.getByText('Generar Modelo 3D').closest('button');
            expect(generarBtn.disabled).toBe(false);
            fireEvent.click(generarBtn);
        });

        await waitFor(() => {
            expect(mockIniciarGeneracion).toHaveBeenCalledWith('2', 'Mouse Logitech');
        });
    });
});