import { verOrdenes } from '../../../../src/controllers/estudiante/ordenesController.js';
import Orden from '../../../../src/models/Orden.js';

jest.mock('../../../../src/models/Orden.js');

describe('Estudiante - verOrdenes', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { estudianteBDD: { _id: 'est123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería retornar historial de órdenes (éxito)', async () => {
    const mockOrdenes = [{ _id: 'orden1', total: 100 }];
    
    Orden.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockOrdenes)
            })
          })
        })
      })
    });

    await verOrdenes(req, res);

    expect(Orden.find).toHaveBeenCalledWith({ comprador: 'est123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockOrdenes);
  });

  it('Debería rechazar usuario no autenticado (validación)', async () => {
    req.estudianteBDD = null;

    await verOrdenes(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario no autenticado' });
  });

  it('Debería manejar error del sistema al obtener órdenes (sistema)', async () => {
    Orden.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              lean: jest.fn().mockRejectedValue(new Error('DB error'))
            })
          })
        })
      })
    });

    await verOrdenes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error obteniendo órdenes' }));
  });
});
