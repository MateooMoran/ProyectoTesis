import { registro, confirmarMail } from '../../../src/controllers/usuarios/authController.js';
import Estudiante from '../../../src/models/Estudiante.js';
import { sendMailToRegister } from '../../../src/config/nodemailer.js';

jest.mock('../../../src/models/Estudiante.js');
jest.mock('../../../src/config/nodemailer.js');

describe('Registro y Confirmación de Usuario', () => {
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

  describe('Registro de Usuario', () => {
    it('Debería registrar usuario correctamente con todos los datos', async () => {
      req.body = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@epn.edu.ec',
        password: 'password123',
        telefono: '0987654321',
        direccion: 'Quito'
      };

      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        ...req.body,
        rol: 'estudiante',
        encrypPassword: jest.fn().mockResolvedValue('hashedPassword'),
        createToken: jest.fn().mockReturnValue('token123'),
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.mockImplementation(() => mockEstudiante);
      sendMailToRegister.mockResolvedValue(true);

      await registro(req, res);

      expect(Estudiante.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(mockEstudiante.encrypPassword).toHaveBeenCalledWith('password123');
      expect(sendMailToRegister).toHaveBeenCalledWith('Juan', 'juan.perez@epn.edu.ec', 'token123');
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Registro exitoso, revisa tu correo para confirmar tu cuenta'
      });
    });

    it('Debería rechazar email duplicado', async () => {
      req.body = {
        nombre: 'Pedro',
        email: 'duplicado@epn.edu.ec',
        password: 'password123'
      };

      Estudiante.findOne.mockResolvedValue({ email: req.body.email });

      await registro(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Correo ya registrado' });
    });

    it('Debería asignar automáticamente rol de estudiante', async () => {
      req.body = {
        nombre: 'Carlos',
        email: 'carlos@epn.edu.ec',
        password: 'pass123'
      };

      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.mockImplementation((data) => {
        expect(data.rol).toBe('estudiante');
        return mockEstudiante;
      });

      sendMailToRegister.mockResolvedValue(true);

      await registro(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Debería encriptar la contraseña antes de guardar', async () => {
      req.body = {
        nombre: 'Ana',
        email: 'ana@epn.edu.ec',
        password: 'plainPassword123'
      };

      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        encrypPassword: jest.fn().mockResolvedValue('$2b$10$hashedPassword'),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.mockImplementation(() => mockEstudiante);
      sendMailToRegister.mockResolvedValue(true);

      await registro(req, res);

      expect(mockEstudiante.encrypPassword).toHaveBeenCalledWith('plainPassword123');
    });

    it('Debería generar token de confirmación', async () => {
      req.body = {
        nombre: 'Luis',
        email: 'luis@epn.edu.ec',
        password: 'password123'
      };

      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        createToken: jest.fn().mockReturnValue('abc123xyz'),
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.mockImplementation(() => mockEstudiante);
      sendMailToRegister.mockResolvedValue(true);

      await registro(req, res);

      expect(mockEstudiante.createToken).toHaveBeenCalled();
      expect(sendMailToRegister).toHaveBeenCalledWith('Luis', 'luis@epn.edu.ec', 'abc123xyz');
    });

    it('Debería manejar error al enviar correo', async () => {
      req.body = {
        nombre: 'María',
        email: 'maria@epn.edu.ec',
        password: 'password123'
      };

      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.mockImplementation(() => mockEstudiante);
      sendMailToRegister.mockRejectedValue(new Error('SMTP error'));

      await registro(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error interno del servidor'
        })
      );
    });

    it('Debería manejar error de base de datos al buscar email', async () => {
      req.body = {
        nombre: 'José',
        email: 'jose@epn.edu.ec',
        password: 'password123'
      };

      Estudiante.findOne.mockRejectedValue(new Error('DB connection failed'));

      await registro(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error interno del servidor'
        })
      );
    });

    it('Debería manejar error al guardar usuario', async () => {
      req.body = {
        nombre: 'Rosa',
        email: 'rosa@epn.edu.ec',
        password: 'password123'
      };

      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockRejectedValue(new Error('Save failed'))
      };

      Estudiante.mockImplementation(() => mockEstudiante);
      sendMailToRegister.mockResolvedValue(true);

      await registro(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('Debería aceptar emails con formato válido de EPN', async () => {
      req.body = {
        nombre: 'Diego',
        email: 'diego.torres@epn.edu.ec',
        password: 'password123'
      };

      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.mockImplementation(() => mockEstudiante);
      sendMailToRegister.mockResolvedValue(true);

      await registro(req, res);

      expect(sendMailToRegister).toHaveBeenCalledWith('Diego', 'diego.torres@epn.edu.ec', 'token');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Debería preservar todos los campos adicionales del body', async () => {
      req.body = {
        nombre: 'Patricia',
        apellido: 'González',
        email: 'patricia@epn.edu.ec',
        password: 'password123',
        telefono: '0999888777',
        direccion: 'Av. Principal 123'
      };

      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockResolvedValue(true)
      };

      let capturedData;
      Estudiante.mockImplementation((data) => {
        capturedData = data;
        return mockEstudiante;
      });

      sendMailToRegister.mockResolvedValue(true);

      await registro(req, res);

      expect(capturedData).toMatchObject({
        nombre: 'Patricia',
        apellido: 'González',
        email: 'patricia@epn.edu.ec',
        telefono: '0999888777',
        direccion: 'Av. Principal 123',
        rol: 'estudiante'
      });
    });
  });

  describe('✉️ Confirmación de Email', () => {
    it('Debería confirmar cuenta correctamente con token válido', async () => {
      req.params.token = 'validToken123';

      const mockEstudiante = {
        token: 'validToken123',
        emailConfirmado: false,
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      await confirmarMail(req, res);

      expect(Estudiante.findOne).toHaveBeenCalledWith({ token: 'validToken123' });
      expect(mockEstudiante.token).toBeNull();
      expect(mockEstudiante.emailConfirmado).toBe(true);
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Cuenta confirmada correctamente' });
    });

    it('Debería rechazar token ya utilizado', async () => {
      req.params.token = 'usedToken';

      const mockEstudiante = {
        token: null,
        emailConfirmado: true
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      await confirmarMail(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'La cuenta ya ha sido confirmada' });
    });

    it('Debería rechazar token inexistente', async () => {
      req.params.token = 'nonexistentToken';

      Estudiante.findOne.mockResolvedValue(null);

      await confirmarMail(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'La cuenta ya ha sido confirmada' });
    });

    it('Debería manejar error de base de datos al buscar token', async () => {
      req.params.token = 'validToken';

      Estudiante.findOne.mockRejectedValue(new Error('DB error'));

      await confirmarMail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error confirmando la cuenta'
        })
      );
    });

    it('Debería manejar error al guardar confirmación', async () => {
      req.params.token = 'validToken';

      const mockEstudiante = {
        token: 'validToken',
        emailConfirmado: false,
        save: jest.fn().mockRejectedValue(new Error('Save error'))
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      await confirmarMail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
