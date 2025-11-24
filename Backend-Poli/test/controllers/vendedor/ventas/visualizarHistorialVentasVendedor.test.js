import { visualizarHistorialVentasVendedor } from '../../../../src/controllers/vendedor/ventasController.js';
import Orden from '../../../../src/models/Orden.js';

jest.mock('../../../../src/models/Orden.js');

describe('Vendedor - visualizarHistorialVentasVendedor', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { estudianteBDD: { _id: 'vendedor123', rol: 'vendedor' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería retornar historial de ventas (éxito)', async () => {
    const mockVentas = [{ _id: 'o1', total: 100 }];
    const chain = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue(mockVentas) };
    Orden.find = jest.fn().mockReturnValue(chain);

    await visualizarHistorialVentasVendedor(req, res);

    expect(Orden.find).toHaveBeenCalledWith({ vendedor: 'vendedor123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockVentas);
  });

  it('Debería retornar 404 si no hay ventas (validación)', async () => {
    const chain = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue([]) };
    Orden.find = jest.fn().mockReturnValue(chain);

    await visualizarHistorialVentasVendedor(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No tienes ventas registradas' });
  });

  it('Debería manejar error del sistema (sistema)', async () => {
    const chain = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockRejectedValue(new Error('DB error')) };
    Orden.find = jest.fn().mockReturnValue(chain);

    await visualizarHistorialVentasVendedor(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error obteniendo historial de ventas' }));
  });
});
