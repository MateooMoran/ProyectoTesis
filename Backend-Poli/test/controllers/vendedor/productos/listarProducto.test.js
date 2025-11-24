import { listarProducto } from '../../../../src/controllers/vendedor/productoController.js';
import Producto from '../../../../src/models/Producto.js';

jest.mock('../../../../src/models/Producto.js');

describe('Vendedor - Listar Producto', () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { estudianteBDD: { _id: 'vend1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería listar productos correctamente (éxito)', async () => {
    const mockProductos = [{ _id: 'p1' }];
    Producto.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProductos),
    });

    await listarProducto(req, res);

    expect(Producto.find).toHaveBeenCalledWith({ vendedor: 'vend1', $or: [{ eliminadoPorVendedor: false }, { eliminadoPorVendedor: { $exists: false } }] });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProductos);
  });

  it('Debería devolver 404 si no hay productos (validación)', async () => {
    Producto.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    await listarProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No hay productos registrados' });
  });

  it('Debería manejar error del servidor (500)', async () => {
    Producto.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockRejectedValue(new Error('DB fail')),
    });

    await listarProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
