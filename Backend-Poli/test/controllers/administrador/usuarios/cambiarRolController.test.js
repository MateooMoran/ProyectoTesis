import { cambioRol } from '../../../../src/controllers/administrador/usuariosController.js';
import Estudiante from '../../../../src/models/Estudiante.js';
import Producto from '../../../../src/models/Producto.js';
import { sendMailToAssignSeller } from '../../../../src/config/nodemailer.js';

jest.mock('../../../../src/models/Estudiante.js');
jest.mock('../../../../src/models/Producto.js');
jest.mock('../../../../src/config/nodemailer.js');

describe('Administrador - Cambio de Rol (Resumido)', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Cambia rol de estudiante a vendedor y activa productos', async () => {
    const id = '507f1f77bcf86cd799439011';
    req.params.id = id;
    req.body = { rol: 'vendedor' };
    const mockUser = { _id: id, rol: 'estudiante', email: 'test@epn.edu.ec', nombre: 'Juan', save: jest.fn().mockResolvedValue(true) };

    Estudiante.findById = jest.fn().mockResolvedValue(mockUser);
    Producto.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 2 });
    sendMailToAssignSeller.mockResolvedValue(true);

    await cambioRol(req, res);

    expect(mockUser.rol).toBe('vendedor');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Rol actualizado correctamente' });
  });

  it('Cambia rol de vendedor a estudiante y desactiva productos', async () => {
    const id = '507f1f77bcf86cd799439012';
    req.params.id = id;
    req.body = { rol: 'estudiante' };
    const mockUser = { _id: id, rol: 'vendedor', save: jest.fn().mockResolvedValue(true) };

    Estudiante.findById = jest.fn().mockResolvedValue(mockUser);
    Producto.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 3 });

    await cambioRol(req, res);

    expect(mockUser.rol).toBe('estudiante');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('Rechaza cambio de rol sin rol o sin ID', async () => {
    req.body = {}; // sin rol
    await cambioRol(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req.params.id = '507f1f77bcf86cd799439013';
    req.body = { rol: 'admin' }; // rol no válido
    Estudiante.findById = jest.fn().mockResolvedValue({ _id: req.params.id, rol: 'estudiante' });
    await cambioRol(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('Rechaza usuario no encontrado', async () => {
    req.params.id = '507f1f77bcf86cd799439014';
    req.body = { rol: 'vendedor' };
    Estudiante.findById = jest.fn().mockResolvedValue(null);

    await cambioRol(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario no encontrado' });
  });

  it('Maneja errores de sistema al buscar o guardar usuario', async () => {
    req.params.id = '507f1f77bcf86cd799439015';
    req.body = { rol: 'vendedor' };
    Estudiante.findById = jest.fn().mockRejectedValue(new Error('DB error'));

    await cambioRol(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
