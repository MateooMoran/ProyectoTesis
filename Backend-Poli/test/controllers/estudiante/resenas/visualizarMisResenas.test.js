import { visualizarMisResenas } from '../../../../src/controllers/estudiante/resenaController.js';
import Resena from '../../../../src/models/Resena.js';

jest.mock('../../../../src/models/Resena.js');

describe('Estudiante - visualizarMisResenas', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { estudianteBDD: { _id: 'est123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería retornar mis reseñas (éxito)', async () => {
    const mockResenas = [{ _id: 'r1', estrellas: 5 }];
    
    Resena.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockResenas)
        })
      })
    });

    await visualizarMisResenas(req, res);

    expect(Resena.find).toHaveBeenCalledWith({ usuario: 'est123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalResenas: 1, resenas: mockResenas }));
  });

  it('Debería retornar 404 si no hay reseñas (validación)', async () => {
    Resena.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([])
        })
      })
    });

    await visualizarMisResenas(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No has realizado ninguna reseña' });
  });

  it('Debería manejar error del sistema al obtener mis reseñas (sistema)', async () => {
    Resena.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error('DB error'))
        })
      })
    });

    await visualizarMisResenas(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error obteniendo tus reseñas' }));
  });
});
