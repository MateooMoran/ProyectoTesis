import { eliminarNotificacion, eliminarTodasNotificaciones } from '../../../../src/controllers/servicios/notificacionesController.js';
import Notificacion from '../../../../src/models/Notificacion.js';

jest.mock('../../../../src/models/Notificacion.js');

describe('Vendedor - eliminar notificaciones (una / todas)', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, estudianteBDD: { _id: 'vendedor123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería eliminar notificación correctamente (éxito)', async () => {
    req.params.id = '507f1f77bcf86cd799439012';

    Notificacion.findOneAndDelete = jest.fn().mockResolvedValue({ _id: req.params.id, usuario: 'vendedor123' });

    await eliminarNotificacion(req, res);

    expect(Notificacion.findOneAndDelete).toHaveBeenCalledWith({ _id: req.params.id, usuario: 'vendedor123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Notificación eliminada correctamente' });
  });

  it('Debería rechazar notificación no encontrada al eliminar (validación)', async () => {
    req.params.id = '507f1f77bcf86cd799439099';
    Notificacion.findOneAndDelete = jest.fn().mockResolvedValue(null);

    await eliminarNotificacion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Notificación no encontrada o no te pertenece' });
  });

  it('Debería rechazar ID inválido al eliminar (validación)', async () => {
    req.params.id = 'invalid-id';

    await eliminarNotificacion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID inválido' });
  });

  it('Debería eliminar todas las notificaciones del usuario (éxito)', async () => {
    Notificacion.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 5 });

    await eliminarTodasNotificaciones(req, res);

    expect(Notificacion.deleteMany).toHaveBeenCalledWith({ usuario: 'vendedor123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Se eliminaron 5 notificaciones' });
  });

  it('Debería manejar error al eliminar todas (sistema)', async () => {
    Notificacion.deleteMany = jest.fn().mockRejectedValue(new Error('DB error'));

    await eliminarTodasNotificaciones(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Error del servidor de notificaciones' });
  });
});
