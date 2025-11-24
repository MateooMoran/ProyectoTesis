import Orden from '../../../../src/models/Orden.js';
import Producto from '../../../../src/models/Producto.js';
import mongoose from 'mongoose';
import { crearNotificacionSocket } from '../../../../src/utils/notificaciones.js';

jest.mock('../../../../src/models/Orden.js');
jest.mock('../../../../src/models/Producto.js');
jest.mock('../../../../src/utils/notificaciones.js');

jest.mock('stripe', () => {
  const mockCreate = jest.fn();
  return jest.fn(() => ({ paymentIntents: { create: mockCreate } }));
});

import { procesarPagoTarjeta } from '../../../../src/controllers/estudiante/ordenesController.js';
import Stripe from 'stripe';

describe('Estudiante - procesarPagoTarjeta', () => {
  let req, res, sessionMock;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionMock = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(true),
      abortTransaction: jest.fn().mockResolvedValue(true),
      endSession: jest.fn()
    };
    jest.spyOn(mongoose, 'startSession').mockReturnValue(sessionMock);

    req = { body: {}, estudianteBDD: { _id: 'est123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería procesar pago con tarjeta correctamente (éxito)', async () => {
    req.body = { paymentMethodId: 'pm_123', ordenId: 'orden1' };

    const mockOrden = { _id: 'orden1', comprador: { equals: jest.fn().mockReturnValue(true) }, estado: 'pendiente_pago', total: 200, producto: 'prod1', cantidad: 2, vendedor: 'vend1', save: jest.fn().mockResolvedValue(true) };

    const mockProducto = { _id: 'prod1', vendidos: 0, save: jest.fn().mockResolvedValue(true) };

    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrden) });
    Producto.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockProducto) });
    const stripeInstance = new Stripe('test_key');
    stripeInstance.paymentIntents.create.mockResolvedValue({ id: 'pi_123', status: 'succeeded' });
    crearNotificacionSocket.mockResolvedValue(true);

    await procesarPagoTarjeta(req, res);

    expect(stripeInstance.paymentIntents.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 20000, currency: 'usd' }));
    expect(mockOrden.save).toHaveBeenCalled();
    expect(sessionMock.commitTransaction).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Pago con tarjeta procesado correctamente' }));
  });

  it('Debería rechazar orden no encontrada (validación)', async () => {
    req.body = { paymentMethodId: 'pm_123', ordenId: 'orden2' };
    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(null) });

    await procesarPagoTarjeta(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Orden no encontrada' });
  });

  it('Debería manejar error del sistema al procesar pago (sistema)', async () => {
    req.body = { paymentMethodId: 'pm_123', ordenId: 'orden3' };
    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockRejectedValue(new Error('DB error')) });

    await procesarPagoTarjeta(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error procesando pago con tarjeta' }));
  });
});
