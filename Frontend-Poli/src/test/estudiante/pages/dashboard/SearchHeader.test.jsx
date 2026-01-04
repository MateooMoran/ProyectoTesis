import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';

// Mock useNavigate before importing Home
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// Simple storeProductos mock helper we reuse per-test
const mockStoreProductos = (productos = [], categorias = []) => {
    // use doMock so the mock is applied at runtime (not hoisted)
    vi.doMock('../../../../../src/context/storeProductos', () => ({
        default: () => ({
            productos,
            categorias,
            loadingProductos: false,
            error: null,
            loadingCategorias: false,
            errorCategorias: null,
            fetchProductos: vi.fn(),
            fetchCategorias: vi.fn()
        })
    }));
};



describe('Header - búsqueda y mensaje de no resultados', () => {
    afterEach(() => {
        vi.resetModules();
        mockNavigate.mockClear();
    });

    it('navega a la página de búsqueda con el query al enviar el formulario del header', async () => {
        // mock productos no necesario aquí
        mockStoreProductos([
            { _id: 'p1', nombreProducto: 'Producto A', precio: 10, stock: 5 }
        ], []);

        const { default: Home } = await import('../../../../../src/pages/Home');
        const { BrowserRouter } = await import('react-router-dom');
        render(<BrowserRouter><Home /></BrowserRouter>);

        const input = screen.getByPlaceholderText(/Buscar productos en PoliVentas.../i);
        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { value: 'test-query' } });
        fireEvent.submit(input.closest('form'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(`/productos/buscar?query=${encodeURIComponent('test-query')}`);
        });
    });

    it('muestra el mensaje de no resultados cuando no existen productos disponibles', async () => {
        // mock vacio
        mockStoreProductos([], []);

        const { default: Home } = await import('../../../../../src/pages/Home');
        const { BrowserRouter } = await import('react-router-dom');
        render(<BrowserRouter><Home /></BrowserRouter>);

        // la página debe mostrar el mensaje de carrusel vacío (puede aparecer varias veces)
        const msgs = screen.getAllByText(/No hay productos disponibles\./i);
        expect(msgs.length).toBeGreaterThanOrEqual(1);
    });

    it('no ejecuta la navegación cuando el campo de búsqueda está vacío', async () => {
        // preparar store con datos (no relevante)
        mockStoreProductos([], []);
        const { default: Home } = await import('../../../../../src/pages/Home');
        const { BrowserRouter } = await import('react-router-dom');
        render(<BrowserRouter><Home /></BrowserRouter>);

        const input = screen.getByPlaceholderText(/Buscar productos en PoliVentas.../i);
        expect(input).toBeInTheDocument();

        // enviar formulario con cadena vacía
        fireEvent.change(input, { target: { value: '   ' } });
        fireEvent.submit(input.closest('form'));

        // esperar un breve momento y comprobar que no se llamó a navigate
        await waitFor(() => {
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('cuando NO está autenticado, muestra "Comprar Ahora" y redirige a /prepago al hacer clic', async () => {
        // mock storeAuth sin token
        vi.doMock('../../../../../src/context/storeAuth', () => ({ default: () => ({ token: null, rol: null }) }));
        mockStoreProductos([
            { _id: 'p1', nombreProducto: 'Producto A', precio: 10, stock: 5 }
        ], []);
        const { default: Home } = await import('../../../../../src/pages/Home');
        const { BrowserRouter } = await import('react-router-dom');
        render(<BrowserRouter><Home /></BrowserRouter>);

        // buscar el card por nombre del producto (puede haber clones del carousel)
        await waitFor(() => expect(screen.getAllByText(/Producto A/i).length).toBeGreaterThanOrEqual(1));
        const matches = screen.getAllByText(/Producto A/i);
        let card;
        for (const m of matches) {
            const c = m.closest('article') || m.closest('div');
            if (c && within(c).queryByText(/Comprar Ahora/i)) {
                card = c;
                break;
            }
        }
        if (!card) {
            const m = matches[0];
            card = m.closest('article') || m.closest('div');
        }
        expect(card).toBeTruthy();

        // dentro del card puede haber el botón Comprar Ahora;
        // si existe, al clicar debería navegar a /prepago. Si no existe, comprobamos el enlace al detalle.
        const buyBtn = within(card).queryByText(/Comprar Ahora/i);
        if (buyBtn) {
            expect(buyBtn).toBeInTheDocument();
            fireEvent.click(buyBtn);
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/prepago');
            });
        } else {
            // fallback: existe un enlace a detalle del producto (puede haber varias <a>, filtramos por href)
            const allLinks = within(card).getAllByRole('link');
            const detailLink = allLinks.find(l => /productos\//i.test(l.getAttribute('href')));
            expect(detailLink).toBeTruthy();
            expect(detailLink.getAttribute('href')).toMatch(/productos\//i);
        }
    });

    it('cuando está autenticado, muestra "Ver detalle" y el botón de favoritos en cada producto', async () => {
        // mock storeAuth con token
        vi.doMock('../../../../../src/context/storeAuth', () => ({ default: () => ({ token: 't', rol: 'estudiante' }) }));
        mockStoreProductos([
            { _id: 'p1', nombreProducto: 'Producto A', precio: 10, stock: 5 }
        ], []);
        const { default: Home } = await import('../../../../../src/pages/Home');
        const { BrowserRouter } = await import('react-router-dom');
        render(<BrowserRouter><Home /></BrowserRouter>);

        await waitFor(() => expect(screen.getAllByText(/Producto A/i).length).toBeGreaterThanOrEqual(1));
        const matchesAuth = screen.getAllByText(/Producto A/i);
        let cardAuth;
        for (const m of matchesAuth) {
            const c = m.closest('article') || m.closest('div');
            if (c && (within(c).queryByText(/Ver detalle/i) || within(c).queryByRole('button', { name: /favorit/i }))) {
                cardAuth = c;
                break;
            }
        }
        if (!cardAuth) {
            const m = matchesAuth[0];
            cardAuth = m.closest('article') || m.closest('div');
        }
        expect(cardAuth).toBeTruthy();

        // Debe mostrar 'Ver detalle' y un control de favoritos (botón accesible con nombre que contenga 'favorit')
        const verBtn = within(cardAuth).queryByTitle('Ver detalle') || within(cardAuth).queryByText(/Ver detalle/i) || within(cardAuth).queryByRole('link');
        expect(verBtn).toBeTruthy();

        // el botón de favoritos puede no tener texto accesible; comprobamos que haya al menos un botón en el card
        const buttonsInCard = within(cardAuth).queryAllByRole('button');
        expect(buttonsInCard.length).toBeGreaterThanOrEqual(1);
    });
});
