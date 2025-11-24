import { eliminarTodosFavoritos } from '../../../../src/controllers/estudiante/favoritosController.js';
import Estudiante from '../../../../src/models/Estudiante.js';

jest.mock('../../../../src/models/Estudiante.js');

describe('Estudiante - eliminarTodosFavoritos', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { estudianteBDD: { _id: 'est123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería eliminar todos los favoritos (éxito)', async () => {
    const mockEstudiante = { _id: 'est123', favoritos: ['p1', 'p2'], save: jest.fn().mockResolvedValue(true) };
    Estudiante.findById = jest.fn().mockResolvedValue(mockEstudiante);

    await eliminarTodosFavoritos(req, res);

    expect(mockEstudiante.favoritos).toEqual([]);
    expect(mockEstudiante.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Todos los productos fueron eliminados de favoritos' });
  });

  it('Debería manejar lista vacía sin error (éxito)', async () => {
    const mockEstudiante = { _id: 'est123', favoritos: [], save: jest.fn() };
    Estudiante.findById = jest.fn().mockResolvedValue(mockEstudiante);

    await eliminarTodosFavoritos(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No hay favoritos para eliminar' });
  });

  it('Debería manejar estudiante no encontrado (validación)', async () => {
    Estudiante.findById = jest.fn().mockResolvedValue(null);

    await eliminarTodosFavoritos(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Estudiante no encontrado' });
  });

  it('Debería manejar error del sistema al eliminar todos (sistema)', async () => {
    Estudiante.findById = jest.fn().mockRejectedValue(new Error('DB error'));

    await eliminarTodosFavoritos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Error eliminando todos los favoritos' });
  });
});
