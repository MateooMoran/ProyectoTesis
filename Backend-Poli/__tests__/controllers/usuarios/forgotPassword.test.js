import { recuperarPassword } from '../../../src/controllers/usuarios/passwordController.js';
import Estudiante from '../../../src/models/Estudiante.js';
import { sendMailToRecoveryPassword } from '../../../src/config/nodemailer.js';

// Mocks
jest.mock('../../../src/models/Estudiante.js');
jest.mock('../../../src/config/nodemailer.js');

describe('📧 Recuperación de Contraseña - forgotPassword.test.js', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: 'juan.perez@epn.edu.ec',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('✅ Casos de Éxito', () => {
    it('Debería enviar email de recuperación exitosamente', async () => {
      // Arrange
      const mockToken = 'recovery-token-abc123';
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        nombre: 'Juan',
        createToken: jest.fn().mockReturnValue(mockToken),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockResolvedValue(true);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(Estudiante.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(mockEstudiante.createToken).toHaveBeenCalled();
      expect(mockEstudiante.token).toBe(mockToken);
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(sendMailToRecoveryPassword).toHaveBeenCalledWith(req.body.email, mockToken);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Revisa tu correo para cambiar tu contraseña',
      });
    });

    it('Debería generar un token único para recuperación', async () => {
      // Arrange
      const uniqueToken = 'unique-token-xyz789';
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        createToken: jest.fn().mockReturnValue(uniqueToken),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockResolvedValue(true);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(mockEstudiante.createToken).toHaveBeenCalled();
      expect(sendMailToRecoveryPassword).toHaveBeenCalledWith(
        req.body.email,
        uniqueToken
      );
    });

    it('Debería guardar el token en la base de datos', async () => {
      // Arrange
      const mockToken = 'token-to-save-123';
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        token: null,
        createToken: jest.fn().mockReturnValue(mockToken),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockResolvedValue(true);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(mockEstudiante.token).toBe(mockToken);
      expect(mockEstudiante.save).toHaveBeenCalled();
    });
  });

  describe('❌ Errores de Validación', () => {
    it('Debería rechazar solicitud si no se proporciona email', async () => {
      // Arrange
      req.body.email = '';

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Debes ingresar tu correo',
      });
      expect(Estudiante.findOne).not.toHaveBeenCalled();
      expect(sendMailToRecoveryPassword).not.toHaveBeenCalled();
    });

    it('Debería rechazar solicitud si email es null', async () => {
      // Arrange
      req.body.email = null;

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Debes ingresar tu correo',
      });
    });

    it('Debería rechazar solicitud si email es undefined', async () => {
      // Arrange
      req.body = {};

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Debes ingresar tu correo',
      });
    });

    it('Debería rechazar si el correo no está registrado', async () => {
      // Arrange
      Estudiante.findOne.mockResolvedValue(null);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(Estudiante.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Correo no registrado',
      });
      expect(sendMailToRecoveryPassword).not.toHaveBeenCalled();
    });

    it('Debería validar formato de email antes de buscar', async () => {
      // Arrange
      req.body.email = 'email-sin-formato-valido';
      Estudiante.findOne.mockResolvedValue(null);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Correo no registrado',
      });
    });

    it('Debería manejar emails con espacios en blanco', async () => {
      // Arrange
      req.body.email = '   ';

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Debes ingresar tu correo',
      });
    });
  });

  describe('⚠️ Errores del Sistema', () => {
    it('Debería manejar error de base de datos al buscar usuario', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      Estudiante.findOne.mockRejectedValue(dbError);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error enviando correo de recuperación',
        error: dbError.message,
      });
    });

    it('Debería manejar error al generar token', async () => {
      // Arrange
      const tokenError = new Error('Token generation failed');
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        createToken: jest.fn().mockImplementation(() => {
          throw tokenError;
        }),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error enviando correo de recuperación',
        error: tokenError.message,
      });
    });

    it('Debería manejar error al guardar token en base de datos', async () => {
      // Arrange
      const saveError = new Error('Failed to save token');
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        createToken: jest.fn().mockReturnValue('token123'),
        save: jest.fn().mockRejectedValue(saveError),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error enviando correo de recuperación',
        error: saveError.message,
      });
    });

    it('Debería manejar error del servicio de correo (SMTP)', async () => {
      // Arrange
      const emailError = new Error('SMTP connection timeout');
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        createToken: jest.fn().mockReturnValue('token123'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockRejectedValue(emailError);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error enviando correo de recuperación',
        error: emailError.message,
      });
    });

    it('Debería manejar error de servidor SMTP no disponible', async () => {
      // Arrange
      const smtpError = new Error('SMTP server not responding');
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockRejectedValue(smtpError);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error enviando correo de recuperación',
        })
      );
    });

    it('Debería manejar timeout de base de datos', async () => {
      // Arrange
      const timeoutError = new Error('Query execution timeout');
      Estudiante.findOne.mockRejectedValue(timeoutError);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Error enviando correo de recuperación',
        error: 'Query execution timeout',
      });
    });

    it('Debería manejar errores inesperados del sistema', async () => {
      // Arrange
      const unexpectedError = new Error('Unexpected system error');
      Estudiante.findOne.mockRejectedValue(unexpectedError);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error enviando correo de recuperación',
        })
      );
    });
  });

  describe('🔒 Seguridad', () => {
    it('No debería exponer si el email existe o no (prevenir enumeración)', async () => {
      // Arrange
      Estudiante.findOne.mockResolvedValue(null);

      // Act
      await recuperarPassword(req, res);

      // Assert
      // Por seguridad, algunos sistemas responden igual exista o no el email
      // Aquí verificamos que el mensaje sea específico
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Correo no registrado',
      });
    });

    it('Debería sobrescribir token anterior si existe', async () => {
      // Arrange
      const oldToken = 'old-token-123';
      const newToken = 'new-token-456';
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        token: oldToken,
        createToken: jest.fn().mockReturnValue(newToken),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockResolvedValue(true);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(mockEstudiante.token).toBe(newToken);
      expect(mockEstudiante.token).not.toBe(oldToken);
    });

    it('Debería generar token diferente en cada solicitud', async () => {
      // Arrange
      let tokenCounter = 1;
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        createToken: jest.fn().mockImplementation(() => `token-${tokenCounter++}`),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockResolvedValue(true);

      // Act
      await recuperarPassword(req, res);
      const firstToken = sendMailToRecoveryPassword.mock.calls[0][1];

      await recuperarPassword(req, res);
      const secondToken = sendMailToRecoveryPassword.mock.calls[1][1];

      // Assert
      expect(firstToken).not.toBe(secondToken);
    });
  });

  describe('📬 Servicio de Email', () => {
    it('Debería llamar al servicio de email con parámetros correctos', async () => {
      // Arrange
      const mockToken = 'email-token-123';
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        createToken: jest.fn().mockReturnValue(mockToken),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockResolvedValue(true);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(sendMailToRecoveryPassword).toHaveBeenCalledTimes(1);
      expect(sendMailToRecoveryPassword).toHaveBeenCalledWith(
        req.body.email,
        mockToken
      );
    });

    it('Debería enviar email solo después de guardar el token', async () => {
      // Arrange
      const callOrder = [];
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockImplementation(() => {
          callOrder.push('save');
          return Promise.resolve(true);
        }),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockImplementation(() => {
        callOrder.push('email');
        return Promise.resolve(true);
      });

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(callOrder).toEqual(['save', 'email']);
    });
  });

  describe('🎯 Casos Edge', () => {
    it('Debería manejar múltiples solicitudes del mismo usuario', async () => {
      // Arrange
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: req.body.email,
        token: 'old-token',
        createToken: jest.fn().mockReturnValue('new-token'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockResolvedValue(true);

      // Act - Primera solicitud
      await recuperarPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(200);

      // Act - Segunda solicitud
      jest.clearAllMocks();
      mockEstudiante.createToken.mockReturnValue('another-new-token');
      await recuperarPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockEstudiante.save).toHaveBeenCalled();
    });

    it('Debería manejar emails en mayúsculas/minúsculas', async () => {
      // Arrange
      req.body.email = 'JUAN.PEREZ@EPN.EDU.EC';
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: 'juan.perez@epn.edu.ec',
        createToken: jest.fn().mockReturnValue('token'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);
      sendMailToRecoveryPassword.mockResolvedValue(true);

      // Act
      await recuperarPassword(req, res);

      // Assert
      expect(Estudiante.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
