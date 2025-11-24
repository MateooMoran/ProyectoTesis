import { responderQuejaSugerencia } from '../../../../src/controllers/administrador/quejasController.js';
import QuejasSugerencias from '../../../../src/models/QuejasSugerencias.js';
import { crearNotificacionSocket } from '../../../../src/utils/notificaciones.js';

jest.mock('../../../../src/models/QuejasSugerencias.js');
jest.mock('../../../../src/utils/notificaciones.js');

describe('Administrador - Responder Quejas y Sugerencias', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: { id: '507f1f77bcf86cd799439011' }, body: { respuesta: 'Gracias por tu reporte' }, usuario: { _id: 'admin1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('Debería responder una queja correctamente (éxito)', async () => {
    const mockQueja = { _id: '1', usuario: { _id: 'u1' }, mensaje: 'Problema', estado: 'pendiente', save: jest.fn() };

    QuejasSugerencias.findById.mockResolvedValue(mockQueja);
    crearNotificacionSocket.mockResolvedValue(true);

    await responderQuejaSugerencia(req, res);

    expect(QuejasSugerencias.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(mockQueja.save).toHaveBeenCalled();
    expect(crearNotificacionSocket).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Respuesta enviada correctamente' });
  });

  it('Debería retornar 404 si la queja no existe (validación)', async () => {
    QuejasSugerencias.findById.mockResolvedValue(null);

    await responderQuejaSugerencia(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'La queja/sugerencia no fue encontrada' });
  });

  it('Debería rechazar responder si la queja ya está resuelta (validación)', async () => {
    QuejasSugerencias.findById.mockResolvedValue({ _id: 'x', estado: 'resuelto' });

    await responderQuejaSugerencia(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'La queja/sugerencia ya fue resuelta' });
  });

  it('Debería manejar error del sistema al responder (500)', async () => {
    QuejasSugerencias.findById.mockRejectedValue(new Error('DB failure'));

    await responderQuejaSugerencia(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
