import { visualizarResenasProducto } from '../../../../src/controllers/estudiante/resenaController.js';
import Resena from '../../../../src/models/Resena.js';
import Producto from '../../../../src/models/Producto.js';

jest.mock('../../../../src/models/Resena.js');
jest.mock('../../../../src/models/Producto.js');

describe('Estudiante - visualizarResenasProducto', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería retornar reseñas de un producto (éxito)', async () => {
    req.params.productoId = '507f1f77bcf86cd799439060';

    const mockResenas = [{ _id: 'r1', estrellas: 5 }];
    const mockProducto = { promedioCalificacion: 5, totalResenas: 1, distribucionEstrellas: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 } };

    Resena.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockResenas)
        })
      })
    });
    Producto.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(mockProducto) });

    await visualizarResenasProducto(req, res);

    expect(Resena.find).toHaveBeenCalledWith({ producto: req.params.productoId });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalResenas: 1, resenas: mockResenas }));
  });

  it('Debería rechazar ID de producto inválido (validación)', async () => {
    req.params.productoId = 'invalid';

    await visualizarResenasProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID de producto no válido' });
  });

  it('Debería rechazar si producto no encontrado (validación)', async () => {
    req.params.productoId = '507f1f77bcf86cd799439061';

    Resena.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([])
        })
      })
    });
    Producto.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await visualizarResenasProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto no encontrado' });
  });

  it('Debería manejar error del sistema al obtener reseñas (sistema)', async () => {
    req.params.productoId = '507f1f77bcf86cd799439062';

    Resena.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error('DB error'))
        })
      })
    });

    await visualizarResenasProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error obteniendo reseñas' }));
  });
});
