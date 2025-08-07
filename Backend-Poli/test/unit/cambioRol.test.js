// tests/unit/cambioRol.test.js

const mongoose = require('mongoose');
const { cambioRol } = require('../../src/controllers/adminController.js');

jest.mock('../../src/models/Estudiante.js', () => ({
  findById: jest.fn(),
}));

jest.mock('../../src/models/Producto.js', () => ({
  updateMany: jest.fn(),
}));

jest.mock('../../src/config/nodemailer.js', () => ({
  sendMailToAssignSeller: jest.fn(),
}));

const Estudiante = require('../../src/models/Estudiante.js');
const Producto = require('../../src/models/Producto.js');
const { sendMailToAssignSeller } = require('../../src/config/nodemailer.js');

describe('Controlador cambioRol', () => {

  let req, res;

  beforeEach(() => {
    req = {
      params: { id: '68931c35b03f091a8f1f3bae' },
      body: { rol: 'vendedor' },
      headers: {
        authorization: 'Bearer token_simulado',
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Estudiante.findById.mockReset();
    Producto.updateMany.mockReset();
    sendMailToAssignSeller.mockReset();
  });

  test('400 si no envían rol', async () => {
    req.body.rol = undefined;
    await cambioRol(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Rol es requerido' });
  });

  test('400 si no envían id', async () => {
    req.params.id = undefined;
    await cambioRol(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID de usuario es requerido' });
  });

  test('400 si id no válido', async () => {
    req.params.id = '12345';
    await cambioRol(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID de usuario no válido' });
  });

  test('400 si rol no válido', async () => {
    req.body.rol = 'admin';
    Estudiante.findById.mockResolvedValue({ rol: 'estudiante' });
    await cambioRol(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Rol no válido' });
  });

  test('404 si usuario no encontrado', async () => {
    Estudiante.findById.mockResolvedValue(null);
    await cambioRol(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario no encontrado' });
  });

  test('400 si usuario ya tiene ese rol', async () => {
    Estudiante.findById.mockResolvedValue({ rol: 'vendedor' });
    await cambioRol(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'El usuario ya tiene el rol vendedor' });
  });

  test('actualiza rol a vendedor y activa productos', async () => {
    const mockSave = jest.fn();
    Estudiante.findById.mockResolvedValue({ rol: 'estudiante', email: 'a@b.com', nombre: 'David', save: mockSave });

    Producto.updateMany.mockResolvedValue({});
    await cambioRol(req, res);

    expect(mockSave).toHaveBeenCalled();
    expect(Producto.updateMany).toHaveBeenCalledWith({ vendedor: req.params.id, activo: false }, { $set: { activo: true } });
    expect(sendMailToAssignSeller).toHaveBeenCalledWith('a@b.com', 'David', 'vendedor');
    expect(res.json).toHaveBeenCalledWith({ msg: 'Rol actualizado correctamente' });
  });

  test('actualiza rol a estudiante y desactiva productos', async () => {
    const mockSave = jest.fn();
    req.body.rol = 'estudiante';
    Estudiante.findById.mockResolvedValue({ rol: 'vendedor', email: 'a@b.com', nombre: 'David', save: mockSave });

    Producto.updateMany.mockResolvedValue({});
    await cambioRol(req, res);

    expect(mockSave).toHaveBeenCalled();
    expect(Producto.updateMany).toHaveBeenCalledWith({ vendedor: req.params.id, activo: true }, { $set: { activo: false } });
    expect(sendMailToAssignSeller).toHaveBeenCalledWith('a@b.com', 'David', 'estudiante');
    expect(res.json).toHaveBeenCalledWith({ msg: 'Rol actualizado correctamente' });
  });

});
