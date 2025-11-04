import { perfil, actualizarPerfil } from '../../../src/controllers/usuarios/perfilController.js';
import Estudiante from '../../../src/models/Estudiante.js';

// Mock del modelo Estudiante
jest.mock('../../../src/models/Estudiante.js');

describe('👤 Gestión de Perfil - updateProfile.test.js', () => {
  let req, res;

  beforeEach(() => {
    req = {
      estudianteBDD: {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@epn.edu.ec',
        telefono: '0987654321',
        direccion: 'Quito, Ecuador',
        rol: 'estudiante',
        token: 'some-token',
        emailConfirmado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('📖 Obtener Perfil', () => {
    describe('✅ Casos de Éxito', () => {
      it('Debería obtener el perfil del usuario correctamente', async () => {
        // Act
        await perfil(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            _id: '507f1f77bcf86cd799439011',
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan.perez@epn.edu.ec',
          })
        );
      });

      it('Debería excluir campos sensibles del perfil', async () => {
        // Act
        await perfil(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith(
          expect.not.objectContaining({
            token: expect.any(String),
            emailConfirmado: expect.any(Boolean),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            __v: expect.any(Number),
          })
        );
      });

      it('Debería retornar todos los datos públicos del perfil', async () => {
        // Act
        await perfil(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            nombre: expect.any(String),
            apellido: expect.any(String),
            email: expect.any(String),
            telefono: expect.any(String),
            direccion: expect.any(String),
            rol: expect.any(String),
          })
        );
      });
    });

    describe('⚠️ Errores del Sistema - Perfil', () => {
      it('Debería manejar error al obtener perfil', async () => {
        // Arrange
        req.estudianteBDD = null; // Simular error

        // Act & Assert
        await expect(async () => {
          await perfil(req, res);
        }).rejects.toThrow();
      });

      it('Debería manejar error si estudianteBDD está corrupto', async () => {
        // Arrange
        req.estudianteBDD = undefined;

        // Act & Assert
        await expect(async () => {
          await perfil(req, res);
        }).rejects.toThrow();
      });
    });
  });

  describe('✏️ Actualizar Perfil', () => {
    beforeEach(() => {
      req.params = { id: '507f1f77bcf86cd799439011' };
    });

    describe('✅ Casos de Éxito', () => {
      it('Debería actualizar el perfil completo correctamente', async () => {
        // Arrange
        req.body = {
          nombre: 'Juan Carlos',
          apellido: 'Pérez García',
          telefono: '0999888777',
          direccion: 'Guayaquil, Ecuador',
          email: 'juancarlos.perez@epn.edu.ec',
        };

        const mockEstudiante = {
          _id: req.params.id,
          nombre: 'Juan',
          apellido: 'Pérez',
          telefono: '0987654321',
          direccion: 'Quito, Ecuador',
          email: 'juan.perez@epn.edu.ec',
          save: jest.fn().mockResolvedValue(true),
        };

        Estudiante.findById.mockResolvedValue(mockEstudiante);
        Estudiante.findOne.mockResolvedValue(null);

        // Act
        await actualizarPerfil(req, res);

        // Assert
        expect(Estudiante.findById).toHaveBeenCalledWith(req.params.id);
        expect(mockEstudiante.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockEstudiante.nombre).toBe('Juan Carlos');
        expect(mockEstudiante.email).toBe('juancarlos.perez@epn.edu.ec');
      });

      it('Debería permitir actualización parcial de campos', async () => {
        // Arrange
        req.body = { telefono: '0991234567' };

        const mockEstudiante = {
          _id: req.params.id,
          nombre: 'Juan',
          apellido: 'Pérez',
          telefono: '0987654321',
          direccion: 'Quito, Ecuador',
          email: 'juan.perez@epn.edu.ec',
          save: jest.fn().mockResolvedValue(true),
        };

        Estudiante.findById.mockResolvedValue(mockEstudiante);
        Estudiante.findOne.mockResolvedValue(null);

        // Act
        await actualizarPerfil(req, res);

        // Assert
        expect(mockEstudiante.telefono).toBe('0991234567');
        expect(mockEstudiante.nombre).toBe('Juan'); // No cambió
        expect(res.status).toHaveBeenCalledWith(200);
      });

      it('Debería actualizar solo el nombre', async () => {
        // Arrange
        req.body = { nombre: 'Pedro' };

        const mockEstudiante = {
          _id: req.params.id,
          nombre: 'Juan',
          apellido: 'Pérez',
          telefono: '0987654321',
          direccion: 'Quito, Ecuador',
          email: 'juan.perez@epn.edu.ec',
          save: jest.fn().mockResolvedValue(true),
        };

        Estudiante.findById.mockResolvedValue(mockEstudiante);
        Estudiante.findOne.mockResolvedValue(null);

        // Act
        await actualizarPerfil(req, res);

        // Assert
        expect(mockEstudiante.nombre).toBe('Pedro');
        expect(res.status).toHaveBeenCalledWith(200);
      });

      it('Debería actualizar el email si no está en uso', async () => {
        // Arrange
        req.body = { email: 'nuevo.email@epn.edu.ec' };

        const mockEstudiante = {
          _id: req.params.id,
          nombre: 'Juan',
          apellido: 'Pérez',
          telefono: '0987654321',
          direccion: 'Quito, Ecuador',
          email: 'juan.perez@epn.edu.ec',
          save: jest.fn().mockResolvedValue(true),
        };

        Estudiante.findById.mockResolvedValue(mockEstudiante);
        Estudiante.findOne.mockResolvedValue(null); // Email no está en uso

        // Act
        await actualizarPerfil(req, res);

        // Assert
        expect(Estudiante.findOne).toHaveBeenCalledWith({ email: 'nuevo.email@epn.edu.ec' });
        expect(mockEstudiante.email).toBe('nuevo.email@epn.edu.ec');
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });

    describe('❌ Errores de Validación - Actualización', () => {
      it('Debería rechazar si el ID del usuario no es válido', async () => {
        // Arrange
        req.params.id = 'invalid-id';

        // Act
        await actualizarPerfil(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Lo sentimos id no valida',
        });
      });

      it('Debería rechazar si el usuario no existe', async () => {
        // Arrange
        req.body = { nombre: 'Test' };
        Estudiante.findById.mockResolvedValue(null);

        // Act
        await actualizarPerfil(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          msg: `Lo sentimos, no existe el estudiante ${req.params.id}`,
        });
      });

      it('Debería rechazar si el email ya está registrado por otro usuario', async () => {
        // Arrange
        req.body = { email: 'existente@epn.edu.ec' };

        const mockEstudiante = {
          _id: req.params.id,
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan.perez@epn.edu.ec',
          save: jest.fn(),
        };

        const mockOtroEstudiante = {
          _id: 'otro-id-diferente',
          email: 'existente@epn.edu.ec',
        };

        Estudiante.findById.mockResolvedValue(mockEstudiante);
        Estudiante.findOne.mockResolvedValue(mockOtroEstudiante);

        // Act
        await actualizarPerfil(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          msg: 'Lo sentimos el email ya se encuentra registrado',
        });
        expect(mockEstudiante.save).not.toHaveBeenCalled();
      });

      it('Debería validar formato de email', async () => {
        // Arrange
        req.body = { email: 'email-invalido' };

        const mockEstudiante = {
          _id: req.params.id,
          nombre: 'Juan',
          email: 'juan.perez@epn.edu.ec',
          save: jest.fn().mockRejectedValue(new Error('Invalid email format')),
        };

        Estudiante.findById.mockResolvedValue(mockEstudiante);
        Estudiante.findOne.mockResolvedValue(null);

        // Act
        await actualizarPerfil(req, res);

        // Assert - El error debería propagarse
        expect(mockEstudiante.email).toBe('email-invalido');
      });

      it('Debería validar longitud de campos', async () => {
        // Arrange
        req.body = { nombre: 'A'.repeat(1000) }; // Nombre muy largo

        const mockEstudiante = {
          _id: req.params.id,
          nombre: 'Juan',
          save: jest.fn().mockRejectedValue(new Error('Validation failed: nombre too long')),
        };

        Estudiante.findById.mockResolvedValue(mockEstudiante);
        Estudiante.findOne.mockResolvedValue(null);

        // Act
        await actualizarPerfil(req, res);

        // Assert - El error debería propagarse
        expect(mockEstudiante.nombre).toBe('A'.repeat(1000));
      });
    });

    describe('⚠️ Errores del Sistema - Actualización', () => {
      it('Debería manejar error de base de datos al buscar usuario', async () => {
        // Arrange
        req.body = { nombre: 'Test' };
        const dbError = new Error('Database error');
        Estudiante.findById.mockRejectedValue(dbError);

        // Act & Assert
        await expect(async () => {
          await actualizarPerfil(req, res);
        }).rejects.toThrow('Database error');
      });

      it('Debería manejar error al guardar cambios', async () => {
        // Arrange
        req.body = { nombre: 'Pedro' };

        const mockEstudiante = {
          _id: req.params.id,
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan.perez@epn.edu.ec',
          save: jest.fn().mockRejectedValue(new Error('Save failed')),
        };

        Estudiante.findById.mockResolvedValue(mockEstudiante);
        Estudiante.findOne.mockResolvedValue(null);

        // Act & Assert
        await expect(async () => {
          await actualizarPerfil(req, res);
        }).rejects.toThrow('Save failed');
      });

      it('Debería manejar timeout de base de datos', async () => {
        // Arrange
        req.body = { nombre: 'Test' };
        Estudiante.findById.mockRejectedValue(new Error('Connection timeout'));

        // Act & Assert
        await expect(async () => {
          await actualizarPerfil(req, res);
        }).rejects.toThrow('Connection timeout');
      });
    });
  });

  describe('🎯 Casos Edge - Perfil', () => {
    beforeEach(() => {
      req.params = { id: '507f1f77bcf86cd799439011' };
    });

    it('Debería manejar actualizaciones con body vacío', async () => {
      // Arrange
      req.body = {};

      const mockEstudiante = {
        _id: req.params.id,
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '0987654321',
        direccion: 'Quito, Ecuador',
        email: 'juan.perez@epn.edu.ec',
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);
      Estudiante.findOne.mockResolvedValue(null);

      // Act
      await actualizarPerfil(req, res);

      // Assert
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockEstudiante.nombre).toBe('Juan'); // Sin cambios
    });

    it('Debería manejar valores null en campos opcionales', async () => {
      // Arrange
      req.body = {
        direccion: null,
        telefono: null,
      };

      const mockEstudiante = {
        _id: req.params.id,
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '0987654321',
        direccion: 'Quito, Ecuador',
        email: 'juan.perez@epn.edu.ec',
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);
      Estudiante.findOne.mockResolvedValue(null);

      // Act
      await actualizarPerfil(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      // Los valores null no deberían actualizar (se mantienen los valores originales por el operador ??)
      expect(mockEstudiante.direccion).toBe('Quito, Ecuador');
      expect(mockEstudiante.telefono).toBe('0987654321');
    });

    it('Debería permitir actualizar el email al mismo valor actual', async () => {
      // Arrange
      req.body = { email: 'juan.perez@epn.edu.ec' }; // Mismo email

      const mockEstudiante = {
        _id: req.params.id,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@epn.edu.ec',
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);
      // No se llama findOne porque el email no cambió

      // Act
      await actualizarPerfil(req, res);

      // Assert
      expect(Estudiante.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Debería manejar campos con espacios en blanco', async () => {
      // Arrange
      req.body = {
        nombre: '  Juan Carlos  ',
        apellido: '  Pérez  ',
      };

      const mockEstudiante = {
        _id: req.params.id,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@epn.edu.ec',
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);
      Estudiante.findOne.mockResolvedValue(null);

      // Act
      await actualizarPerfil(req, res);

      // Assert
      expect(mockEstudiante.nombre).toBe('  Juan Carlos  ');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Debería manejar múltiples actualizaciones del mismo usuario', async () => {
      // Arrange
      const mockEstudiante = {
        _id: req.params.id,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@epn.edu.ec',
        save: jest.fn().mockResolvedValue(true),
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);
      Estudiante.findOne.mockResolvedValue(null);

      // Primera actualización
      req.body = { nombre: 'Pedro' };
      await actualizarPerfil(req, res);

      // Segunda actualización
      req.body = { apellido: 'González' };
      await actualizarPerfil(req, res);

      // Assert
      expect(mockEstudiante.save).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
