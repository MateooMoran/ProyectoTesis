import {
  recuperarPassword,
  comprobarTokenPassword,
  crearNuevoPassword
} from '../../../src/controllers/usuarios/passwordController.js';
import Estudiante from '../../../src/models/Estudiante.js';
import { sendMailToRecoveryPassword } from '../../../src/config/nodemailer.js';

jest.mock('../../../src/models/Estudiante.js');
jest.mock('../../../src/config/nodemailer.js');

describe(' Recuperación de Contraseña', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe(' Solicitar Recuperación', () => {
    it('Debería enviar correo de recuperación correctamente', async () => {
      req.body = { email: 'juan@epn.edu.ec' };

      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: 'juan@epn.edu.ec',
        createToken: jest.fn().mockReturnValue('recoveryToken123'),
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockResolvedValue(true);

      await recuperarPassword(req, res);

      expect(Estudiante.findOne).toHaveBeenCalledWith({ email: 'juan@epn.edu.ec' });
      expect(mockEstudiante.createToken).toHaveBeenCalled();
      expect(mockEstudiante.token).toBe('recoveryToken123');
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(sendMailToRecoveryPassword).toHaveBeenCalledWith('juan@epn.edu.ec', 'recoveryToken123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Revisa tu correo para cambiar tu contraseña'
      });
    });

    it('Debería rechazar solicitud sin email', async () => {
      req.body = {};

      await recuperarPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Debes ingresar tu correo' });
    });

    it('Debería rechazar email no registrado', async () => {
      req.body = { email: 'noexiste@epn.edu.ec' };

      Estudiante.findOne.mockResolvedValue(null);

      await recuperarPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Correo no registrado' });
    });

    it('Debería manejar error al enviar correo', async () => {
      req.body = { email: 'maria@epn.edu.ec' };

      const mockEstudiante = {
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockRejectedValue(new Error('SMTP error'));

      await recuperarPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error enviando correo de recuperación'
        })
      );
    });
  });

  describe('Comprobar Token', () => {
    it('Debería validar token correcto', async () => {
      req.params.token = 'validToken123';

      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439012',
        token: 'validToken123'
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      await comprobarTokenPassword(req, res);

      expect(Estudiante.findOne).toHaveBeenCalledWith({ token: 'validToken123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Token válido, puedes crear una nueva contraseña'
      });
    });

    it('Debería rechazar token inexistente', async () => {
      req.params.token = 'invalidToken';

      Estudiante.findOne.mockResolvedValue(null);

      await comprobarTokenPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Token inválido o expirado' });
    });

    it('Debería rechazar token diferente', async () => {
      req.params.token = 'tokenA';

      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439013',
        token: 'tokenB'
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      await comprobarTokenPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Token inválido o expirado' });
    });
  });

  describe(' Crear Nueva Contraseña', () => {
    it('Debería cambiar contraseña correctamente', async () => {
      req.params.token = 'validToken';
      req.body = {
        password: 'newPassword123',
        confirmPassword: 'newPassword123'
      };

      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439014',
        encrypPassword: jest.fn().mockResolvedValue('$2b$10$newHash'),
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      await crearNuevoPassword(req, res);

      expect(Estudiante.findOne).toHaveBeenCalledWith({ token: 'validToken' });
      expect(mockEstudiante.encrypPassword).toHaveBeenCalledWith('newPassword123');
      expect(mockEstudiante.password).toBe('$2b$10$newHash');
      expect(mockEstudiante.token).toBeNull();
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Contraseña cambiada correctamente' });
    });

    it('Debería rechazar campos vacíos', async () => {
      req.params.token = 'token';
      req.body = {};

      await crearNuevoPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Debes completar todos los campos' });
    });

    it('Debería rechazar contraseña muy corta', async () => {
      req.params.token = 'token';
      req.body = {
        password: '123',
        confirmPassword: '123'
      };

      await crearNuevoPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'La contraseña debe tener al menos 4 caracteres'
      });
    });

    it('Debería rechazar contraseñas que no coinciden', async () => {
      req.params.token = 'token';
      req.body = {
        password: 'password123',
        confirmPassword: 'password456'
      };

      await crearNuevoPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Las contraseñas no coinciden' });
    });

    it('Debería rechazar token inválido', async () => {
      req.params.token = 'invalidToken';
      req.body = {
        password: 'password123',
        confirmPassword: 'password123'
      };

      Estudiante.findOne.mockResolvedValue(null);

      await crearNuevoPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Token inválido' });
    });
  });
});
