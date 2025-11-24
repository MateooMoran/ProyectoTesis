import { buscarProductos } from '../../../../src/controllers/estudiante/categoriaProductoController.js';
import Producto from '../../../../src/models/Producto.js';

jest.mock('../../../../src/models/Producto.js');

describe('Estudiante - buscarProductos', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería retornar productos al buscar con query válido (éxito)', async () => {
    req.query.query = 'camisa';
    const mockProductos = [{ _id: 'p1', nombreProducto: 'Camisa' }];
    
    Producto.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProductos)
      })
    });

    await buscarProductos(req, res);

    expect(Producto.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProductos);
  });

  it('Debería rechazar búsqueda sin query (validación)', async () => {
    req.query.query = undefined;

    await buscarProductos(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Consulta de búsqueda requerida' });
  });

  it('Debería retornar 404 si no hay resultados (validación)', async () => {
    req.query.query = 'inexistente';
    
    Producto.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      })
    });

    await buscarProductos(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Sin resultados para "inexistente"' });
  });

  it('Debería manejar error del sistema al buscar productos (sistema)', async () => {
    req.query.query = 'test';
    
    Producto.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('DB error'))
      })
    });

    await buscarProductos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error buscando productos' }));
  });
});
