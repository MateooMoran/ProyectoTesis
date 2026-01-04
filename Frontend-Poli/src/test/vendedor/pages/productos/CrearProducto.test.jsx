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

describe('Crear Producto - Vendedor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('auth-token', JSON.stringify({ state: { token: 'mock-token', rol: 'vendedor' } }));
        alertsModule.__mockAlert.mockResolvedValue({ isConfirmed: true });
    });

    it('Renderiza formulario y campos para crear un nuevo producto', async () => {
        useFetchMock.__mockFetch.mockResolvedValue([]);

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Ej: Laptop HP')).toBeTruthy();
            expect(screen.getByPlaceholderText('0.00')).toBeTruthy();
            expect(screen.getByText('Vista Previa de Imagen')).toBeTruthy();
        });
    });

    it('Valida los campos obligatorios antes de crear el producto y muestra alerta', async () => {
        useFetchMock.__mockFetch.mockResolvedValue([]);

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText('Nuevo Producto')).toBeTruthy());

        const nuevoSection = screen.getByText('Nuevo Producto').closest('div');
        const buttons = Array.from(nuevoSection.querySelectorAll('button'));
        const crearButton = buttons.find((b) => b.textContent.includes('Crear Producto') && b.getAttribute('aria-current') !== 'true') || buttons.pop();

        fireEvent.click(crearButton);

        await waitFor(() => {
            expect(alertsModule.__mockAlert).toHaveBeenCalledWith({ icon: 'error', title: 'Todos los campos son obligatorios' });
        });
    });

    it('Crea un producto y actualiza la lista de productos', async () => {
        // sequence: initial GET products (empty), GET categories (one), POST -> {}, GET -> array with new product
        useFetchMock.__mockFetch.mockResolvedValueOnce([]); // products
        useFetchMock.__mockFetch.mockResolvedValueOnce([{ _id: 'cat1', nombreCategoria: 'X' }]); // categorias
        useFetchMock.__mockFetch.mockResolvedValueOnce({});
        useFetchMock.__mockFetch.mockResolvedValueOnce([
            { _id: 'p1', nombreProducto: 'NuevoProd', precio: 10, stock: 1, categoria: { nombreCategoria: 'X' } },
        ]);

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        // fill form
        fireEvent.change(screen.getByPlaceholderText('Ej: Laptop HP'), { target: { value: 'NuevoProd' } });
        fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '10' } });
        fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1' } });
        fireEvent.change(screen.getByPlaceholderText('Describe tu producto...'), { target: { value: 'Desc' } });
        // select category
        const select = await waitFor(() => document.querySelector('select[name="categoria"]'));
        fireEvent.change(select, { target: { name: 'categoria', value: 'cat1' } });

        // click create inside Nuevo Producto
        const nuevoSection = screen.getByText('Nuevo Producto').closest('div');
        const buttons = Array.from(nuevoSection.querySelectorAll('button'));
        const crearButton = buttons.find((b) => b.textContent.includes('Crear Producto') && b.getAttribute('aria-current') !== 'true') || buttons.pop();
        fireEvent.click(crearButton);

        await waitFor(() => {
            const postCall = useFetchMock.__mockFetch.mock.calls.find((c) => c[1]?.method === 'POST');
            expect(postCall).toBeTruthy();
            expect(postCall[1].body).toBeTruthy();
        });

        // go to registrados and assert the new product is shown after refresh
        fireEvent.click(screen.getByText('Productos Registrados'));
        await waitFor(() => expect(screen.getByText('NuevoProd')).toBeTruthy());
    });

    it('Actualiza la vista previa al seleccionar una imagen', async () => {
        useFetchMock.__mockFetch.mockResolvedValue([]);

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        const input = document.querySelector('input[type=file]');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            // preview should show an img element in the preview area (src set to object URL)
            const preview = document.querySelector('img[alt="Preview"]');
            expect(preview).toBeTruthy();
        });
    });

    it('Botón Generar Imagen está deshabilitado sin prompt y habilita con texto', async () => {
        useFetchMock.__mockFetch.mockResolvedValue([]);

        render(
            <BrowserRouter>
                <ProductosVendedor />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText('Nuevo Producto')).toBeTruthy());

        const generarBtn = screen.getByText(/Generar Imagen/i).closest('button');
        expect(generarBtn.disabled).toBe(true);

        // enable by typing prompt
        const promptInput = screen.getByPlaceholderText('Describe la imagen...');
        fireEvent.change(promptInput, { target: { value: 'un prompt' } });
        expect(generarBtn.disabled).toBe(false);
    });
});
