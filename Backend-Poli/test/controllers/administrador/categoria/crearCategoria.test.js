import { crearCategoria } from '../../../../src/controllers/administrador/categoriaController.js';
import Categoria from '../../../../src/models/Categoria.js';

jest.mock('../../../../src/models/Categoria.js');

describe('Administrador - Crear Categoría', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('Debería crear categoría correctamente (éxito)', async () => {
    req.body = { nombreCategoria: 'Electrónica' };

    Categoria.find = jest.fn().mockResolvedValue([]);
    // Mock constructor to provide save
    Categoria.mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue(true) }));

    await crearCategoria(req, res);

    expect(Categoria.find).toHaveBeenCalled();
    expect(Categoria).toHaveBeenCalledWith({ nombreCategoria: 'Electrónica' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Categoría creada correctamente' });
  });

  it('Debería rechazar campo vacío (validación)', async () => {
    req.body = { nombreCategoria: '   ' };

    await crearCategoria(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Debe llenar el campo' });
  });

  it('Debería rechazar categoría duplicada (validación)', async () => {
    req.body = { nombreCategoria: 'electronica' };

    const categoriasExistentes = [{ nombreCategoria: 'Electrónica' }];
    Categoria.find = jest.fn().mockResolvedValue(categoriasExistentes);

    await crearCategoria(req, res);

    expect(Categoria.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'La categoría ya existe' });
  });

  it('Debería manejar error del servidor al crear (500)', async () => {
    req.body = { nombreCategoria: 'Deportes' };

    Categoria.find = jest.fn().mockRejectedValue(new Error('DB error'));

    await crearCategoria(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error creando categoría' }));
  });
});
