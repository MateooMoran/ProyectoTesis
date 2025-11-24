import { actualizarProducto } from '../../../../src/controllers/vendedor/productoController.js';
import Producto from '../../../../src/models/Producto.js';
import Categoria from '../../../../src/models/Categoria.js';

jest.mock('../../../../src/models/Producto.js');
jest.mock('../../../../src/models/Categoria.js');

describe('Vendedor - Actualizar Producto', () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: { id: '507f1f77bcf86cd799439011' }, body: {}, estudianteBDD: { _id: 'vend1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería actualizar producto correctamente (éxito)', async () => {
    const productoBD = { _id: req.params.id, vendedor: 'vend1', nombreProducto: 'Old', save: jest.fn().mockResolvedValue(true), stock: 1, estado: 'no disponible', activo: false };
    Producto.findOne = jest.fn().mockResolvedValue(productoBD);
    Producto.findOne.mockResolvedValue(productoBD);
    Producto.findOne.mockResolvedValue(productoBD);
    Producto.findOne.mockResolvedValue(productoBD);

    Categoria.findById = jest.fn().mockResolvedValue({ _id: 'cat1' });
    // nombre no cambia
    req.body = { precio: 100, stock: 2, categoria: 'cat1' };

    await actualizarProducto(req, res);

    expect(Producto.findOne).toHaveBeenCalledWith({ _id: req.params.id, vendedor: 'vend1' });
    expect(productoBD.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto actualizado correctamente' });
  });

  it('Debería retornar 400 si id inválido (validación)', async () => {
    req.params.id = 'invalid-id';
    await actualizarProducto(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('Debería retornar 403 si producto no encontrado o sin permisos (validación)', async () => {
    Producto.findOne = jest.fn().mockResolvedValue(null);
    await actualizarProducto(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto no encontrado o sin permisos' });
  });

  it('Debería rechazar nombre duplicado (validación)', async () => {
    const productoBD = { _id: req.params.id, vendedor: 'vend1', nombreProducto: 'Old', save: jest.fn().mockResolvedValue(true) };
    Producto.findOne = jest.fn().mockResolvedValue(productoBD);
    // Simular que existe producto con nuevo nombre
    Producto.findOne = jest.fn().mockResolvedValueOnce(productoBD).mockResolvedValueOnce({ _id: 'other' });
    Categoria.findById = jest.fn().mockResolvedValue({ _id: 'cat1' });
    req.body = { nombreProducto: 'NewName', categoria: 'cat1' };

    await actualizarProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Ya existe un producto con ese nombre' });
  });

  it('Debería manejar error del servidor (500)', async () => {
    Producto.findOne = jest.fn().mockRejectedValue(new Error('DB fail'));
    await actualizarProducto(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
