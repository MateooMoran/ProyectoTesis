import { verCategorias } from '../../../../src/controllers/estudiante/categoriaProductoController.js';
import Categoria from '../../../../src/models/Categoria.js';

jest.mock('../../../../src/models/Categoria.js');

describe('Estudiante - verCategorias', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería retornar todas las categorías (éxito)', async () => {
    const mockCategorias = [{ _id: 'c1', nombreCategoria: 'Ropa' }];
    Categoria.find = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(mockCategorias) });

    await verCategorias(req, res);

    expect(Categoria.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockCategorias);
  });

  it('Debería manejar error del sistema al obtener categorías (sistema)', async () => {
    Categoria.find = jest.fn().mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('DB error')) });

    await verCategorias(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error obteniendo categorías' }));
  });
});
