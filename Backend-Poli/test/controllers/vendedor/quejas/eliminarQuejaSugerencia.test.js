import { eliminarQuejaSugerencia } from '../../../../src/controllers/estudiante/quejasController.js';
import QuejasSugerencias from '../../../../src/models/QuejasSugerencias.js';

jest.mock('../../../../src/models/QuejasSugerencias.js');

describe('Vendedor - eliminarQuejaSugerencia', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, estudianteBDD: { _id: 'vendedor123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería eliminar una queja correctamente (éxito)', async () => {
    req.params.id = 'q1';
    QuejasSugerencias.findById = jest.fn().mockResolvedValue({ _id: 'q1', estudiante: 'vendedor123', estado: 'pendiente', remove: jest.fn().mockResolvedValue(true) });

    await eliminarQuejaSugerencia(req, res);

    expect(QuejasSugerencias.findById).toHaveBeenCalledWith('q1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('Debería rechazar si la queja no existe (validación)', async () => {
    req.params.id = 'q2';
    QuejasSugerencias.findById = jest.fn().mockResolvedValue(null);

    await eliminarQuejaSugerencia(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('Debería rechazar si es de otro usuario (validación)', async () => {
    req.params.id = 'q3';
    QuejasSugerencias.findById = jest.fn().mockResolvedValue({ _id: 'q3', estudiante: 'otro', estado: 'pendiente' });

    await eliminarQuejaSugerencia(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('Debería rechazar eliminar si ya está resuelta (validación)', async () => {
    req.params.id = 'q4';
    QuejasSugerencias.findById = jest.fn().mockResolvedValue({ _id: 'q4', estudiante: 'vendedor123', estado: 'resuelto' });

    await eliminarQuejaSugerencia(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No se puede eliminar una queja/sugerencia ya resuelta' });
  });

  it('Debería manejar error del sistema al eliminar (sistema)', async () => {
    req.params.id = 'q5';
    QuejasSugerencias.findById = jest.fn().mockRejectedValue(new Error('DB error'));

    await eliminarQuejaSugerencia(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
