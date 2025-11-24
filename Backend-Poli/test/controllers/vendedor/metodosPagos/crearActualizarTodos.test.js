import {
  crearActualizarTransferencia,
  crearActualizarQR,
  crearActualizarLugarRetiro
} from '../../../../src/controllers/vendedor/metodoPagoController.js';
import MetodoPagoVendedor from '../../../../src/models/MetodoPagoVendedor.js';
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';

jest.mock('../../../../src/models/MetodoPagoVendedor.js');
jest.mock('cloudinary');
jest.mock('fs', () => ({
  promises: {
    unlink: jest.fn()
  }
}));

describe('Vendedor - Métodos de Pago - Crear/Actualizar', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {},
      body: {},
      estudianteBDD: { _id: 'vendedor123', rol: 'vendedor' },
      files: null,
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

    it('Debería crear transferencia correctamente (éxito)', async () => {
      req.body = { banco: 'Banco X', numeroCuenta: '123', titular: 'Juan', cedula: '098' };
      MetodoPagoVendedor.findOne = jest.fn().mockResolvedValue(null);
      MetodoPagoVendedor.prototype.save = jest.fn().mockResolvedValue(true);
      MetodoPagoVendedor.mockImplementation(() => ({ save: MetodoPagoVendedor.prototype.save, tipo: 'transferencia' }));

      await crearActualizarTransferencia(req, res);

      expect(MetodoPagoVendedor.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: expect.stringContaining('transferencia') }));
    });

    it('Debería crear método QR y limpiar temp (éxito)', async () => {
      req.files = { comprobante: { tempFilePath: '/tmp/qr.jpg', mimetype: 'image/jpeg' } };
      MetodoPagoVendedor.findOne = jest.fn().mockResolvedValue(null);
      cloudinary.uploader.upload = jest.fn().mockResolvedValue({ secure_url: 'https://cloud/qr.jpg', public_id: 'qr_1' });
      fs.unlink.mockResolvedValue(undefined);
      MetodoPagoVendedor.prototype.save = jest.fn().mockResolvedValue(true);
      MetodoPagoVendedor.mockImplementation(() => ({ save: MetodoPagoVendedor.prototype.save, tipo: 'qr' }));

      await crearActualizarQR(req, res);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith('/tmp/qr.jpg', expect.any(Object));
      expect(fs.unlink).toHaveBeenCalledWith('/tmp/qr.jpg');
      expect(MetodoPagoVendedor.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Debería crear/actualizar lugares de retiro correctamente (éxito)', async () => {
      req.body = { lugares: ['Campus Norte', 'Campus Sur'] };
      MetodoPagoVendedor.findOne = jest.fn().mockResolvedValue(null);
      MetodoPagoVendedor.prototype.save = jest.fn().mockResolvedValue(true);
      MetodoPagoVendedor.mockImplementation(() => ({ save: MetodoPagoVendedor.prototype.save, tipo: 'retiro' }));

      await crearActualizarLugarRetiro(req, res);

      expect(MetodoPagoVendedor.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: expect.stringContaining('Lugares de retiro') }));
    });

    it('Debería rechazar transferencia con datos incompletos (validación)', async () => {
      req.body = { banco: 'Banco X' }; // faltan campos
      await crearActualizarTransferencia(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Faltan datos para transferencia bancaria' });
    });

    it('Debería rechazar QR sin archivo (validación)', async () => {
      req.files = null;
      await crearActualizarQR(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Se requiere subir el QR' });
    });


    it('Debería manejar error DB en transferencia (sistema)', async () => {
      req.body = { banco: 'Banco X', numeroCuenta: '123', titular: 'Juan', cedula: '098' };
      MetodoPagoVendedor.findOne = jest.fn().mockRejectedValue(new Error('DB error'));
      await crearActualizarTransferencia(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: expect.stringContaining('Error') }));
    });

    it('Debería manejar error de Cloudinary al subir QR (sistema)', async () => {
      req.files = { comprobante: { tempFilePath: '/tmp/qr.jpg', mimetype: 'image/jpeg' } };
      MetodoPagoVendedor.findOne = jest.fn().mockResolvedValue(null);
      cloudinary.uploader.upload = jest.fn().mockRejectedValue(new Error('Cloud error'));
      fs.unlink.mockResolvedValue(undefined);

      await crearActualizarQR(req, res);

      // En caso de error de Cloudinary la limpieza de temp puede no ejecutarse; validar 500
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('Debería manejar error DB en retiro (sistema)', async () => {
      req.body = { lugares: ['A'] };
      MetodoPagoVendedor.findOne = jest.fn().mockRejectedValue(new Error('DB fail'));
      await crearActualizarLugarRetiro(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
});
