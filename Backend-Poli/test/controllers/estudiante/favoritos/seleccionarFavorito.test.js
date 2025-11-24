import { seleccionarFavorito } from '../../../../src/controllers/estudiante/favoritosController.js';
import Estudiante from '../../../../src/models/Estudiante.js';

jest.mock('../../../../src/controllers/estudiante/recomendacionesController.js', () => ({
  generarYEnviarRecomendaciones: jest.fn().mockResolvedValue(true)
}));
jest.mock('../../../../src/models/Estudiante.js');

describe('Estudiante - seleccionarFavorito', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, estudianteBDD: { _id: 'est123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería agregar producto a favoritos (éxito)', async () => {
    req.params.id = '507f1f77bcf86cd799439020';
    const mockEstudiante = { _id: 'est123', favoritos: [], save: jest.fn().mockResolvedValue(true) };
    Estudiante.findById = jest.fn().mockResolvedValue(mockEstudiante);

    await seleccionarFavorito(req, res);

    expect(mockEstudiante.favoritos).toHaveLength(1);
    expect(mockEstudiante.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Producto agregado a favoritos' }));
  });

  it('Debería remover producto de favoritos (éxito)', async () => {
    req.params.id = '507f1f77bcf86cd799439021';
    const mockEstudiante = { _id: 'est123', favoritos: ['507f1f77bcf86cd799439021'], findIndex: () => 0, splice: jest.fn(), save: jest.fn().mockResolvedValue(true) };
    mockEstudiante.favoritos.findIndex = jest.fn().mockReturnValue(0);
    mockEstudiante.favoritos.splice = jest.fn();
    
    Estudiante.findById = jest.fn().mockResolvedValue(mockEstudiante);

    await seleccionarFavorito(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Producto removido de favoritos' }));
  });

  it('Debería rechazar ID de producto inválido (validación)', async () => {
    req.params.id = 'invalid';

    await seleccionarFavorito(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID de producto inválido' });
  });

  it('Debería manejar estudiante no encontrado (validación)', async () => {
    req.params.id = '507f1f77bcf86cd799439022';
    Estudiante.findById = jest.fn().mockResolvedValue(null);

    await seleccionarFavorito(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Estudiante no encontrado' });
  });

  it('Debería manejar error del sistema al actualizar favorito (sistema)', async () => {
    req.params.id = '507f1f77bcf86cd799439023';
    Estudiante.findById = jest.fn().mockRejectedValue(new Error('DB error'));

    await seleccionarFavorito(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error actualizando favoritos' }));
  });
});
