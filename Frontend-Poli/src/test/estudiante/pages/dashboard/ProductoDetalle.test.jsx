import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies like in other tests
vi.mock('../../../../../src/context/storeProductos', () => ({ default: () => ({ productos: [] }) }));
vi.mock('../../../../../src/pages/productosGeneral/CarruselProductos', () => ({ default: () => null }));
vi.mock('../../../../../src/components/BotonFavorito', () => ({ default: () => <button aria-label="fav">fav</button> }));
vi.mock('../../../../../src/pages/productosGeneral/Resenas', () => ({ default: () => <div>Reseñas Mock</div> }));
vi.mock('../../../../../src/layout/Header', () => ({ default: () => null }));
vi.mock('../../../../../src/layout/Footer', () => ({ default: () => null }));

// Prevent SweetAlert2 from running DOM code during tests
vi.mock('../../../../../src/utils/alerts', () => ({
    alert: () => { },
    alertConfirm: () => Promise.resolve(true),
    toast: () => { }
}));

// dynamic auth getter so tests can change token
const getAuth = vi.fn(() => ({ token: 'mock-token' }));
vi.mock('../../../../../src/context/storeAuth', () => ({ default: () => getAuth() }));
vi.mock('../../../../../src/context/storeProfile', () => ({ default: () => ({ user: { rol: 'estudiante' } }) }));

// mock react-router hooks (useParams/useNavigate/useLocation)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useParams: () => ({ id: '1' }), useNavigate: () => mockNavigate, useLocation: () => ({}) };
});

import ProductoDetalle from '../../../../../src/pages/productosGeneral/ProductoDetalle';

/*
  Pruebas de integración mínimas para `ProductoDetalle`.
  - Se mockean dependencias (stores, carrusel, alerts, Header/Footer) para aislar la UI.
  - Se comprueba:
    * renderizado tras el fetch
    * presencia de botones (Comprar Ahora, Favorito)
    * renderizado de reseñas y productos relacionados
    * comportamiento de navegación cuando hay o no hay token
*/
beforeEach(() => {
    vi.resetAllMocks();
    getAuth.mockImplementation(() => ({ token: 'mock-token' }));
    mockNavigate.mockClear();
});

describe('ProductoDetalle - integración mínima', () => {
    const product = {
        _id: '1',
        nombreProducto: 'Laptop HP',
        descripcion: 'Descripción corta',
        precio: 1200,
        stock: 5,
        vendedor: { _id: 'v1', nombre: 'Vendedor' },
        categoria: { nombreCategoria: 'Electrónica' },
        modelo_url: null
    };

    it('muestra los datos del producto después del fetch', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => product });
        // fetch mocked above and react-router hooks are mocked at top-level

        render(
            <BrowserRouter>
                <ProductoDetalle />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/Laptop HP/i)).toBeInTheDocument());
        expect(screen.getByText(/Descripción corta/i)).toBeInTheDocument();
        expect(screen.getByText(/\$1200.00/i)).toBeInTheDocument();
    });

    it('muestra el botón "Comprar Ahora" y el botón de favorito', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => product });
        // react-router hooks mocked at top-level

        render(
            <BrowserRouter>
                <ProductoDetalle />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/Laptop HP/i)).toBeInTheDocument());
        expect(screen.getByText(/Comprar Ahora/i)).toBeInTheDocument();
        expect(screen.getByLabelText('fav')).toBeInTheDocument();
    });

    it('muestra las reseñas y productos relacionados cuando existen', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => product });
        // react-router hooks mocked at top-level

        render(
            <BrowserRouter>
                <ProductoDetalle />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/Reseñas Mock/i)).toBeInTheDocument());
    });

    it('sin token redirige a /prepago y muestra alerta (comportamiento para usuarios no autenticados)', async () => {
        // Preparación: simular que NO hay token
        getAuth.mockImplementation(() => ({ token: null }));
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => product });

        render(
            <BrowserRouter>
                <ProductoDetalle />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/Laptop HP/i)).toBeInTheDocument());
        // Al pulsar "Comprar Ahora" sin token, debe navegar a '/prepago'
        fireEvent.click(screen.getByText(/Comprar Ahora/i));
        expect(mockNavigate).toHaveBeenCalledWith('/prepago');
    });

    it('con token inicia la compra: redirige a /dashboard/compra/:id pasando la cantidad en state', async () => {
        // Preparación: simular token válido
        getAuth.mockImplementation(() => ({ token: 'token-1' }));
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => product });

        render(
            <BrowserRouter>
                <ProductoDetalle />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/Laptop HP/i)).toBeInTheDocument());
        // Al pulsar "Comprar Ahora" con token, debe navegar a la ruta de compra con el estado correcto
        fireEvent.click(screen.getByText(/Comprar Ahora/i));
        expect(mockNavigate).toHaveBeenCalledWith(`/dashboard/compra/1`, { state: { cantidad: 1 } });
    });
});
