import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock layout pieces and heavy carousels to keep test fast and deterministic
vi.mock('../../../../../src/layout/Header', () => ({ default: () => <header>MockHeader</header> }));
vi.mock('../../../../../src/layout/Footer', () => ({ default: () => <footer>MockFooter</footer> }));

// Mock the main hero carousel to a simple identifiable node
vi.mock('../../../../../src/layout/CarruselBanner', () => ({ default: () => <div data-testid="hero-banner">Hero Banner Mock</div> }));

// Mock categorias carousel to render the passed categorias
vi.mock('../../../../../src/pages/productosGeneral/CarruselCategorias', () => ({
    default: ({ categorias = [] }) => (
        <div data-testid="categories-mock">
            {categorias.map((c) => <div key={c._id}>{c.nombreCategoria}</div>)}
        </div>
    )
}));

// Mock productos carousel to render product titles and a title prop
vi.mock('../../../../../src/pages/productosGeneral/CarruselProductos', () => ({
    default: ({ productos = [], title = '' }) => (
        <section data-testid={`products-${title}`}>
            <h2>{title}</h2>
            {productos.map(p => <div key={p._id}>{p.nombreProducto}</div>)}
        </section>
    )
}));

// Provide a simple storeProductos mock with sample products and categories
vi.mock('../../../../../src/context/storeProductos', () => ({
    default: () => ({
        productos: [
            { _id: 'p1', nombreProducto: 'Producto A', precio: 10, stock: 10 },
            { _id: 'p2', nombreProducto: 'Producto B', precio: 20, stock: 3 }
        ],
        categorias: [
            { _id: 'c1', nombreCategoria: 'Comida' },
            { _id: 'c2', nombreCategoria: 'Ropa' }
        ],
        loadingProductos: false,
        error: null,
        loadingCategorias: false,
        errorCategorias: null,
        fetchProductos: vi.fn(),
        fetchCategorias: vi.fn()
    })
}));

import Home from '../../../../../src/pages/Home';



describe('Home Principal - Pantalla Principal', () => {
    beforeEach(() => {
        // ensure DOM is clean
        document.body.innerHTML = '';
    });

    it('Renderiza el header y el footer correctamente', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        // Home renders its own header markup; ensure header element exists
        expect(document.querySelector('header')).toBeTruthy();
        expect(screen.getByText(/MockFooter/i)).toBeInTheDocument();
    });

    it('Muestra el banner principal, categorías y carruseles de productos', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        // Hero banner
        expect(screen.getByTestId('hero-banner')).toBeInTheDocument();

        // Categories
        const cats = screen.getByTestId('categories-mock');
        expect(cats).toBeInTheDocument();
        expect(screen.getByText(/Comida/)).toBeInTheDocument();
        expect(screen.getByText(/Ropa/)).toBeInTheDocument();

        // Product carousels titles
        expect(screen.getByText(/Descubre lo Nuevo/)).toBeInTheDocument();
        expect(screen.getByText(/Últimas Unidades/)).toBeInTheDocument();

        // Product items rendered by our mock (Producto B appears in two carousels)
        expect(screen.getByText(/Producto A/)).toBeInTheDocument();
        const bs = screen.getAllByText(/Producto B/);
        expect(bs.length).toBeGreaterThanOrEqual(1);
    });

    it('Contiene un elemento main para el área de contenido', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );
        expect(document.querySelector('main')).toBeTruthy();
    });

    it('El header aparece antes del main y el footer después en orden del documento', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        const footer = screen.getByText(/MockFooter/i);
        expect(header.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(main.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
});
