import { obtenerUsuarios } from '../../../../src/controllers/administrador/usuariosController.js';
import Estudiante from '../../../../src/models/Estudiante.js';

jest.mock('../../../../src/models/Estudiante.js');

describe('Administrador - Obtener lista de usuarios', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Obtiene lista de usuarios correctamente', async () => {
    const mockUsers = [
      { _id: '1', nombre: 'Juan', apellido: 'Pérez', rol: 'estudiante', estado: true },
      { _id: '2', nombre: 'María', apellido: 'García', rol: 'vendedor', estado: true }
    ];
    Estudiante.find.mockReturnValue({
      select: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(mockUsers) })
    });

    await obtenerUsuarios(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

  it('Rechaza si no hay usuarios registrados', async () => {
    Estudiante.find.mockReturnValue({
      select: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) })
    });

    await obtenerUsuarios(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No hay estudiantes registrados' });
  });

  it('Maneja error de base de datos al obtener usuarios', async () => {
    Estudiante.find.mockReturnValue({
      select: jest.fn().mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('DB error')) })
    });

    await obtenerUsuarios(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error obteniendo usuarios' }));
  });

  it('Filtra correctamente por rol estudiante o vendedor', async () => {
    const mockUsers = [{ _id: '3', nombre: 'Ana', rol: 'estudiante' }];
    Estudiante.find.mockReturnValue({
      select: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(mockUsers) })
    });

    await obtenerUsuarios(req, res);

    expect(Estudiante.find).toHaveBeenCalledWith({ rol: { $in: ['estudiante', 'vendedor'] } });
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

  it('Ordena correctamente la lista de usuarios', async () => {
    const mockUsers = [
      { _id: '4', nombre: 'Carlos', rol: 'vendedor' },
      { _id: '5', nombre: 'Beatriz', rol: 'estudiante' }
    ];
    const sortMock = jest.fn().mockResolvedValue(mockUsers);
    Estudiante.find.mockReturnValue({ select: jest.fn().mockReturnValue({ sort: sortMock }) });

    await obtenerUsuarios(req, res);

    expect(sortMock).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });
});
