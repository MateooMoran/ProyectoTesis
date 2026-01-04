import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import ResumenCompra from '../../../../../src/pages/pagos/ResumenCompra';

describe('ResumenCompra component', () => {
    const producto = {
        _id: '1',
        nombreProducto: 'Producto Test',
        descripcion: 'Desc',
        precio: 100,
        stock: 3,
        vendedor: { nombre: 'Vendedor' },
        categoria: { nombreCategoria: 'Cat' }
    };

    it('Paso 1: renderiza el resumen con producto, cantidad y total', () => {
        render(
            <BrowserRouter>
                <ResumenCompra producto={producto} cantidad={2} total={(producto.precio * 2).toFixed(2)} currentStep={1} onCantidadChange={() => { }} />
            </BrowserRouter>
        );

        expect(screen.getByText(/Resumen de Compra/i)).toBeInTheDocument();
        expect(screen.getByText(/Producto Test/i)).toBeInTheDocument();
        expect(screen.getByText(/Total:/i)).toBeInTheDocument();
    });

    it('Paso 1: muestra la imagen y la categoría del producto cuando existen', () => {
        render(
            <BrowserRouter>
                <ResumenCompra producto={producto} cantidad={1} total={(producto.precio).toFixed(2)} currentStep={1} onCantidadChange={() => { }} />
            </BrowserRouter>
        );

        expect(screen.getByText(/Cat/i)).toBeInTheDocument();
    });

    it('Paso 1: muestra el input para modificar la cantidad', () => {
        render(
            <BrowserRouter>
                <ResumenCompra producto={producto} cantidad={1} total={(producto.precio).toFixed(2)} currentStep={1} onCantidadChange={() => { }} />
            </BrowserRouter>
        );
        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('Paso 1: muestra el precio unitario y el stock disponible', () => {
        render(
            <BrowserRouter>
                <ResumenCompra producto={producto} cantidad={1} total={(producto.precio).toFixed(2)} currentStep={1} onCantidadChange={() => { }} />
            </BrowserRouter>
        );
        expect(screen.getByText(/Stock disponible/i)).toBeInTheDocument();
        const prices = screen.getAllByText(/\$100.00/i);
        expect(prices.length).toBeGreaterThan(0);
    });

    it('Paso 2+: muestra la cantidad como texto cuando no se encuentra en el paso 1', () => {
        render(
            <BrowserRouter>
                <ResumenCompra producto={producto} cantidad={2} total={(producto.precio * 2).toFixed(2)} currentStep={2} onCantidadChange={() => { }} />
            </BrowserRouter>
        );
        // Verificar que en la fila "Cantidad" se muestre el número 2
        const filaCantidad = screen.getByText(/Cantidad:/i).closest('div');
        expect(filaCantidad).toBeTruthy();
        expect(filaCantidad).toHaveTextContent('2');
    });
});
