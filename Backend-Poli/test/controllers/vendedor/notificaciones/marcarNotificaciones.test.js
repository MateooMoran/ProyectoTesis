import { marcarNotificacionLeida, marcarTodasNotificaciones } from '../../../../src/controllers/servicios/notificacionesController.js';
import Notificacion from '../../../../src/models/Notificacion.js';

jest.mock('../../../../src/models/Notificacion.js');

describe('Vendedor - marcar notificaciones (una / todas)', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, estudianteBDD: { _id: 'vendedor123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería marcar notificación como leída correctamente (éxito)', async () => {
    req.params.id = '507f1f77bcf86cd799439011';

    const mockNotificacion = { _id: req.params.id, leido: false, save: jest.fn().mockResolvedValue(true) };
    Notificacion.findOne = jest.fn().mockResolvedValue(mockNotificacion);

    await marcarNotificacionLeida(req, res);

    expect(mockNotificacion.leido).toBe(true);
    expect(mockNotificacion.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Notificación marcada como leída' });
  });

  it('Debería rechazar notificación no encontrada al marcar (validación)', async () => {
    req.params.id = '507f1f77bcf86cd799439099';
    Notificacion.findOne = jest.fn().mockResolvedValue(null);

    await marcarNotificacionLeida(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Notificación no encontrada o no te pertenece' });
  });

  it('Debería rechazar ID inválido al marcar (validación)', async () => {
    req.params.id = 'invalid-id';

    await marcarNotificacionLeida(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID inválido' });
  });

  it('Debería marcar todas las notificaciones como leídas (éxito)', async () => {
    Notificacion.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 3 });

    await marcarTodasNotificaciones(req, res);

    expect(Notificacion.updateMany).toHaveBeenCalledWith(
      { usuario: 'vendedor123', leido: false },
      { $set: { leido: true } }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Se marcaron 3 notificaciones como leídas', modifiedCount: 3 }));
  });

  it('Debería manejar error al marcar todas (sistema)', async () => {
    Notificacion.updateMany = jest.fn().mockRejectedValue(new Error('DB error'));

    await marcarTodasNotificaciones(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Error del servidor de notificaciones' });
  });
});
