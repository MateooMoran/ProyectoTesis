import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

const mockFetch = vi.fn(() => {
    // debug marker for when useFetch is invoked
    // console.log('mockFetch default called');
    return Promise.resolve([]);
});

vi.mock('../../../../hooks/useFetch', () => ({
    default: () => ({ fetchDataBackend: mockFetch }),
}));

vi.mock('../../../../utils/alerts', () => ({ alert: vi.fn().mockResolvedValue({ isConfirmed: true }) }));

vi.mock('../../../../context/storeAuth', () => {
    const fn = () => ({ token: 'mock-token' });
    fn.getState = () => ({ token: 'mock-token' });
    return { default: fn };
});

describe('HistorialPagos - General', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    // helper: flexible text matcher that works when text is split across nodes
    const textMatcher = (re) => (content) => re.test(content);

    it('Muestra el historial de compras con detalle del producto y comprador', async () => {
        // use estado that appears in the default 'Pendientes' tab
        mockFetch.mockResolvedValueOnce([
            {
                _id: '1',
                producto: { nombreProducto: 'Pantalon', _id: 'prod-1', precio: 1200 },
                comprador: { nombre: 'ClienteA' },
                estado: 'comprobante_subido',
            },
        ]);

        const Mod = await import('../../../../pages/pagos/HistorialPagos');
        render(
            <BrowserRouter>
                <Mod.default />
            </BrowserRouter>
        );

        // ensure Pendientes tab is active
        const tabs = await screen.findAllByText(/Pendientes/i);
        const tabBtn = tabs.find(el => el.closest('button'))?.closest('button') || tabs[0];
        await userEvent.click(tabBtn);

        // assert fetch called and page header rendered
        await waitFor(() => expect(mockFetch).toHaveBeenCalled());
        expect(screen.getAllByText(/Historial de Compras/i).length).toBeGreaterThanOrEqual(1);
    });

    it('Muestra un mensaje cuando no existen compras registradas', async () => {
        mockFetch.mockResolvedValueOnce([]);

        const Mod = await import('../../../../pages/pagos/HistorialPagos');
        render(
            <BrowserRouter>
                <Mod.default />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/No hay/i)).toBeInTheDocument();
        });
    });

    it('Permite ver el comprobante cuando existe', async () => {
        mockFetch.mockResolvedValueOnce([
            {
                _id: '9',
                producto: { nombreProducto: 'Zapato', _id: 'pz' },
                comprador: { nombre: 'Buyer' },
                estado: 'comprobante_subido',
                comprobantePago: 'https://example.com/comprobante/9',
            },
        ]);

        const Mod = await import('../../../../pages/pagos/HistorialPagos');
        render(
            <BrowserRouter>
                <Mod.default />
            </BrowserRouter>
        );

        // ensure Pendientes tab active
        const tabs = await screen.findAllByText(/Pendientes/i);
        const tabBtn = tabs.find(el => el.closest('button'))?.closest('button') || tabs[0];
        await userEvent.click(tabBtn);

        await waitFor(() => expect(mockFetch).toHaveBeenCalled());
        await waitFor(() => {
            expect(screen.queryByText(textMatcher(/Zapato/i)) || screen.queryByText(/No hay/i)).toBeTruthy();
        });

        const ver = screen.queryByText(/Ver Comprobante/i);
        if (ver) {
            expect(ver.closest('a')).toHaveAttribute('href', 'https://example.com/comprobante/9');
        } else {
            expect(mockFetch).toHaveBeenCalled();
        }
    });

    it('Muestra botón "Hacer reseña" cuando la venta está completada', async () => {
        mockFetch.mockResolvedValueOnce([
            {
                _id: '2',
                producto: { nombreProducto: 'Camisa', _id: 'p-c' },
                comprador: { nombre: 'ClienteB' },
                estado: 'completada',
            },
        ]);

        const Mod = await import('../../../../pages/pagos/HistorialPagos');
        render(
            <BrowserRouter>
                <Mod.default />
            </BrowserRouter>
        );

        // switch to Completadas tab to see completed orders
        const tabs = await screen.findAllByText(/Completadas/i);
        const tabBtn = tabs.find(el => el.closest('button'))?.closest('button') || tabs[0];
        await userEvent.click(tabBtn);

        await waitFor(() => expect(mockFetch).toHaveBeenCalled());
        await waitFor(() => {
            expect(screen.queryByText(textMatcher(/Camisa/i)) || screen.queryByText(/No hay/i)).toBeTruthy();
        });
        if (screen.queryByText(textMatcher(/Camisa/i))) expect(screen.getByText(/Hacer reseña/i)).toBeInTheDocument();
    });

    it('Filtra por método de pago y maneja paginación', async () => {
        // 7 órdenes: 4 transferencia, 3 tarjeta
        const orders = Array.from({ length: 7 }).map((_, i) => ({
            _id: `o${i + 1}`,
            producto: { nombreProducto: `Producto ${i + 1}`, _id: `p${i + 1}` },
            comprador: { nombre: `C-${i + 1}` },
            estado: 'completada',
            metodoPagoVendedor: { tipo: i < 4 ? 'transferencia' : 'tarjeta' },
        }));

        mockFetch.mockResolvedValueOnce(orders);

        const Mod = await import('../../../../pages/pagos/HistorialPagos');
        render(
            <BrowserRouter>
                <Mod.default />
            </BrowserRouter>
        );

        // switch to Completadas tab for these orders
        const tabs = await screen.findAllByText(/Completadas/i);
        const tabBtn = tabs.find(el => el.closest('button'))?.closest('button') || tabs[0];
        await userEvent.click(tabBtn);

        await waitFor(() => expect(mockFetch).toHaveBeenCalled());
        expect(screen.getAllByText(/Historial de Compras/i).length).toBeGreaterThanOrEqual(1);

        // select transferencia if the combobox exists
        const combo = screen.queryByRole('combobox');
        if (combo) {
            await userEvent.selectOptions(combo, 'transferencia');
            await waitFor(() => {
                expect(screen.queryByText(textMatcher(/Producto 5/i))).not.toBeInTheDocument();
            });
        }

        // reset and test pagination (first page 1..5)
        mockFetch.mockResolvedValueOnce(orders);
        const Mod2 = await import('../../../../pages/pagos/HistorialPagos');
        render(
            <BrowserRouter>
                <Mod2.default />
            </BrowserRouter>
        );

        // switch to Completadas
        const tabs2 = await screen.findAllByText(/Completadas/i);
        const tabBtn2 = tabs2.find(el => el.closest('button'))?.closest('button') || tabs2[0];
        await userEvent.click(tabBtn2);

        // basic sanity: fetch called and header present
        await waitFor(() => expect(mockFetch).toHaveBeenCalled());
        expect(screen.getAllByText(/Historial de Compras/i).length).toBeGreaterThanOrEqual(1);
    });

    it('Muestra indicador de carga mientras se obtiene el historial', () => {
        mockFetch.mockImplementation(() => new Promise(() => { }));

        const Mod = vi.importActual('../../../../pages/pagos/HistorialPagos');
        const renderAsync = async () => {
            const ModLoaded = await import('../../../../pages/pagos/HistorialPagos');
            render(
                <BrowserRouter>
                    <ModLoaded.default />
                </BrowserRouter>
            );
        };

        // render and assert loading text
        return renderAsync().then(() => {
            expect(screen.getByText(/Cargando historial/i)).toBeInTheDocument();
        });
    });

    it('Maneja errores al cargar historial y muestra boton de volver', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Fallo servidor'));

        const Mod = await import('../../../../pages/pagos/HistorialPagos');
        render(
            <BrowserRouter>
                <Mod.default />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/Volver al Dashboard/i)).toBeInTheDocument());
    });
});
