import { perfil, actualizarPerfil } from '../../../src/controllers/usuarios/perfilController.js';
import Estudiante from '../../../src/models/Estudiante.js';

jest.mock('../../../src/models/Estudiante.js');

describe('Gestión de Perfil de Usuario', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {},
      body: {},
      estudianteBDD: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('Obtener Perfil', () => {
    it('Debería retornar datos del perfil sin campos sensibles', async () => {
      req.estudianteBDD = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@epn.edu.ec',
        telefono: '0987654321',
        direccion: 'Quito',
        rol: 'estudiante',
        token: 'secretToken',
        emailConfirmado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      };

      await perfil(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@epn.edu.ec',
        telefono: '0987654321',
        direccion: 'Quito',
        rol: 'estudiante'
      });
    });

    it('Debería manejar error al obtener perfil', async () => {
      req.estudianteBDD = null;

      await perfil(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error obteniendo perfil'
        })
      );
    });
  });

  describe('Actualizar Perfil', () => {
    it('Debería actualizar todos los campos correctamente', async () => {
      req.params.id = '507f1f77bcf86cd799439012';
      req.body = {
        nombre: 'Carlos',
        apellido: 'López',
        telefono: '0999888777',
        direccion: 'Guayaquil',
        email: 'carlos.nuevo@epn.edu.ec'
      };

      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439012',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@epn.edu.ec',
        telefono: '0987654321',
        direccion: 'Quito',
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);
      Estudiante.findOne.mockResolvedValue(null);

      await actualizarPerfil(req, res);

      expect(mockEstudiante.nombre).toBe('Carlos');
      expect(mockEstudiante.apellido).toBe('López');
      expect(mockEstudiante.telefono).toBe('0999888777');
      expect(mockEstudiante.direccion).toBe('Guayaquil');
      expect(mockEstudiante.email).toBe('carlos.nuevo@epn.edu.ec');
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Debería rechazar ID inválido', async () => {
      req.params.id = 'invalid-id';
      req.body = { nombre: 'Pedro' };

      await actualizarPerfil(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Lo sentimos, ID no válido' });
    });

    it('Debería rechazar usuario inexistente', async () => {
      req.params.id = '507f1f77bcf86cd799439013';
      req.body = { nombre: 'Ana' };

      Estudiante.findById.mockResolvedValue(null);

      await actualizarPerfil(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Lo sentimos, no existe el estudiante 507f1f77bcf86cd799439013'
      });
    });

    it('Debería rechazar email duplicado', async () => {
      req.params.id = '507f1f77bcf86cd799439014';
      req.body = {
        email: 'duplicado@epn.edu.ec'
      };

      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439014',
        email: 'original@epn.edu.ec'
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);
      Estudiante.findOne.mockResolvedValue({ email: 'duplicado@epn.edu.ec' });

      await actualizarPerfil(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Lo sentimos, el email ya se encuentra registrado'
      });
    });

    it('Debería permitir actualizar sin cambiar email', async () => {
      req.params.id = '507f1f77bcf86cd799439015';
      req.body = {
        nombre: 'María',
        email: 'maria@epn.edu.ec'
      };

      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439015',
        email: 'maria@epn.edu.ec',
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      await actualizarPerfil(req, res);

      expect(mockEstudiante.nombre).toBe('María');
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Debería hacer trim de espacios en campos de texto', async () => {
      req.params.id = '507f1f77bcf86cd799439016';
      req.body = {
        nombre: '  Diego  ',
        apellido: '  Torres  ',
        telefono: '  0987654321  ',
        direccion: '  Cuenca  '
      };

      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439016',
        email: 'diego@epn.edu.ec',
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      await actualizarPerfil(req, res);

      expect(mockEstudiante.nombre).toBe('Diego');
      expect(mockEstudiante.apellido).toBe('Torres');
      expect(mockEstudiante.telefono).toBe('0987654321');
      expect(mockEstudiante.direccion).toBe('Cuenca');
    });

    it('Debería ignorar campos vacíos y solo actualizar campos con valor', async () => {
      req.params.id = '507f1f77bcf86cd799439017';
      req.body = {
        nombre: 'Rosa',
        apellido: '',
        telefono: '   ',
        direccion: 'Ambato'
      };

      const mockEstudiante = {
        _id: '507f1f77bcf86cd799439017',
        nombre: 'Original',
        apellido: 'Apellido',
        telefono: '0999999999',
        direccion: 'Original',
        email: 'rosa@epn.edu.ec',
        save: jest.fn().mockResolvedValue(true)
      };

      Estudiante.findById.mockResolvedValue(mockEstudiante);

      await actualizarPerfil(req, res);

      expect(mockEstudiante.nombre).toBe('Rosa');
      expect(mockEstudiante.apellido).toBe('Apellido'); // No cambió
      expect(mockEstudiante.telefono).toBe('0999999999'); // No cambió
      expect(mockEstudiante.direccion).toBe('Ambato');
    });
  });
});
