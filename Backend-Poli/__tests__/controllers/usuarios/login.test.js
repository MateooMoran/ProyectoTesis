import { login } from '../../../src/controllers/usuarios/authController.js';
import Estudiante from '../../../src/models/Estudiante.js';
import { createTokenJWT } from '../../../src/middlewares/JWT.js';

// Mocks
jest.mock('../../../src/models/Estudiante.js');
jest.mock('../../../src/middlewares/JWT.js');

describe('🔑 Inicio de Sesión - login.test.js', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: 'juan.perez@epn.edu.ec',
        password: 'password123',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('✅ Casos de Éxito', () => {
    it('Debería iniciar sesión correctamente con credenciales válidas', async () => {
      // Arrange
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: req.body.email,
        rol: 'estudiante',
        emailConfirmado: true,
        telefono: '0987654321',
        direccion: 'Quito, Ecuador',
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocktoken';

      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockEstudiante),
      });
      
      createTokenJWT.mockReturnValue(mockToken);

      // Act
      await login(req, res);

      // Assert
      expect(Estudiante.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(mockEstudiante.matchPassword).toHaveBeenCalledWith(req.body.password);
      expect(createTokenJWT).toHaveBeenCalledWith(mockEstudiante._id, mockEstudiante.rol);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: mockToken,
        rol: 'estudiante',
        nombre: 'Juan',
        apellido: 'Pérez',
        direccion: 'Quito, Ecuador',
        telefono: '0987654321',
        _id: mockEstudiante._id,
      });
    });

    it('Debería retornar token JWT válido al iniciar sesión', async () => {
      // Arrange
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'María',
        apellido: 'González',
        email: req.body.email,
        rol: 'estudiante',
        emailConfirmado: true,
        telefono: '0999888777',
        direccion: 'Guayaquil',
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      const expectedToken = 'jwt-token-12345';

      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockEstudiante),
      });
      
      createTokenJWT.mockReturnValue(expectedToken);

      // Act
      await login(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expectedToken,
        })
      );
    });

    it('Debería incluir información completa del usuario en la respuesta', async () => {
      // Arrange
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Carlos',
        apellido: 'Ramírez',
        email: req.body.email,
        rol: 'vendedor',
        emailConfirmado: true,
        telefono: '0987123456',
        direccion: 'Cuenca, Ecuador',
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockEstudiante),
      });
      
      createTokenJWT.mockReturnValue('token123');

      // Act
      await login(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        token: 'token123',
        rol: mockEstudiante.rol,
        nombre: mockEstudiante.nombre,
        apellido: mockEstudiante.apellido,
        direccion: mockEstudiante.direccion,
        telefono: mockEstudiante.telefono,
        _id: mockEstudiante._id,
      });
    });
  });

  describe('❌ Errores de Validación', () => {
    it('Debería rechazar login si falta el email', async () => {
      // Arrange
      req.body.email = '';

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Debes llenar todos los campos.',
      });
      expect(Estudiante.findOne).not.toHaveBeenCalled();
    });

    it('Debería rechazar login si falta la contraseña', async () => {
      // Arrange
      req.body.password = '';

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Debes llenar todos los campos.',
      });
      expect(Estudiante.findOne).not.toHaveBeenCalled();
    });

    it('Debería rechazar login si ambos campos están vacíos', async () => {
      // Arrange
      req.body = { email: '', password: '' };

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Debes llenar todos los campos.',
      });
    });

    it('Debería rechazar login si el email no está registrado', async () => {
      // Arrange
      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Correo no registrado.',
      });
    });

    it('Debería rechazar login si la contraseña es incorrecta', async () => {
      // Arrange
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        emailConfirmado: true,
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockEstudiante),
      });

      // Act
      await login(req, res);

      // Assert
      expect(mockEstudiante.matchPassword).toHaveBeenCalledWith(req.body.password);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Contraseña incorrecta.',
      });
      expect(createTokenJWT).not.toHaveBeenCalled();
    });

    it('Debería rechazar login si la cuenta no está confirmada', async () => {
      // Arrange
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        emailConfirmado: false,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockEstudiante),
      });

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Debes confirmar tu cuenta antes de iniciar sesión.',
      });
      expect(createTokenJWT).not.toHaveBeenCalled();
    });
  });

  describe('⚠️ Errores del Sistema', () => {
    it('Debería manejar error de base de datos al buscar usuario', async () => {
      // Arrange
      const dbError = new Error('Database connection lost');
      
      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockRejectedValue(dbError),
      });

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error en el login',
        error: dbError.message,
      });
    });

    it('Debería manejar error al verificar contraseña', async () => {
      // Arrange
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        emailConfirmado: true,
        matchPassword: jest.fn().mockRejectedValue(new Error('Bcrypt error')),
      };

      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockEstudiante),
      });

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error en el login',
        error: 'Bcrypt error',
      });
    });

    it('Debería manejar error al generar token JWT', async () => {
      // Arrange
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Test',
        apellido: 'User',
        email: req.body.email,
        rol: 'estudiante',
        emailConfirmado: true,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockEstudiante),
      });
      
      createTokenJWT.mockImplementation(() => {
        throw new Error('JWT signing failed');
      });

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error en el login',
        error: 'JWT signing failed',
      });
    });

    it('Debería manejar timeout de base de datos', async () => {
      // Arrange
      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Query timeout')),
      });

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error en el login',
        error: 'Query timeout',
      });
    });

    it('Debería manejar errores inesperados del sistema', async () => {
      // Arrange
      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Unexpected error')),
      });

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error en el login',
        })
      );
    });
  });

  describe('🔒 Seguridad y Autenticación', () => {
    it('No debería exponer información sensible en respuesta de error', async () => {
      // Arrange
      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      // Act
      await login(req, res);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response).not.toHaveProperty('password');
      expect(response).not.toHaveProperty('salt');
    });

    it('Debería usar select para excluir campos sensibles', async () => {
      // Arrange
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Test',
        email: req.body.email,
        rol: 'estudiante',
        emailConfirmado: true,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      const selectMock = jest.fn().mockResolvedValue(mockEstudiante);
      Estudiante.findOne.mockReturnValue({ select: selectMock });
      createTokenJWT.mockReturnValue('token');

      // Act
      await login(req, res);

      // Assert
      expect(selectMock).toHaveBeenCalledWith('-__v -updatedAt -createdAt');
    });

    it('Debería validar formato de email antes de buscar', async () => {
      // Arrange
      req.body.email = 'invalid-email-format';
      
      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Correo no registrado.',
      });
    });
  });

  describe('🎭 Diferentes Roles de Usuario', () => {
    it('Debería permitir login de usuario con rol "estudiante"', async () => {
      // Arrange
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Estudiante',
        apellido: 'Test',
        email: req.body.email,
        rol: 'estudiante',
        emailConfirmado: true,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockEstudiante),
      });
      
      createTokenJWT.mockReturnValue('token');

      // Act
      await login(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ rol: 'estudiante' })
      );
    });

    it('Debería permitir login de usuario con rol "vendedor"', async () => {
      // Arrange
      const mockVendedor = {
        _id: '507f1f77bcf86cd799439012',
        nombre: 'Vendedor',
        apellido: 'Test',
        email: req.body.email,
        rol: 'vendedor',
        emailConfirmado: true,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockVendedor),
      });
      
      createTokenJWT.mockReturnValue('token');

      // Act
      await login(req, res);

      // Assert
      expect(createTokenJWT).toHaveBeenCalledWith(mockVendedor._id, 'vendedor');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ rol: 'vendedor' })
      );
    });

    it('Debería permitir login de usuario con rol "admin"', async () => {
      // Arrange
      const mockAdmin = {
        _id: '507f1f77bcf86cd799439013',
        nombre: 'Admin',
        apellido: 'Test',
        email: req.body.email,
        rol: 'admin',
        emailConfirmado: true,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin),
      });
      
      createTokenJWT.mockReturnValue('token');

      // Act
      await login(req, res);

      // Assert
      expect(createTokenJWT).toHaveBeenCalledWith(mockAdmin._id, 'admin');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ rol: 'admin' })
      );
    });
  });
});
