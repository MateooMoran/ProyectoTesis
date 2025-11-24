import { listarNotificaciones } from '../../../../src/controllers/servicios/notificacionesController.js';
import Notificacion from '../../../../src/models/Notificacion.js';

jest.mock('../../../../src/models/Notificacion.js');

describe('Vendedor - listarNotificaciones', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { estudianteBDD: { _id: 'vendedor123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería retornar lista de notificaciones (éxito)', async () => {
    const mockNotificaciones = [
      { _id: 'n1', titulo: 'A', mensaje: 'm', leido: false },
      { _id: 'n2', titulo: 'B', mensaje: 'm2', leido: true }
    ];

    Notificacion.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockNotificaciones)
        })
      })
    });

    await listarNotificaciones(req, res);

    expect(Notificacion.find).toHaveBeenCalledWith({ usuario: 'vendedor123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: mockNotificaciones });
  });

  it('Debería manejar error del sistema al listar notificaciones (sistema)', async () => {
    Notificacion.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(new Error('DB error'))
        })
      })
    });

    await listarNotificaciones(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Error interno al listar notificaciones' });
  });
});
