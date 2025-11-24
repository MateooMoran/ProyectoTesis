import { login } from '../../../src/controllers/usuarios/authController.js';
import Estudiante from '../../../src/models/Estudiante.js';
import { createTokenJWT } from '../../../src/middlewares/JWT.js';

jest.mock('../../../src/models/Estudiante.js');
jest.mock('../../../src/middlewares/JWT.js');

describe('Login de Usuario', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('Login exitoso y retorna token JWT', async () => {
    req.body = { email: 'juan@epn.edu.ec', password: 'password123' };
    const mockEstudiante = {
      _id: '507f1f77bcf86cd799439011',
      emailConfirmado: true,
      rol: 'estudiante',
      nombre: 'Juan',
      apellido: 'Pérez',
      direccion: 'Quito',
      telefono: '0987654321',
      matchPassword: jest.fn().mockResolvedValue(true)
    };
    Estudiante.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockEstudiante) });
    createTokenJWT.mockReturnValue('jwtToken123');

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'jwtToken123' }));
  });

  it('Rechaza login sin email o password', async () => {
    req.body = { password: '123' }; // sin email
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    req.body = { email: 'juan@epn.edu.ec' }; // sin password
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('Rechaza email no registrado', async () => {
    req.body = { email: 'noexiste@epn.edu.ec', password: '123' };
    Estudiante.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('Rechaza cuenta no confirmada', async () => {
    req.body = { email: 'noconfirmado@epn.edu.ec', password: '123' };
    const mockEstudiante = { _id: '1', emailConfirmado: false, rol: 'estudiante' };
    Estudiante.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockEstudiante) });
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('Maneja error de base de datos', async () => {
    req.body = { email: 'juan@epn.edu.ec', password: '123' };
    Estudiante.findOne.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('DB error')) });
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
