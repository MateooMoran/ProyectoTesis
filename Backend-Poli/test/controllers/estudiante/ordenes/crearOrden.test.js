import { crearOrden } from '../../../../src/controllers/estudiante/ordenesController.js';
import Orden from '../../../../src/models/Orden.js';
import Producto from '../../../../src/models/Producto.js';
import MetodoPagoVendedor from '../../../../src/models/MetodoPagoVendedor.js';
import mongoose from 'mongoose';
import { crearNotificacionSocket } from '../../../../src/utils/notificaciones.js';

jest.mock('../../../../src/models/Orden.js');
jest.mock('../../../../src/models/Producto.js');
jest.mock('../../../../src/models/MetodoPagoVendedor.js');
jest.mock('../../../../src/utils/notificaciones.js');

describe('Estudiante - crearOrden', () => {
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

  it('Debería crear orden correctamente (éxito)', async () => {
    req.body = { productoId: 'prod1', cantidad: 2, metodoPagoVendedorId: 'metodo1' };

    const mockProducto = { _id: 'prod1', stock: 10, activo: true, estado: 'disponible', precio: 100, vendedor: 'vend1', save: jest.fn().mockResolvedValue(true) };
    const mockMetodoPago = { _id: 'metodo1', tipo: 'transferencia', vendedor: 'vend1' };
    const mockOrden = { save: jest.fn().mockResolvedValue(true) };

    Producto.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockProducto) });
    MetodoPagoVendedor.findOne = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockMetodoPago) });
    Orden.mockImplementation(() => mockOrden);
    crearNotificacionSocket.mockResolvedValue(true);

    await crearOrden(req, res);

    expect(sessionMock.commitTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Orden creada exitosamente' }));
  });

  it('Debería rechazar producto no encontrado (validación)', async () => {
    req.body = { productoId: 'prod2', cantidad: 1, metodoPagoVendedorId: 'metodo1' };
    Producto.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(null) });

    await crearOrden(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto no encontrado' });
  });

  it('Debería rechazar stock insuficiente (validación)', async () => {
    req.body = { productoId: 'prod3', cantidad: 10, metodoPagoVendedorId: 'metodo1' };
    const mockProducto = { _id: 'prod3', stock: 5, activo: true, estado: 'disponible', precio: 50 };
    Producto.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(mockProducto) });

    await crearOrden(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Stock insuficiente. Solo hay 5 unidades disponibles' });
  });

  it('Debería manejar error del sistema al crear orden (sistema)', async () => {
    req.body = { productoId: 'prod4', cantidad: 1, metodoPagoVendedorId: 'metodo1' };
    Producto.findById = jest.fn().mockReturnValue({ session: jest.fn().mockRejectedValue(new Error('DB error')) });

    await crearOrden(req, res);

    expect(sessionMock.abortTransaction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error creando orden' }));
  });
});
