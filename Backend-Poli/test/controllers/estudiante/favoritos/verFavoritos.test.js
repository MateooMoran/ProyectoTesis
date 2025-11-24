import { verFavoritos } from '../../../../src/controllers/estudiante/favoritosController.js';
import Estudiante from '../../../../src/models/Estudiante.js';

jest.mock('../../../../src/models/Estudiante.js');

describe('Estudiante - verFavoritos', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { estudianteBDD: { _id: 'est123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería retornar lista de favoritos (éxito)', async () => {
    const mockEstudiante = { _id: 'est123', favoritos: [{ _id: 'p1', nombreProducto: 'Producto' }] };
    Estudiante.findById = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockEstudiante) });

    await verFavoritos(req, res);

    expect(Estudiante.findById).toHaveBeenCalledWith('est123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ favoritos: mockEstudiante.favoritos });
  });

  it('Debería manejar estudiante no encontrado (validación)', async () => {
    Estudiante.findById = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

    await verFavoritos(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Estudiante no encontrado' });
  });

  it('Debería manejar error del sistema al obtener favoritos (sistema)', async () => {
    Estudiante.findById = jest.fn().mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error('DB error')) });

    await verFavoritos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error obteniendo favoritos' }));
  });
});
