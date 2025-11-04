import { crearNuevoPassword, comprobarTokenPassword } from '../../../src/controllers/usuarios/passwordController.js';
import Estudiante from '../../../src/models/Estudiante.js';

// Mocks
jest.mock('../../../src/models/Estudiante.js');

describe('🔑 Reseteo de Contraseña - resetPassword.test.js', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        token: 'valid-token-123',
      },
      body: {
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('🔍 Verificación de Token', () => {
    describe('✅ Casos de Éxito', () => {
      it('Debería validar token correcto exitosamente', async () => {
        // Arrange
        const mockEstudiante = {
          _id: '507f1f77bcf86cd799439011',
          email: 'juan.perez@epn.edu.ec',
          token: 'valid-token-123',
        };

        Estudiante.findOne.mockResolvedValue(mockEstudiante);

        // Act
        await comprobarTokenPassword(req, res);

        // Assert
        expect(Estudiante.findOne).toHaveBeenCalledWith({ token: req.params.token });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Token válido, puedes crear una nueva contraseña',
        });
      });

      it('Debería confirmar que el token existe en la base de datos', async () => {
        // Arrange
        const mockEstudiante = {
          _id: '507f1f77bcf86cd799439011',
          token: req.params.token,
        };

        Estudiante.findOne.mockResolvedValue(mockEstudiante);

        // Act
        await comprobarTokenPassword(req, res);

        // Assert
        expect(Estudiante.findOne).toHaveBeenCalledWith({ token: req.params.token });
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });

    describe('❌ Errores de Validación - Token', () => {
      it('Debería rechazar token inexistente', async () => {
        // Arrange
        Estudiante.findOne.mockResolvedValue(null);

        // Act
        await comprobarTokenPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Token inválido o expirado',
        });
      });

      it('Debería rechazar si el token no coincide', async () => {
        // Arrange
        const mockEstudiante = {
          _id: '507f1f77bcf86cd799439011',
          token: 'different-token-456',
        };

        Estudiante.findOne.mockResolvedValue(mockEstudiante);

        // Act
        await comprobarTokenPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Token inválido o expirado',
        });
      });

      it('Debería rechazar token vacío', async () => {
        // Arrange
        req.params.token = '';
        Estudiante.findOne.mockResolvedValue(null);

        // Act
        await comprobarTokenPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Token inválido o expirado',
        });
      });

      it('Debería rechazar token null', async () => {
        // Arrange
        req.params.token = null;
        Estudiante.findOne.mockResolvedValue(null);

        // Act
        await comprobarTokenPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe('⚠️ Errores del Sistema - Verificación', () => {
      it('Debería manejar error de base de datos al verificar token', async () => {
        // Arrange
        const dbError = new Error('Database query failed');
        Estudiante.findOne.mockRejectedValue(dbError);

        // Act
        await comprobarTokenPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Error comprobando token',
          error: dbError.message,
        });
      });

      it('Debería manejar timeout de base de datos', async () => {
        // Arrange
        Estudiante.findOne.mockRejectedValue(new Error('Connection timeout'));

        // Act
        await comprobarTokenPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            msg: 'Error comprobando token',
          })
        );
      });
    });
  });

  describe('🔐 Creación de Nueva Contraseña', () => {
    describe('✅ Casos de Éxito', () => {
      it('Debería cambiar la contraseña exitosamente con token válido', async () => {
        // Arrange
        const mockEstudiante = {
          _id: '507f1f77bcf86cd799439011',
          email: 'juan.perez@epn.edu.ec',
          token: 'valid-token-123',
          encrypPassword: jest.fn().mockResolvedValue('$2a$10$hashedPassword'),
          save: jest.fn().mockResolvedValue(true),
        };

        Estudiante.findOne.mockResolvedValue(mockEstudiante);

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(Estudiante.findOne).toHaveBeenCalledWith({ token: req.params.token });
        expect(mockEstudiante.encrypPassword).toHaveBeenCalledWith(req.body.password);
        expect(mockEstudiante.password).toBe('$2a$10$hashedPassword');
        expect(mockEstudiante.token).toBeNull();
        expect(mockEstudiante.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Contraseña cambiada correctamente',
        });
      });

      it('Debería eliminar el token después de cambiar la contraseña', async () => {
        // Arrange
        const mockEstudiante = {
          _id: '507f1f77bcf86cd799439011',
          token: 'token-to-be-removed',
          encrypPassword: jest.fn().mockResolvedValue('hashed'),
          save: jest.fn().mockResolvedValue(true),
        };

        Estudiante.findOne.mockResolvedValue(mockEstudiante);

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(mockEstudiante.token).toBeNull();
        expect(mockEstudiante.save).toHaveBeenCalled();
      });

      it('Debería encriptar la nueva contraseña antes de guardar', async () => {
        // Arrange
        const plainPassword = 'myNewPassword123';
        const hashedPassword = '$2a$10$verySecureHash';
        
        req.body.password = plainPassword;
        req.body.confirmPassword = plainPassword;

        const mockEstudiante = {
          _id: '507f1f77bcf86cd799439011',
          token: req.params.token,
          password: 'old-password',
          encrypPassword: jest.fn().mockResolvedValue(hashedPassword),
          save: jest.fn().mockResolvedValue(true),
        };

        Estudiante.findOne.mockResolvedValue(mockEstudiante);

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(mockEstudiante.encrypPassword).toHaveBeenCalledWith(plainPassword);
        expect(mockEstudiante.password).toBe(hashedPassword);
        expect(mockEstudiante.password).not.toBe(plainPassword);
      });
    });

    describe('❌ Errores de Validación - Contraseña', () => {
      it('Debería rechazar si falta el campo password', async () => {
        // Arrange
        req.body.password = '';

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Debes completar todos los campos',
        });
        expect(Estudiante.findOne).not.toHaveBeenCalled();
      });

      it('Debería rechazar si falta el campo confirmPassword', async () => {
        // Arrange
        req.body.confirmPassword = '';

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Debes completar todos los campos',
        });
      });

      it('Debería rechazar si ambos campos están vacíos', async () => {
        // Arrange
        req.body = { password: '', confirmPassword: '' };

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Debes completar todos los campos',
        });
      });

      it('Debería rechazar si la contraseña es muy corta (< 4 caracteres)', async () => {
        // Arrange
        req.body.password = '123';
        req.body.confirmPassword = '123';

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'La contraseña debe tener al menos 4 caracteres',
        });
      });

      it('Debería rechazar si las contraseñas no coinciden', async () => {
        // Arrange
        req.body.password = 'password123';
        req.body.confirmPassword = 'differentPassword456';

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Las contraseñas no coinciden',
        });
      });

      it('Debería rechazar token inválido al crear nueva contraseña', async () => {
        // Arrange
        Estudiante.findOne.mockResolvedValue(null);

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Token inválido',
        });
      });

      it('Debería validar longitud exacta de 4 caracteres como mínimo', async () => {
        // Arrange
        req.body.password = '1234';
        req.body.confirmPassword = '1234';

        const mockEstudiante = {
          _id: '507f1f77bcf86cd799439011',
          token: req.params.token,
          encrypPassword: jest.fn().mockResolvedValue('hashed'),
          save: jest.fn().mockResolvedValue(true),
        };

        Estudiante.findOne.mockResolvedValue(mockEstudiante);

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });

    describe('⚠️ Errores del Sistema - Reset', () => {
      it('Debería manejar error de base de datos al buscar usuario', async () => {
        // Arrange
        const dbError = new Error('Database connection lost');
        Estudiante.findOne.mockRejectedValue(dbError);

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Error cambiando contraseña',
          error: dbError.message,
        });
      });

      it('Debería manejar error al encriptar contraseña', async () => {
        // Arrange
        const encryptError = new Error('Bcrypt encryption failed');
        const mockEstudiante = {
          _id: '507f1f77bcf86cd799439011',
          token: req.params.token,
          encrypPassword: jest.fn().mockRejectedValue(encryptError),
          save: jest.fn().mockResolvedValue(true),
        };

        Estudiante.findOne.mockResolvedValue(mockEstudiante);

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Error cambiando contraseña',
          error: encryptError.message,
        });
      });

      it('Debería manejar error al guardar nueva contraseña', async () => {
        // Arrange
        const saveError = new Error('Failed to update user');
        const mockEstudiante = {
          _id: '507f1f77bcf86cd799439011',
          token: req.params.token,
          encrypPassword: jest.fn().mockResolvedValue('hashed'),
          save: jest.fn().mockRejectedValue(saveError),
        };

        Estudiante.findOne.mockResolvedValue(mockEstudiante);

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Error cambiando contraseña',
          error: saveError.message,
        });
      });

      it('Debería manejar timeout de base de datos', async () => {
        // Arrange
        Estudiante.findOne.mockRejectedValue(new Error('Query timeout'));

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            msg: 'Error cambiando contraseña',
          })
        );
      });

      it('Debería manejar errores inesperados del sistema', async () => {
        // Arrange
        Estudiante.findOne.mockRejectedValue(new Error('Unexpected error'));

        // Act
        await crearNuevoPassword(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe('🔒 Seguridad', () => {
    it('No debería permitir reutilizar el mismo token después del reset', async () => {
      // Arrange
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        token: req.params.token,
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      // Act
      await crearNuevoPassword(req, res);

      // Assert
      expect(mockEstudiante.token).toBeNull();
    });

    it('No debería exponer información del usuario en respuesta', async () => {
      // Arrange
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        email: 'sensitive@epn.edu.ec',
        token: req.params.token,
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      // Act
      await crearNuevoPassword(req, res);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response).not.toHaveProperty('email');
      expect(response).not.toHaveProperty('_id');
      expect(response).not.toHaveProperty('password');
    });

    it('Debería validar que la contraseña no contenga solo espacios', async () => {
      // Arrange
      req.body.password = '    ';
      req.body.confirmPassword = '    ';

      // Act
      await crearNuevoPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('🎯 Casos Edge', () => {
    it('Debería manejar contraseñas con caracteres especiales', async () => {
      // Arrange
      req.body.password = 'P@ssw0rd!#$%';
      req.body.confirmPassword = 'P@ssw0rd!#$%';

      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        token: req.params.token,
        encrypPassword: jest.fn().mockResolvedValue('hashed-special'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      // Act
      await crearNuevoPassword(req, res);

      // Assert
      expect(mockEstudiante.encrypPassword).toHaveBeenCalledWith('P@ssw0rd!#$%');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Debería manejar contraseñas muy largas', async () => {
      // Arrange
      const longPassword = 'a'.repeat(100);
      req.body.password = longPassword;
      req.body.confirmPassword = longPassword;

      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        token: req.params.token,
        encrypPassword: jest.fn().mockResolvedValue('hashed-long'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      // Act
      await crearNuevoPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Debería manejar tokens con caracteres especiales', async () => {
      // Arrange
      req.params.token = 'token-with-special-chars-!@#$%';
      
      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439011',
        token: req.params.token,
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudiante);

      // Act
      await crearNuevoPassword(req, res);

      // Assert
      expect(Estudiante.findOne).toHaveBeenCalledWith({ token: req.params.token });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('📋 Flujo Completo', () => {
    it('Debería completar el flujo de reset: verificar token → cambiar contraseña', async () => {
      // Arrange - Verificar token
      const mockEstudianteVerify = {
        _id: '507f1f77bcf86cd799439011',
        token: req.params.token,
      };

      Estudiante.findOne.mockResolvedValue(mockEstudianteVerify);

      // Act - Verificar token
      await comprobarTokenPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(200);

      // Arrange - Cambiar contraseña
      jest.clearAllMocks();
      const mockEstudianteReset = {
        _id: '507f1f77bcf86cd799439011',
        token: req.params.token,
        encrypPassword: jest.fn().mockResolvedValue('hashed'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findOne.mockResolvedValue(mockEstudianteReset);

      // Act - Cambiar contraseña
      await crearNuevoPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockEstudianteReset.token).toBeNull();
    });
  });
});
