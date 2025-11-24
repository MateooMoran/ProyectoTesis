import { eliminarProducto } from '../../../../src/controllers/vendedor/productoController.js';
import Producto from '../../../../src/models/Producto.js';
import Orden from '../../../../src/models/Orden.js';

jest.mock('../../../../src/models/Producto.js');
jest.mock('../../../../src/models/Orden.js');

describe('Vendedor - Eliminar Producto', () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: { id: '507f1f77bcf86cd799439011' }, estudianteBDD: { _id: 'vend1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería rechazar ID inválido (validación)', async () => {
    req.params.id = 'invalid-id';
    await eliminarProducto(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID de producto inválido' });
  });

  it('Debería retornar 404 si producto no encontrado (validación)', async () => {
    Producto.findOne = jest.fn().mockResolvedValue(null);
    await eliminarProducto(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto no encontrado o sin autorización para eliminar' });
  });

  it('Debería rechazar eliminación si existen órdenes no completadas (validación)', async () => {
    Producto.findOne = jest.fn().mockResolvedValue({ _id: req.params.id });
    Orden.find = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue([{ estado: 'pendiente' }]) });
    await eliminarProducto(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No se puede eliminar el producto porque existen órdenes no completadas' });
  });

  it('Debería eliminar producto correctamente (éxito)', async () => {
    const productoBD = { _id: req.params.id, save: jest.fn().mockResolvedValue(true), eliminadoPorVendedor: false };
    Producto.findOne = jest.fn().mockResolvedValue(productoBD);
    Orden.find = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue([{ estado: 'completada' }]) });

    await eliminarProducto(req, res);

    expect(productoBD.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto eliminado correctamente' });
  });

  it('Debería manejar error del servidor (500)', async () => {
    Producto.findOne = jest.fn().mockRejectedValue(new Error('DB fail'));
    await eliminarProducto(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
