import { verProductos } from '../../../../src/controllers/estudiante/categoriaProductoController.js';
import Producto from '../../../../src/models/Producto.js';

jest.mock('../../../../src/models/Producto.js');

describe('Estudiante - verProductos', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería retornar todos los productos disponibles (éxito)', async () => {
    const mockProductos = [{ _id: 'p1', nombreProducto: 'Producto 1' }];
    
    Producto.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockProductos)
          })
        })
      })
    });

    await verProductos(req, res);

    expect(Producto.find).toHaveBeenCalledWith({ estado: 'disponible', stock: { $gt: 0 }, activo: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProductos);
  });

  it('Debería manejar error del sistema al obtener productos (sistema)', async () => {
    Producto.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error('DB error'))
          })
        })
      })
    });

    await verProductos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error obteniendo productos' }));
  });
});
