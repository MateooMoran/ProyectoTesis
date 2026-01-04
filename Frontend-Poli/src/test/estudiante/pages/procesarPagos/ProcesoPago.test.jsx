import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { Paso2LugarRetiro, Paso3MetodoPago, Paso4SubirComprobante } from '../../../../../src/pages/pagos/CompraDirectaComponents';

describe('Proceso de pago - pasos aislados', () => {
    it('Paso 2: muestra un mensaje cuando no existen lugares de retiro disponibles', () => {
        render(
            <BrowserRouter>
                <Paso2LugarRetiro lugares={[]} lugarRetiro={''} onRegresar={() => { }} onContinuar={() => { }} />
            </BrowserRouter>
        );
        expect(screen.getByText(/Lugar de Retiro No Disponible/i)).toBeInTheDocument();
    });

    it('Paso 2: renderiza las opciones de retiro cuando existen lugares disponibles', () => {
        render(
            <BrowserRouter>
                <Paso2LugarRetiro lugares={["Local A", "Local B"]} lugarRetiro={"Local A"} onRegresar={() => { }} onContinuar={() => { }} />
            </BrowserRouter>
        );
        expect(screen.getByText(/Lugar de Retiro/i)).toBeInTheDocument();
        expect(screen.getByText(/Local A/i)).toBeInTheDocument();
    });

    it('Paso 3: muestra los métodos de pago disponibles e incluye la opción de tarjeta', () => {
        const metodos = [
            { _id: 'm1', tipo: 'transferencia', banco: 'B', numeroCuenta: '123', titular: 'T', cedula: 'C' }
        ];
        const onSelect = jestOrVitestMock();
        render(
            <BrowserRouter>
                <Paso3MetodoPago metodosPago={metodos} metodoPagoSeleccionado={''} onSelectMetodo={() => { }} onContinuar={() => { }} onRegresar={() => { }} loading={false} tieneRetiro={true} />
            </BrowserRouter>
        );
        expect(screen.getByText(/Método de Pago/i)).toBeInTheDocument();
        expect(screen.getByText(/Transferencia Bancaria/i)).toBeInTheDocument();
        expect(screen.getByText(/Pagar con Tarjeta/i)).toBeInTheDocument();
    });

    it('Paso 3: al seleccionar la opción tarjeta llama a onSelectMetodo con "stripe"', () => {
        const metodos = [
            { _id: 'm1', tipo: 'transferencia', banco: 'B', numeroCuenta: '123', titular: 'T', cedula: 'C' }
        ];
        const onSelect = vi.fn();
        render(
            <BrowserRouter>
                <Paso3MetodoPago metodosPago={metodos} metodoPagoSeleccionado={''} onSelectMetodo={onSelect} onContinuar={() => { }} onRegresar={() => { }} loading={false} tieneRetiro={true} />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText(/Pagar con Tarjeta/i));
        expect(onSelect).toHaveBeenCalledWith('stripe');
    });

    it('Paso 4: requiere subir un comprobante cuando el método es transferencia bancaria', () => {
        const metodo = { tipo: 'transferencia', banco: 'B' };
        const mockSubmit = () => { };
        render(
            <BrowserRouter>
                <Paso4SubirComprobante metodoPagoElegido={metodo} total={'100.00'} archivoComprobante={null} onFileChange={() => { }} onSubmit={mockSubmit} onRegresar={() => { }} loading={false} />
            </BrowserRouter>
        );
        expect(screen.getByRole('heading', { name: /Subir Comprobante/i })).toBeInTheDocument();
        expect(screen.getByText(/Ningún archivo seleccionado/i)).toBeInTheDocument();
    });

    it('Paso 4: muestra el archivo seleccionado y habilita la confirmación del comprobante', () => {
        const metodo = { tipo: 'transferencia', banco: 'B' };
        const handleFile = jestOrVitestMock();
        render(
            <BrowserRouter>
                <Paso4SubirComprobante metodoPagoElegido={metodo} total={'100.00'} archivoComprobante={{ name: 'a.png' }} onFileChange={handleFile} onSubmit={() => { }} onRegresar={() => { }} loading={false} />
            </BrowserRouter>
        );
        expect(screen.getByText(/a.png/i)).toBeInTheDocument();
        expect(screen.getByText(/Confirmar y Subir Comprobante/i)).toBeInTheDocument();
    });
});

function jestOrVitestMock() {
    // helper to create a callable mock independent of test runner
    const fn = () => { };
    return fn;
}
