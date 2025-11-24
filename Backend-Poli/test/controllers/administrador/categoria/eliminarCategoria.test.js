import { eliminarCategoria } from '../../../../src/controllers/administrador/categoriaController.js';
import Categoria from '../../../../src/models/Categoria.js';
import Producto from '../../../../src/models/Producto.js';

jest.mock('../../../../src/models/Categoria.js');
jest.mock('../../../../src/models/Producto.js');

describe('Administrador - Eliminar Categoría', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: { id: '507f1f77bcf86cd799439011' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('Debería eliminar categoría sin productos asociados (éxito)', async () => {
    const categoriaId = req.params.id;

    Producto.find = jest.fn().mockResolvedValue([]);
    Categoria.findByIdAndDelete = jest.fn().mockResolvedValue(true);

    await eliminarCategoria(req, res);

    expect(Producto.find).toHaveBeenCalledWith({ categoria: categoriaId });
    expect(Categoria.findByIdAndDelete).toHaveBeenCalledWith(categoriaId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Categoría eliminada correctamente' });
  });

  it('Debería rechazar ID inválido (validación)', async () => {
    req.params.id = 'invalid-id';

    await eliminarCategoria(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID inválido' });
  });

  it('Debería rechazar eliminación si hay productos asociados (validación)', async () => {
    Producto.find = jest.fn().mockResolvedValue([ { _id: 'p1' } ]);

    await eliminarCategoria(req, res);

    expect(Producto.find).toHaveBeenCalledWith({ categoria: req.params.id });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No se puede eliminar, hay productos asociados' });
  });

  it('Debería retornar 404 si categoría no encontrada (validación)', async () => {
    Producto.find = jest.fn().mockResolvedValue([]);
    Categoria.findByIdAndDelete = jest.fn().mockResolvedValue(null);

    await eliminarCategoria(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Categoría no encontrada' });
  });

  it('Debería manejar error del sistema al eliminar (500)', async () => {
    Producto.find = jest.fn().mockRejectedValue(new Error('DB failure'));

    await eliminarCategoria(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error eliminando categoría' }));
  });
});
