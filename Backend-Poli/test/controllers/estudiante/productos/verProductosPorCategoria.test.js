import { verProductosPorCategoria } from '../../../../src/controllers/estudiante/categoriaProductoController.js';
import Producto from '../../../../src/models/Producto.js';

jest.mock('../../../../src/models/Producto.js');

describe('Estudiante - verProductosPorCategoria', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería retornar productos por categoría (éxito)', async () => {
    req.params.id = '507f1f77bcf86cd799439014';
    const mockProductos = [{ _id: 'p1', nombreProducto: 'Producto Cat' }];
    
    Producto.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockProductos)
          })
        })
      })
    });

    await verProductosPorCategoria(req, res);

    expect(Producto.find).toHaveBeenCalledWith({ categoria: req.params.id, estado: 'disponible', stock: { $gt: 0 }, activo: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProductos);
  });

  it('Debería rechazar ID de categoría inválido (validación)', async () => {
    req.params.id = 'invalid';

    await verProductosPorCategoria(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID de categoría inválido' });
  });

  it('Debería manejar error del sistema al obtener productos por categoría (sistema)', async () => {
    req.params.id = '507f1f77bcf86cd799439015';
    
    Producto.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error('DB error'))
          })
        })
      })
    });

    await verProductosPorCategoria(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error obteniendo productos por categoría' }));
  });
});
