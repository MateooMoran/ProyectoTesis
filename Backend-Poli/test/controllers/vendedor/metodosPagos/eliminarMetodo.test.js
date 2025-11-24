import { eliminarMetodoPago } from '../../../../src/controllers/vendedor/metodoPagoController.js';
import MetodoPagoVendedor from '../../../../src/models/MetodoPagoVendedor.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

jest.mock('../../../../src/models/MetodoPagoVendedor.js');
jest.mock('cloudinary');

describe('Vendedor - Eliminar Método de Pago', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: { id: '507f1f77bcf86cd799439011' },
      estudianteBDD: { _id: 'vendedor123', rol: 'vendedor' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  it('Debería eliminar método sin imagen (éxito)', async () => {
    MetodoPagoVendedor.findOneAndDelete = jest.fn().mockResolvedValue({ _id: req.params.id });
    await eliminarMetodoPago(req, res);
    expect(MetodoPagoVendedor.findOneAndDelete).toHaveBeenCalledWith({ _id: req.params.id, vendedor: req.estudianteBDD._id });
    expect(res.json).toHaveBeenCalledWith({ msg: 'Método eliminado correctamente' });
  });

  it('Debería eliminar método con imagen y destruir en Cloudinary (éxito)', async () => {
    MetodoPagoVendedor.findOneAndDelete = jest.fn().mockResolvedValue({ _id: req.params.id, imagenID: 'img_1' });
    cloudinary.uploader.destroy = jest.fn().mockResolvedValue(true);

    await eliminarMetodoPago(req, res);

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('img_1');
    expect(res.json).toHaveBeenCalledWith({ msg: 'Método eliminado correctamente' });
  });

  it('Debería retornar 400 si id inválido (validación)', async () => {
    req.params.id = 'invalid-id';
    await eliminarMetodoPago(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('Debería retornar 404 si no existe (validación)', async () => {
    MetodoPagoVendedor.findOneAndDelete = jest.fn().mockResolvedValue(null);
    await eliminarMetodoPago(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('Debería manejar error del sistema (sistema)', async () => {
    MetodoPagoVendedor.findOneAndDelete = jest.fn().mockRejectedValue(new Error('DB error'));
    await eliminarMetodoPago(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
