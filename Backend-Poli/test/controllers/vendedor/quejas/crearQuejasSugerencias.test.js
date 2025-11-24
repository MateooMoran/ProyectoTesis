import { crearQuejasSugerencias } from '../../../../src/controllers/estudiante/quejasController.js';
import QuejasSugerencias from '../../../../src/models/QuejasSugerencias.js';
import Estudiante from '../../../../src/models/Estudiante.js';
import { crearNotificacionSocket } from '../../../../src/utils/notificaciones.js';

jest.mock('../../../../src/models/QuejasSugerencias.js');
jest.mock('../../../../src/models/Estudiante.js');
jest.mock('../../../../src/utils/notificaciones.js');

describe('Vendedor - crearQuejasSugerencias', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: { tipo: 'queja', mensaje: 'x' }, estudianteBDD: { _id: 'vendedor123', nombre: 'V', apellido: 'A' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería crear una queja y notificar (éxito)', async () => {
    // Mock constructor behavior: new QuejasSugerencias(...).save()
    QuejasSugerencias.mockImplementation((payload) => ({ ...payload, save: jest.fn().mockResolvedValue(true) }));
    Estudiante.findOne = jest.fn().mockResolvedValue({ _id: 'admin1' });
    crearNotificacionSocket.mockResolvedValue(true);

    await crearQuejasSugerencias(req, res);

    expect(QuejasSugerencias).toHaveBeenCalled();
    expect(crearNotificacionSocket).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Queja o sugerencia enviada correctamente' });
  });

  it('Debería manejar error del sistema al crear queja (sistema)', async () => {
    QuejasSugerencias.mockImplementation(() => ({ save: jest.fn().mockRejectedValue(new Error('DB error')) }));

    await crearQuejasSugerencias(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Error interno del servidor al crear la queja/sugerencia' });
  });
});
