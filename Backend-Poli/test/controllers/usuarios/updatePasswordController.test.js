import { actualizarContraseña } from '../../../src/controllers/usuarios/perfilController.js';
import Estudiante from '../../../src/models/Estudiante.js';

jest.mock('../../../src/models/Estudiante.js');

describe('🔒 Actualización de Contraseña', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: { id: '507f1f77bcf86cd799439011' },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('✅ Actualización Exitosa', () => {
    it('Debería actualizar contraseña correctamente', async () => {
      req.body = {
        passwordactual: 'current123',
        passwordnuevo: 'newSecure456'
      };

      const mockEstudiante = {
        _id: req.params.id,
        matchPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      await actualizarContraseña(req, res);

      expect(Estudiante.findById).toHaveBeenCalledWith(req.params.id);
      expect(mockEstudiante.matchPassword).toHaveBeenCalledWith('current123');
      expect(mockEstudiante.password).toBe('newSecure456');
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Contraseña actualizada correctamente' });
    });

    it('Debería asignar contraseña directamente sin encriptar en controlador', async () => {
      req.body = {
        passwordactual: 'old123',
        passwordnuevo: 'new456'
      };

      const mockEstudiante = {
        _id: req.params.id,
        matchPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      await actualizarContraseña(req, res);

      expect(mockEstudiante.password).toBe('new456');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Debería permitir contraseñas con espacios en blanco', async () => {
      req.body = {
        passwordactual: '  pass123  ',
        passwordnuevo: '  newpass456  '
      };

      const mockEstudiante = {
        _id: req.params.id,
        matchPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      await actualizarContraseña(req, res);

      expect(mockEstudiante.matchPassword).toHaveBeenCalledWith('  pass123  ');
      expect(mockEstudiante.password).toBe('  newpass456  ');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('❌ Errores de Validación', () => {
    it('Debería rechazar ID inválido', async () => {
      req.params.id = 'invalid-id';
      req.body = {
        passwordactual: 'current',
        passwordnuevo: 'new'
      };

      await actualizarContraseña(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'El ID proporcionado no es válido' });
    });

    it('Debería rechazar usuario inexistente', async () => {
      req.body = {
        passwordactual: 'current',
        passwordnuevo: 'new'
      };

      Estudiante.findById.mockResolvedValue(null);

      await actualizarContraseña(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        msg: `No se encontró ningún estudiante con el ID ${req.params.id}`
      });
    });

    it('Debería rechazar contraseña actual incorrecta', async () => {
      req.body = {
        passwordactual: 'wrongPassword',
        passwordnuevo: 'newPassword123'
      };

      const mockEstudiante = {
        _id: req.params.id,
        matchPassword: jest.fn().mockResolvedValue(false)
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      await actualizarContraseña(req, res);

      expect(mockEstudiante.matchPassword).toHaveBeenCalledWith('wrongPassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'La contraseña actual es incorrecta' });
    });

    it('Debería rechazar nueva contraseña igual a la actual', async () => {
      req.body = {
        passwordactual: 'samePassword123',
        passwordnuevo: 'samePassword123'
      };

      const mockEstudiante = {
        _id: req.params.id,
        matchPassword: jest.fn().mockResolvedValue(true)
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      await actualizarContraseña(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'La nueva contraseña no puede ser igual a la actual'
      });
    });
  });

  describe('⚠️ Errores del Sistema', () => {
    it('Debería manejar error de base de datos al buscar usuario', async () => {
      req.body = {
        passwordactual: 'current',
        passwordnuevo: 'new'
      };

      Estudiante.findById.mockRejectedValue(new Error('Database error'));

      await actualizarContraseña(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error al actualizar la contraseña'
        })
      );
    });

    it('Debería manejar error al guardar nueva contraseña', async () => {
      req.body = {
        passwordactual: 'current',
        passwordnuevo: 'new'
      };

      const mockEstudiante = {
        _id: req.params.id,
        matchPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockRejectedValue(new Error('Save failed'))
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      await actualizarContraseña(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error al actualizar la contraseña'
        })
      );
    });
  });
});
