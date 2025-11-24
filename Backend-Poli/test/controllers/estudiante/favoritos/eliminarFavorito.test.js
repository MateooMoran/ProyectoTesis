import { eliminarFavorito } from '../../../../src/controllers/estudiante/favoritosController.js';
import Estudiante from '../../../../src/models/Estudiante.js';

jest.mock('../../../../src/models/Estudiante.js');

describe('Estudiante - eliminarFavorito', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, estudianteBDD: { _id: 'est123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería eliminar un favorito (éxito)', async () => {
    req.params.id = '507f1f77bcf86cd799439030';
    const mockEstudiante = { _id: 'est123', favoritos: ['507f1f77bcf86cd799439030'], save: jest.fn().mockResolvedValue(true) };
    mockEstudiante.favoritos.findIndex = jest.fn().mockReturnValue(0);
    mockEstudiante.favoritos.splice = jest.fn();
    
    Estudiante.findById = jest.fn().mockResolvedValue(mockEstudiante);

    await eliminarFavorito(req, res);

    expect(mockEstudiante.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Producto eliminado de favoritos' }));
  });

  it('Debería rechazar ID inválido (validación)', async () => {
    req.params.id = 'invalid';

    await eliminarFavorito(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID de producto inválido' });
  });

  it('Debería manejar producto no en favoritos (validación)', async () => {
    req.params.id = '507f1f77bcf86cd799439031';
    const mockEstudiante = { _id: 'est123', favoritos: [] };
    mockEstudiante.favoritos.findIndex = jest.fn().mockReturnValue(-1);
    
    Estudiante.findById = jest.fn().mockResolvedValue(mockEstudiante);

    await eliminarFavorito(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto no está en favoritos' });
  });

  it('Debería manejar error del sistema al eliminar favorito (sistema)', async () => {
    req.params.id = '507f1f77bcf86cd799439032';
    Estudiante.findById = jest.fn().mockRejectedValue(new Error('DB error'));

    await eliminarFavorito(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error eliminando favorito' }));
  });
});
