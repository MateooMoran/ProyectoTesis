import { visualizarMetodosPago } from '../../../../src/controllers/vendedor/metodoPagoController.js';
import MetodoPagoVendedor from '../../../../src/models/MetodoPagoVendedor.js';

jest.mock('../../../../src/models/MetodoPagoVendedor.js');

describe('Vendedor - Visualizar Métodos de Pago', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {},
      query: {},
      estudianteBDD: { _id: 'vendedor123', rol: 'vendedor' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  it('Debería retornar métodos válidos (éxito)', async () => {
    const mockMetodos = [
      { tipo: 'transferencia', banco: 'B', numeroCuenta: '1', titular: 'T', cedula: 'C' },
      { tipo: 'qr', imagenComprobante: 'https://cloud/qr.jpg' }
    ];

    MetodoPagoVendedor.find = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(mockMetodos)
    });

    await visualizarMetodosPago(req, res);

    expect(MetodoPagoVendedor.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ metodos: mockMetodos });
  });

  it('Debería devolver 401 si no autenticado (validación)', async () => {
    req.estudianteBDD = null;
    await visualizarMetodosPago(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('Debería manejar error del sistema (sistema)', async () => {
    MetodoPagoVendedor.find = jest.fn().mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error('DB error'))
    });

    await visualizarMetodosPago(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
