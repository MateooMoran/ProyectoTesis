import { eliminarQuejaSugerencia } from '../../../../src/controllers/administrador/quejasController.js';
import QuejasSugerencias from '../../../../src/models/QuejasSugerencias.js';

jest.mock('../../../../src/models/QuejasSugerencias.js');

describe('Administrador - Eliminar Quejas y Sugerencias', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    // use valid MongoDB ObjectId so controller validation passes
    req = { params: { id: '507f1f77bcf86cd799439011' }, usuario: { _id: 'admin1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('Debería eliminar una queja correctamente (éxito)', async () => {
    // controller should allow deletion when estado is NOT 'resuelto' (e.g., 'pendiente')
    QuejasSugerencias.findById.mockResolvedValue({ _id: req.params.id, estado: 'pendiente' });
    QuejasSugerencias.findByIdAndDelete.mockResolvedValue(true);

    await eliminarQuejaSugerencia(req, res);

    expect(QuejasSugerencias.findById).toHaveBeenCalledWith(req.params.id);
    expect(QuejasSugerencias.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Queja/Sugerencia eliminada correctamente' });
  });

  it('Debería rechazar eliminar si la queja ya está resuelta (validación)', async () => {
    QuejasSugerencias.findById.mockResolvedValue({ _id: req.params.id, estado: 'resuelto' });

    await eliminarQuejaSugerencia(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No se puede eliminar una queja/sugerencia ya resuelta' });
  });

  it('Debería retornar 404 si la queja no existe (validación)', async () => {
    QuejasSugerencias.findById.mockResolvedValue(null);

    await eliminarQuejaSugerencia(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Queja/Sugerencia no encontrada' });
  });

  it('Debería manejar error del sistema al eliminar (500)', async () => {
    QuejasSugerencias.findById.mockRejectedValue(new Error('DB failure'));

    await eliminarQuejaSugerencia(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
