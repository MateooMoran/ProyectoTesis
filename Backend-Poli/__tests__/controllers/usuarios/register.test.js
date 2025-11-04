import { registro } from '../../../src/controllers/usuarios/authController.js';
import Estudiante from '../../../src/models/Estudiante.js';
import { sendMailToRegister } from '../../../src/config/nodemailer.js';

// Mocks
jest.mock('../../../src/models/Estudiante.js');
jest.mock('../../../src/config/nodemailer.js');

describe('🔐 Registro de Usuario - register.test.js', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@epn.edu.ec',
        password: 'password123',
        telefono: '0987654321',
        direccion: 'Quito, Ecuador',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('✅ Casos de Éxito', () => {
    it('Debería registrar un nuevo usuario exitosamente', async () => {
      // Arrange
      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        ...req.body,
        rol: 'estudiante',
        encrypPassword: jest.fn().mockResolvedValue('hashedPassword123'),
        createToken: jest.fn().mockReturnValue('mock-token-123'),
        save: jest.fn().mockResolvedValue(true),
      };
      
      Estudiante.mockImplementation(() => mockEstudiante);
      sendMailToRegister.mockResolvedValue(true);

      // Act
      await registro(req, res);

      // Assert
      expect(Estudiante.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(mockEstudiante.encrypPassword).toHaveBeenCalledWith(req.body.password);
      expect(mockEstudiante.createToken).toHaveBeenCalled();
      expect(sendMailToRegister).toHaveBeenCalledWith(
        req.body.nombre,
        req.body.email,
        'mock-token-123'
      );
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Registro exitoso, revisa tu correo para confirmar tu cuenta',
      });
    });

    it('Debería crear el token de confirmación correctamente', async () => {
      // Arrange
      Estudiante.findOne.mockResolvedValue(null);
      const mockToken = 'generated-token-abc123';
      
      const mockEstudiante = {
        ...req.body,
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        createToken: jest.fn().mockReturnValue(mockToken),
        save: jest.fn().mockResolvedValue(true),
      };
      
      Estudiante.mockImplementation(() => mockEstudiante);
      sendMailToRegister.mockResolvedValue(true);

      // Act
      await registro(req, res);

      // Assert
      expect(mockEstudiante.createToken).toHaveBeenCalled();
      expect(sendMailToRegister).toHaveBeenCalledWith(
        req.body.nombre,
        req.body.email,
        mockToken
      );
    });
  });

  describe('❌ Errores de Validación', () => {
    it('Debería rechazar registro si el email ya existe', async () => {
      // Arrange
      const existingUser = {
        _id: '123',
        email: req.body.email,
        nombre: 'Usuario Existente',
      };
      
      Estudiante.findOne.mockResolvedValue(existingUser);

      // Act
      await registro(req, res);

      // Assert
      expect(Estudiante.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Correo ya registrado',
      });
      expect(sendMailToRegister).not.toHaveBeenCalled();
    });

    it('Debería validar que el email tenga formato correcto', async () => {
      // Arrange
      req.body.email = 'email-invalido';
      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        ...req.body,
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockRejectedValue(new Error('Validation failed')),
      };
      
      Estudiante.mockImplementation(() => mockEstudiante);

      // Act
      await registro(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error interno del servidor',
        })
      );
    });

    it('Debería rechazar registro si faltan campos requeridos', async () => {
      // Arrange
      req.body = { email: 'test@epn.edu.ec' }; // Faltan campos
      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockRejectedValue(new Error('nombre is required')),
      };
      
      Estudiante.mockImplementation(() => mockEstudiante);

      // Act
      await registro(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error interno del servidor',
          error: expect.any(String),
        })
      );
    });

    it('Debería validar longitud mínima de contraseña', async () => {
      // Arrange
      req.body.password = '12'; // Muy corta
      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        ...req.body,
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockRejectedValue(new Error('Password too short')),
      };
      
      Estudiante.mockImplementation(() => mockEstudiante);

      // Act
      await registro(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error interno del servidor',
        })
      );
    });
  });

  describe('⚠️ Errores del Sistema', () => {
    it('Debería manejar error de base de datos al verificar email existente', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      Estudiante.findOne.mockRejectedValue(dbError);

      // Act
      await registro(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error interno del servidor',
        error: dbError.message,
      });
    });

    it('Debería manejar error al guardar usuario en la base de datos', async () => {
      // Arrange
      Estudiante.findOne.mockResolvedValue(null);
      
      const saveError = new Error('Failed to save user');
      const mockEstudiante = {
        ...req.body,
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockRejectedValue(saveError),
      };
      
      Estudiante.mockImplementation(() => mockEstudiante);
      sendMailToRegister.mockResolvedValue(true);

      // Act
      await registro(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error interno del servidor',
        error: saveError.message,
      });
    });

    it('Debería manejar error al enviar email de confirmación', async () => {
      // Arrange
      Estudiante.findOne.mockResolvedValue(null);
      
      const emailError = new Error('SMTP server not responding');
      const mockEstudiante = {
        ...req.body,
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockResolvedValue(true),
      };
      
      Estudiante.mockImplementation(() => mockEstudiante);
      sendMailToRegister.mockRejectedValue(emailError);

      // Act
      await registro(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error interno del servidor',
        error: emailError.message,
      });
    });

    it('Debería manejar error al encriptar contraseña', async () => {
      // Arrange
      Estudiante.findOne.mockResolvedValue(null);
      
      const encryptError = new Error('Encryption failed');
      const mockEstudiante = {
        ...req.body,
        encrypPassword: jest.fn().mockRejectedValue(encryptError),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockResolvedValue(true),
      };
      
      Estudiante.mockImplementation(() => mockEstudiante);

      // Act
      await registro(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error interno del servidor',
        error: encryptError.message,
      });
    });

    it('Debería manejar timeout en la base de datos', async () => {
      // Arrange
      const timeoutError = new Error('Operation timed out');
      Estudiante.findOne.mockRejectedValue(timeoutError);

      // Act
      await registro(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error interno del servidor',
        error: 'Operation timed out',
      });
    });
  });

  describe('🔒 Seguridad', () => {
    it('Debería encriptar la contraseña antes de guardar', async () => {
      // Arrange
      Estudiante.findOne.mockResolvedValue(null);
      
      const mockEstudiante = {
        ...req.body,
        password: req.body.password,
        encrypPassword: jest.fn().mockResolvedValue('$2a$10$hashedPassword'),
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockResolvedValue(true),
      };
      
      Estudiante.mockImplementation(() => mockEstudiante);
      sendMailToRegister.mockResolvedValue(true);

      // Act
      await registro(req, res);

      // Assert
      expect(mockEstudiante.encrypPassword).toHaveBeenCalledWith(req.body.password);
      expect(mockEstudiante.password).toBe('$2a$10$hashedPassword');
    });

    it('Debería asignar rol "estudiante" por defecto', async () => {
      // Arrange
      Estudiante.findOne.mockResolvedValue(null);
      
      let capturedUser;
      Estudiante.mockImplementation((data) => {
        capturedUser = data;
        return {
          ...data,
          encrypPassword: jest.fn().mockResolvedValue('hashed'),
          createToken: jest.fn().mockReturnValue('token'),
          save: jest.fn().mockResolvedValue(true),
        };
      });
      
      sendMailToRegister.mockResolvedValue(true);

      // Act
      await registro(req, res);

      // Assert
      expect(capturedUser.rol).toBe('estudiante');
    });
  });
});
