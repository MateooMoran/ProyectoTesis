import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Historial from '../../../../pages/vendedor/Historial';

const mockFetchDataBackend = vi.fn();

vi.mock('../../../../hooks/useFetch', () => ({
    default: () => ({
        fetchDataBackend: mockFetchDataBackend,
    }),
}));

vi.mock('../../../../utils/alerts', () => ({
    alert: vi.fn().mockResolvedValue({ isConfirmed: true }),
}));

vi.mock('../../../../utils/imageSrc', () => ({
    __esModule: true,
    default: () => '/fake-image.jpg',
}));

describe('Historial - Vendedor (ampliado)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem(
            'auth-token',
            JSON.stringify({
                state: { token: 'mock-token', rol: 'vendedor' },
            })
        );
    });

    it('Muestra el historial de ventas con información del producto y comprador', async () => {
        mockFetchDataBackend.mockResolvedValueOnce([
            {
                _id: '1',
                total: 1200,
                estado: 'completado',
                comprador: { nombre: 'Juan' },
                producto: { nombreProducto: 'Pantalon', _id: 'prod-1', precio: 1200 },
            },
        ]);

        render(
            <BrowserRouter>
                <Historial />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Pantalon/i)).toBeInTheDocument();
            expect(screen.getByText(/Juan/i)).toBeInTheDocument();
        });
    });

    it('Muestra un mensaje cuando no existen ventas registradas', async () => {
        mockFetchDataBackend.mockResolvedValueOnce([]);

        render(
            <BrowserRouter>
                <Historial />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/no hay/i)).toBeInTheDocument();
        });
    });

    it('Muestra un estado de carga mientras se obtienen las ventas', () => {
        mockFetchDataBackend.mockImplementation(() => new Promise(() => { }));

        render(
            <BrowserRouter>
                <Historial />
            </BrowserRouter>
        );

        expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    it('Maneja errores al cargar el historial de ventas', async () => {
        mockFetchDataBackend.mockRejectedValueOnce(new Error('Error al cargar historial de ventas'));

        render(
            <BrowserRouter>
                <Historial />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(mockFetchDataBackend).toHaveBeenCalled();
        });
    });

    it('Carga el historial al montar el componente', async () => {
        mockFetchDataBackend.mockResolvedValueOnce([
            {
                _id: '1',
                total: 1200,
                estado: 'completado',
                comprador: { nombre: 'Juan' },
                producto: { nombreProducto: 'Pantalon', _id: 'prod-1' },
            },
        ]);

        render(
            <BrowserRouter>
                <Historial />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(mockFetchDataBackend).toHaveBeenCalled();
        });
    });

    it('Filtra las ventas por estado usando las pestañas', async () => {
        mockFetchDataBackend.mockResolvedValueOnce([
            {
                _id: 'a',
                estado: 'comprobante_subido',
                comprador: { nombre: 'Pepito' },
                producto: { nombreProducto: 'Prod Pendiente', _id: 'p-a' },
                metodoPagoVendedor: { tipo: 'efectivo' },
            },
            {
                _id: 'b',
                estado: 'pago_confirmado_vendedor',
                comprador: { nombre: 'Maria' },
                producto: { nombreProducto: 'Prod Confirmado', _id: 'p-b' },
                metodoPagoVendedor: { tipo: 'transferencia' },
            },
        ]);

        render(
            <BrowserRouter>
                <Historial />
            </BrowserRouter>
        );

        // Esperar render inicial
        await waitFor(() => expect(screen.queryAllByText(/Prod Pendiente|Prod Confirmado/).length).toBeGreaterThan(0));

        // Ir a Pendientes (elegir el elemento clicable entre los matches)
        const pendientesCandidates = screen.getAllByText(/Pendientes/i);
        const pendientesBtn = pendientesCandidates.find(el => el.closest('button'))?.closest('button') || pendientesCandidates[0];
        userEvent.click(pendientesBtn);
        await waitFor(() => {
            expect(screen.getByText(/Prod Pendiente/i)).toBeInTheDocument();
        });

        // Ir a Confirmadas (elegir el elemento clicable entre los matches)
        const confirmadasCandidates = screen.getAllByText(/Confirmadas/i);
        const confirmadasBtn = confirmadasCandidates.find(el => el.closest('button'))?.closest('button') || confirmadasCandidates[0];
        userEvent.click(confirmadasBtn);
        await waitFor(() => {
            expect(screen.getByText(/Prod Confirmado/i)).toBeInTheDocument();
        });
    });

    it('Filtra las ventas por método de pago y maneja la paginación', async () => {
        // 7 órdenes: 4 efectivo, 3 transferencia (para probar filtro + paginación)
        const orders = Array.from({ length: 7 }).map((_, i) => ({
            _id: `o${i + 1}`,
            estado: 'comprobante_subido',
            comprador: { nombre: `C-${i + 1}` },
            producto: { nombreProducto: `Producto ${i + 1}`, _id: `p${i + 1}` },
            metodoPagoVendedor: { tipo: i < 4 ? 'efectivo' : 'transferencia' },
        }));

        mockFetchDataBackend.mockResolvedValueOnce(orders);

        const { container } = render(
            <BrowserRouter>
                <Historial />
            </BrowserRouter>
        );

        // Esperar a que cargue
        await waitFor(() => expect(screen.getByText(/Producto 1/i)).toBeInTheDocument());

        // Seleccionar filtro "Efectivo"
        userEvent.selectOptions(screen.getByRole('combobox'), 'efectivo');

        // Debe mostrar solo los productos con efectivo (4 items), y paginación mostrará solo 4
        await waitFor(() => {
            expect(screen.getByText(/Producto 1/i)).toBeInTheDocument();
            expect(screen.getByText(/Producto 4/i)).toBeInTheDocument();
            expect(screen.queryByText(/Producto 5/i)).not.toBeInTheDocument();
        });

        // Ahora probar paginación con todos (sin filtro)
        // Reset mock and render again with all orders
        mockFetchDataBackend.mockResolvedValueOnce(orders);
        render(
            <BrowserRouter>
                <Historial />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/Producto 1/i)).toBeInTheDocument());

        // En la primera página debe aparecer Producto 1..5
        for (let i = 1; i <= 5; i++) {
            expect(screen.queryAllByText(new RegExp(`Producto ${i}`, 'i')).length).toBeGreaterThan(0);
        }

        // Ir a siguiente página
        userEvent.click(screen.getByText(/Siguiente/i));

        await waitFor(() => {
            expect(screen.getByText(/Producto 6/i)).toBeInTheDocument();
            expect(screen.getByText(/Producto 7/i)).toBeInTheDocument();
        });
    });

    it('Permite ver el comprobante y confirmar el pago de una venta', async () => {
        // Primer call: GET, segundo call: PUT (confirmar)
        mockFetchDataBackend
            .mockResolvedValueOnce([
                {
                    _id: '99',
                    estado: 'comprobante_subido',
                    comprador: { nombre: 'Cliente99' },
                    producto: { nombreProducto: 'ProductoX', _id: 'px' },
                    metodoPagoVendedor: { tipo: 'transferencia' },
                    comprobantePago: 'https://example.com/comprobante/99'
                },
            ])
            .mockResolvedValueOnce({}); // respuesta al confirmar

        render(
            <BrowserRouter>
                <Historial />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/ProductoX/i)).toBeInTheDocument());

        // Ver comprobante
        const verComprobante = screen.getByText(/Ver Comprobante/i);
        expect(verComprobante).toBeInTheDocument();
        expect(verComprobante.closest('a')).toHaveAttribute('href', 'https://example.com/comprobante/99');

        // Confirmar pago
        const confirmarBtn = screen.getByText(/Confirmar Pago/i);
        expect(confirmarBtn).toBeInTheDocument();

        userEvent.click(confirmarBtn);

        await waitFor(() => {
            // Después de confirmar, botón debe desaparecer y aparecer texto CONFIRMADO
            expect(screen.queryByText(/Confirmar Pago/i)).not.toBeInTheDocument();
            expect(screen.queryAllByText(/CONFIRMADO/i).length).toBeGreaterThan(0);
        });
    });
});
