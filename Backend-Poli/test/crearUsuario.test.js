jest.mock('nodemailer');

import { registro } from '../src/controllers/usuarioController.js';
import Estudiante from '../src/models/Estudiante.js';

describe('crearUsuario', () => {
  afterAll(async () => {
    await Estudiante.deleteMany({ email: "davidroyale123m@gmail.com" });
  });

  it('debería crear un usuario correctamente', async () => {
    const req = {
      body: {
        nombre: "David",
        apellido: "Manuelita",
        telefono: "0939939395",
        direccion: "La Manuelita Saenz",
        email: "davidroyale123m@gmail.com",
        password: "abcd"
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await registro(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: "Registro exitoso, revisa tu correo para confirmar tu cuenta"
    }));

    const usuarioBD = await Estudiante.findOne({ email: "davidroyale123m@gmail.com" });
    expect(usuarioBD).not.toBeNull();
    expect(usuarioBD.nombre).toBe("David");
    expect(usuarioBD.apellido).toBe("Manuelita");
  });
});
