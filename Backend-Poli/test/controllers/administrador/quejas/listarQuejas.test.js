import { listarTodasLasQuejasSugerencias } from '../../../../src/controllers/administrador/quejasController.js';
import QuejasSugerencias from '../../../../src/models/QuejasSugerencias.js';

jest.mock('../../../../src/models/QuejasSugerencias.js');

describe('Administrador - Listar Quejas y Sugerencias', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('Debería listar todas las quejas y sugerencias (éxito)', async () => {
    const mockQuejas = [
      { _id: '1', tipo: 'queja', mensaje: 'Problema con producto', estado: 'pendiente' },
      { _id: '2', tipo: 'sugerencia', mensaje: 'Mejorar interfaz', estado: 'pendiente' }
    ];

    QuejasSugerencias.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockQuejas),
      }),
    });

    await listarTodasLasQuejasSugerencias(req, res);

    expect(QuejasSugerencias.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockQuejas);
  });

  it('Debería retornar 404 cuando no hay quejas registradas (validación)', async () => {
    QuejasSugerencias.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      }),
    });

    await listarTodasLasQuejasSugerencias(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No hay quejas o sugerencias registradas' });
  });

  it('Debería manejar error del sistema al listar (500)', async () => {
    QuejasSugerencias.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      }),
    });

    await listarTodasLasQuejasSugerencias(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
