import { actualizarContraseña } from '../../../src/controllers/usuarios/perfilController.js';
import Estudiante from '../../../src/models/Estudiante.js';

// Mock del modelo Estudiante
jest.mock('../../../src/models/Estudiante.js');

describe('🔐 Actualizar Contraseña - updatePassword.test.js', () => {
  let req, res;

  beforeEach(() => {
    req = {
      estudianteBDD: {
        _id: '507f1f77bcf86cd799439011',
      },
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('✅ Casos de Éxito', () => {
    it('Debería actualizar la contraseña correctamente', async () => {
      // Arrange
      req.body = {
        passwordactual: 'current123',
        passwordnuevo: 'newSecure456',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        matchPassword: jest.fn().mockResolvedValue(true),
        encrypPassword: jest.fn().mockResolvedValue('$2b$10$hashedNewPassword'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(Estudiante.findById).toHaveBeenCalledWith(req.estudianteBDD._id);
      expect(mockEstudiante.matchPassword).toHaveBeenCalledWith('current123');
      expect(mockEstudiante.encrypPassword).toHaveBeenCalledWith('newSecure456');
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Password actualizado correctamente',
      });
    });

    it('Debería encriptar la nueva contraseña antes de guardar', async () => {
      // Arrange
      req.body = {
        passwordactual: 'oldPassword123',
        passwordnuevo: 'newPassword456',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        password: 'oldHashedPassword',
        matchPassword: jest.fn().mockResolvedValue(true),
        encrypPassword: jest.fn().mockResolvedValue('$2b$10$newHashedPassword'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(mockEstudiante.encrypPassword).toHaveBeenCalledWith('newPassword456');
      expect(mockEstudiante.password).toBe('$2b$10$newHashedPassword');
      expect(mockEstudiante.save).toHaveBeenCalled();
    });

    it('Debería eliminar espacios en blanco de las contraseñas con trim()', async () => {
      // Arrange
      req.body = {
        passwordactual: '  current123  ',
        passwordnuevo: '  newSecure456  ',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        matchPassword: jest.fn().mockResolvedValue(true),
        encrypPassword: jest.fn().mockResolvedValue('$2b$10$hashedNewPassword'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(mockEstudiante.matchPassword).toHaveBeenCalledWith('current123');
      expect(mockEstudiante.encrypPassword).toHaveBeenCalledWith('newSecure456');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('❌ Errores de Validación', () => {
    it('Debería rechazar si el usuario no existe', async () => {
      // Arrange
      req.body = {
        passwordactual: 'current',
        passwordnuevo: 'new',
      };

      Estudiante.findById.mockResolvedValue(null);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        msg: `Lo sentimos, no existe el estudiante ${req.estudianteBDD._id}`,
      });
    });

    it('Debería rechazar si la contraseña actual es incorrecta', async () => {
      // Arrange
      req.body = {
        passwordactual: 'wrongPassword',
        passwordnuevo: 'newPassword123',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(mockEstudiante.matchPassword).toHaveBeenCalledWith('wrongPassword');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Lo sentimos, el password actual no es el correcto',
      });
    });

    it('Debería rechazar si falta la contraseña actual', async () => {
      // Arrange
      req.body = { passwordnuevo: 'newPassword123' };

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Debes ingresar las contraseñas',
      });
    });

    it('Debería rechazar si falta la nueva contraseña', async () => {
      // Arrange
      req.body = { passwordactual: 'current123' };

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Debes ingresar las contraseñas',
      });
    });

    it('Debería rechazar si ambas contraseñas están vacías', async () => {
      // Arrange
      req.body = {
        passwordactual: '',
        passwordnuevo: '',
      };

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Debes ingresar las contraseñas',
      });
    });

    it('Debería rechazar si las contraseñas son solo espacios en blanco', async () => {
      // Arrange
      req.body = {
        passwordactual: '   ',
        passwordnuevo: '   ',
      };

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Debes ingresar las contraseñas',
      });
    });

    it('Debería rechazar si la nueva contraseña es igual a la actual', async () => {
      // Arrange
      req.body = {
        passwordactual: 'samePassword123',
        passwordnuevo: 'samePassword123',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'La nueva contraseña debe ser diferente a la actual',
      });
    });

    it('Debería rechazar nueva contraseña igual ignorando espacios en blanco', async () => {
      // Arrange
      req.body = {
        passwordactual: '  myPassword  ',
        passwordnuevo: 'myPassword',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'La nueva contraseña debe ser diferente a la actual',
      });
    });
  });

  describe('⚠️ Errores del Sistema', () => {
    it('Debería manejar error de base de datos al buscar usuario', async () => {
      // Arrange
      req.body = {
        passwordactual: 'current',
        passwordnuevo: 'new',
      };

      const dbError = new Error('Database error');
      Estudiante.findById.mockRejectedValue(dbError);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error actualizando contraseña',
        })
      );
    });

    it('Debería manejar error al verificar contraseña actual', async () => {
      // Arrange
      req.body = {
        passwordactual: 'current',
        passwordnuevo: 'new',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        matchPassword: jest.fn().mockRejectedValue(new Error('Bcrypt error')),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error actualizando contraseña',
        })
      );
    });

    it('Debería manejar error al encriptar nueva contraseña', async () => {
      // Arrange
      req.body = {
        passwordactual: 'current',
        passwordnuevo: 'new',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        matchPassword: jest.fn().mockResolvedValue(true),
        encrypPassword: jest.fn().mockRejectedValue(new Error('Encryption failed')),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error actualizando contraseña',
        })
      );
    });

    it('Debería manejar error al guardar nueva contraseña', async () => {
      // Arrange
      req.body = {
        passwordactual: 'current',
        passwordnuevo: 'new',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        matchPassword: jest.fn().mockResolvedValue(true),
        encrypPassword: jest.fn().mockResolvedValue('$2b$10$hashedPassword'),
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error actualizando contraseña',
        })
      );
    });

    it('Debería manejar timeout de base de datos', async () => {
      // Arrange
      req.body = {
        passwordactual: 'current',
        passwordnuevo: 'new',
      };

      Estudiante.findById.mockRejectedValue(new Error('Connection timeout'));

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error actualizando contraseña',
        })
      );
    });
  });

  describe('🔒 Seguridad', () => {
    it('No debería permitir cambiar sin verificar contraseña actual', async () => {
      // Arrange
      req.body = {
        passwordactual: 'wrong',
        passwordnuevo: 'hacker123',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        matchPassword: jest.fn().mockResolvedValue(false),
        encrypPassword: jest.fn(),
        save: jest.fn(),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(mockEstudiante.encrypPassword).not.toHaveBeenCalled();
      expect(mockEstudiante.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('No debería exponer información del hash en respuesta', async () => {
      // Arrange
      req.body = {
        passwordactual: 'current123',
        passwordnuevo: 'newSecure456',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        password: '$2b$10$oldHashedPassword',
        matchPassword: jest.fn().mockResolvedValue(true),
        encrypPassword: jest.fn().mockResolvedValue('$2b$10$newHashedPassword'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Password actualizado correctamente',
      });
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          password: expect.any(String),
        })
      );
    });

    it('Debería requerir autenticación previa (req.estudianteBDD)', async () => {
      // Arrange
      req.estudianteBDD = null;
      req.body = {
        passwordactual: 'current',
        passwordnuevo: 'new',
      };

      // Act & Assert
      await expect(async () => {
        await actualizarContraseña(req, res);
      }).rejects.toThrow();
    });
  });

  describe('🎯 Casos Edge', () => {
    it('Debería manejar contraseñas con caracteres especiales', async () => {
      // Arrange
      req.body = {
        passwordactual: 'P@ssw0rd!#$%',
        passwordnuevo: 'N3wP@ss&*()_+',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        matchPassword: jest.fn().mockResolvedValue(true),
        encrypPassword: jest.fn().mockResolvedValue('$2b$10$hashedPassword'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(mockEstudiante.matchPassword).toHaveBeenCalledWith('P@ssw0rd!#$%');
      expect(mockEstudiante.encrypPassword).toHaveBeenCalledWith('N3wP@ss&*()_+');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Debería manejar contraseñas muy largas', async () => {
      // Arrange
      const longPassword = 'A'.repeat(100);
      const newLongPassword = 'B'.repeat(100);

      req.body = {
        passwordactual: longPassword,
        passwordnuevo: newLongPassword,
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        matchPassword: jest.fn().mockResolvedValue(true),
        encrypPassword: jest.fn().mockResolvedValue('$2b$10$hashedPassword'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Debería manejar contraseñas con emojis', async () => {
      // Arrange
      req.body = {
        passwordactual: 'Pass123🔒',
        passwordnuevo: 'NewPass456🔑',
      };

      const mockEstudiante = {
        _id: req.estudianteBDD._id,
        matchPassword: jest.fn().mockResolvedValue(true),
        encrypPassword: jest.fn().mockResolvedValue('$2b$10$hashedPassword'),
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      // Act
      await actualizarContraseña(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
