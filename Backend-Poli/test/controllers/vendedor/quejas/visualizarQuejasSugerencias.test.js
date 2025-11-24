import { visualizarQuejasSugerencias } from '../../../../src/controllers/estudiante/quejasController.js';
import QuejasSugerencias from '../../../../src/models/QuejasSugerencias.js';

jest.mock('../../../../src/models/QuejasSugerencias.js');

describe('Vendedor - visualizarQuejasSugerencias', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { estudianteBDD: { _id: 'vendedor123', rol: 'vendedor' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería retornar las quejas del usuario (éxito)', async () => {
    const mockQuejas = [ { _id: 'q1', titulo: 'X' } ];
    QuejasSugerencias.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(mockQuejas) });

    await visualizarQuejasSugerencias(req, res);

    expect(QuejasSugerencias.find).toHaveBeenCalledWith({ usuario: 'vendedor123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockQuejas);
  });

  it('Debería manejar error del sistema al obtener quejas (sistema)', async () => {
    QuejasSugerencias.find = jest.fn().mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('DB error')) });

    await visualizarQuejasSugerencias(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Error obteniendo quejas/sugerencias' });
  });

  it('Debería retornar 404 si no hay registros (validación)', async () => {
    QuejasSugerencias.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    await visualizarQuejasSugerencias(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No se encontraron registros' });
  });
});
