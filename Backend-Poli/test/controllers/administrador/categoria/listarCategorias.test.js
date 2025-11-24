import { listarCategorias } from '../../../../src/controllers/administrador/categoriaController.js';
import Categoria from '../../../../src/models/Categoria.js';

jest.mock('../../../../src/models/Categoria.js');

describe('Administrador - Listar Categorías', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('Debería listar categorías correctamente (éxito)', async () => {
    const mockCategorias = [
      { _id: '1', nombreCategoria: 'Electrónica' },
      { _id: '2', nombreCategoria: 'Ropa' },
    ];

    Categoria.find = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(mockCategorias) });

    await listarCategorias(req, res);

    expect(Categoria.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockCategorias);
  });

  it('Debería retornar array vacío si no hay categorías (validación esperada)', async () => {
    Categoria.find = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue([]) });

    await listarCategorias(req, res);

    expect(Categoria.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('Debería manejar error del servidor al listar (500)', async () => {
    Categoria.find = jest.fn().mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('DB failure')) });

    await listarCategorias(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error listando categorías' }));
  });
});
