import { verProductoPorId } from '../../../../src/controllers/estudiante/categoriaProductoController.js';
import Producto from '../../../../src/models/Producto.js';

jest.mock('../../../../src/models/Producto.js');

describe('Estudiante - verProductoPorId', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería retornar producto por ID válido (éxito)', async () => {
    req.params.id = '507f1f77bcf86cd799439011';
    const mockProducto = { _id: req.params.id, nombreProducto: 'Test' };
    
    Producto.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockProducto)
        })
      })
    });

    await verProductoPorId(req, res);

    expect(Producto.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProducto);
  });

  it('Debería rechazar ID inválido (validación)', async () => {
    req.params.id = 'invalid-id';

    await verProductoPorId(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID de producto inválido' });
  });

  it('Debería retornar 404 si producto no existe (validación)', async () => {
    req.params.id = '507f1f77bcf86cd799439012';
    
    Producto.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(null)
        })
      })
    });

    await verProductoPorId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto no encontrado o sin stock' });
  });

  it('Debería manejar error del sistema al obtener producto (sistema)', async () => {
    req.params.id = '507f1f77bcf86cd799439013';
    
    Producto.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockRejectedValue(new Error('DB error'))
        })
      })
    });

    await verProductoPorId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error obteniendo producto' }));
  });
});
