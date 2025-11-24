import { subirComprobante } from '../../../../src/controllers/estudiante/ordenesController.js';
import Orden from '../../../../src/models/Orden.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import { crearNotificacionSocket } from '../../../../src/utils/notificaciones.js';

jest.mock('../../../../src/models/Orden.js');
jest.mock('cloudinary');
jest.mock('fs', () => ({ promises: { unlink: jest.fn() } }));
jest.mock('../../../../src/utils/notificaciones.js');

describe('Estudiante - subirComprobante', () => {
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

    req = { params: {}, files: null, estudianteBDD: { _id: 'est123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería subir comprobante correctamente (éxito)', async () => {
    req.params.id = 'orden1';
    req.files = { comprobante: { mimetype: 'image/jpeg', tempFilePath: '/tmp/file.jpg' } };

    const mockOrden = { _id: 'orden1', comprador: { equals: jest.fn().mockReturnValue(true) }, estado: 'pendiente_pago', vendedor: 'vend1', save: jest.fn().mockResolvedValue(true) };

    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrden) });
    cloudinary.uploader.upload = jest.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/img.jpg' });
    fs.unlink = jest.fn().mockResolvedValue(true);
    crearNotificacionSocket.mockResolvedValue(true);

    await subirComprobante(req, res);

    expect(cloudinary.uploader.upload).toHaveBeenCalled();
    expect(mockOrden.save).toHaveBeenCalled();
    expect(sessionMock.commitTransaction).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Comprobante subido correctamente' }));
  });

  it('Debería rechazar orden no encontrada (validación)', async () => {
    req.params.id = 'orden2';
    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(null) });

    await subirComprobante(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Orden no encontrada' });
  });

  it('Debería rechazar si no hay archivo (validación)', async () => {
    req.params.id = 'orden3';
    req.files = null;

    const mockOrden = { comprador: { equals: jest.fn().mockReturnValue(true) }, estado: 'pendiente_pago' };
    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrden) });

    await subirComprobante(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Debe subir un comprobante de pago' });
  });

  it('Debería manejar error del sistema al subir comprobante (sistema)', async () => {
    req.params.id = 'orden4';
    Orden.findById = jest.fn().mockReturnValue({ session: jest.fn().mockRejectedValue(new Error('DB error')) });

    await subirComprobante(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error subiendo comprobante' }));
  });
});
