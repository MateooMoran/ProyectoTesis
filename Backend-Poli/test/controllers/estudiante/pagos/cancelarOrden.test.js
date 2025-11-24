import { cancelarOrden } from '../../../../src/controllers/estudiante/ordenesController.js';
import Orden from '../../../../src/models/Orden.js';
import Producto from '../../../../src/models/Producto.js';
import mongoose from 'mongoose';
import { crearNotificacionSocket } from '../../../../src/utils/notificaciones.js';

jest.mock('../../../../src/models/Orden.js');
jest.mock('../../../../src/models/Producto.js');
jest.mock('../../../../src/utils/notificaciones.js');

describe('Estudiante - cancelarOrden', () => {
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

    req = { params: {}, estudianteBDD: { _id: 'est123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería cancelar orden correctamente (éxito)', async () => {
    req.params.id = 'orden1';

    const mockOrden = { _id: 'orden1', comprador: { equals: jest.fn().mockReturnValue(true) }, estado: 'pendiente_pago', producto: 'prod1', cantidad: 2, vendedor: 'vend1', save: jest.fn().mockResolvedValue(true) };

    const mockProducto = { _id: 'prod1', stock: 5, estado: 'disponible', save: jest.fn().mockResolvedValue(true) };

    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrden) });
    Orden.countDocuments = jest.fn().mockResolvedValue(1);
    Producto.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockProducto) });
    crearNotificacionSocket.mockResolvedValue(true);

    await cancelarOrden(req, res);

    expect(mockOrden.save).toHaveBeenCalled();
    expect(mockProducto.save).toHaveBeenCalled();
    expect(sessionMock.commitTransaction).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Orden cancelada correctamente' }));
  });

  it('Debería rechazar orden no encontrada (validación)', async () => {
    req.params.id = 'orden2';
    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(null) });

    await cancelarOrden(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Orden no encontrada' });
  });

  it('Debería rechazar cancelación si estado no permitido (validación)', async () => {
    req.params.id = 'orden3';

    const mockOrden = { comprador: { equals: jest.fn().mockReturnValue(true) }, estado: 'completada' };

    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrden) });

    await cancelarOrden(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Solo se pueden cancelar órdenes en estado pendiente de pago o con comprobante subido' });
  });

  it('Debería manejar error del sistema al cancelar orden (sistema)', async () => {
    req.params.id = 'orden4';
    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockRejectedValue(new Error('DB error')) });

    await cancelarOrden(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error cancelando orden' }));
  });
});
