import { confirmarPagoVenta } from '../../../../src/controllers/vendedor/ventasController.js';
import Orden from '../../../../src/models/Orden.js';
import Producto from '../../../../src/models/Producto.js';
import mongoose from 'mongoose';
import { crearNotificacionSocket } from '../../../../src/utils/notificaciones.js';

jest.mock('../../../../src/models/Orden.js');
jest.mock('../../../../src/models/Producto.js');
jest.mock('../../../../src/utils/notificaciones.js');

describe('Vendedor - confirmarPagoVenta', () => {
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

    req = { params: {}, estudianteBDD: { _id: 'vendedor123', rol: 'vendedor' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería confirmar pago correctamente (éxito)', async () => {
    req.params.id = 'orden123';

    const mockOrden = {
      _id: 'orden123',
      estado: 'comprobante_subido',
      producto: { _id: 'prod1' },
      cantidad: 2,
      comprador: 'comprador1',
      save: jest.fn().mockResolvedValue(true)
    };

    Orden.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrden) })
    });

    Producto.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
    crearNotificacionSocket.mockResolvedValue(true);

    await confirmarPagoVenta(req, res);

    expect(Orden.findOne).toHaveBeenCalled();
    expect(mockOrden.save).toHaveBeenCalledWith({ session: sessionMock });
    expect(Producto.findByIdAndUpdate).toHaveBeenCalledWith('prod1', { $inc: { vendidos: 2 } }, { session: sessionMock });
    expect(crearNotificacionSocket).toHaveBeenCalled();
    expect(sessionMock.commitTransaction).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Pago confirmado correctamente' }));
  });

  it('Debería retornar 404 si orden no encontrada (validación)', async () => {
    req.params.id = 'orden123';
    Orden.findOne = jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(null) }) });

    await confirmarPagoVenta(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('Debería retornar 400 si orden cancelada (validación)', async () => {
    req.params.id = 'orden123';
    const mockOrden = { estado: 'cancelada' };
    Orden.findOne = jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrden) }) });

    await confirmarPagoVenta(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('Debería retornar 400 si orden no en estado comprobante_subido (validación)', async () => {
    req.params.id = 'orden123';
    const mockOrden = { estado: 'pendiente' };
    Orden.findOne = jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrden) }) });

    await confirmarPagoVenta(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('Debería manejar error del sistema (sistema)', async () => {
    req.params.id = 'orden123';
    Orden.findOne = jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ session: jest.fn().mockRejectedValue(new Error('DB error')) }) });

    await confirmarPagoVenta(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
