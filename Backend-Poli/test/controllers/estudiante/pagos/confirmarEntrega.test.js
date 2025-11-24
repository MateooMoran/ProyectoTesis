import { confirmarEntrega } from '../../../../src/controllers/estudiante/ordenesController.js';
import Orden from '../../../../src/models/Orden.js';
import mongoose from 'mongoose';
import { crearNotificacionSocket } from '../../../../src/utils/notificaciones.js';

jest.mock('../../../../src/models/Orden.js');
jest.mock('../../../../src/utils/notificaciones.js');

describe('Estudiante - confirmarEntrega', () => {
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

  it('Debería confirmar entrega correctamente (éxito)', async () => {
    req.params.id = 'orden1';

    const mockOrden = { _id: 'orden1', comprador: { equals: jest.fn().mockReturnValue(true) }, estado: 'pago_confirmado_vendedor', vendedor: 'vend1', save: jest.fn().mockResolvedValue(true) };

    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrden) });
    crearNotificacionSocket.mockResolvedValue(true);

    await confirmarEntrega(req, res);

    expect(mockOrden.save).toHaveBeenCalled();
    expect(sessionMock.commitTransaction).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Entrega confirmada correctamente' }));
  });

  it('Debería rechazar orden no encontrada (validación)', async () => {
    req.params.id = 'orden2';
    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(null) });

    await confirmarEntrega(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Orden no encontrada' });
  });

  it('Debería rechazar si vendedor no confirmó pago (validación)', async () => {
    req.params.id = 'orden3';

    const mockOrden = { comprador: { equals: jest.fn().mockReturnValue(true) }, estado: 'comprobante_subido' };

    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrden) });

    await confirmarEntrega(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'El vendedor aún no ha confirmado el pago' });
  });

  it('Debería manejar error del sistema al confirmar entrega (sistema)', async () => {
    req.params.id = 'orden4';
    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockRejectedValue(new Error('DB error')) });

    await confirmarEntrega(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error confirmando entrega' }));
  });
});
