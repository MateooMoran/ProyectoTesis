// Mockea fs-extra y cloudinary ANTES de cualquier import que los use
jest.mock('fs-extra', () => ({
  unlink: jest.fn().mockResolvedValue(),
}));

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://mockedurl.com/image.jpg',
        public_id: 'mocked_public_id',
      }),
      upload_stream: jest.fn((opts, cb) => {
        process.nextTick(() => cb(null, { secure_url: 'https://mockedurl.com/imageIA.jpg' }));
        return { end: () => {} };
      }),
    },
  },
}));

import mongoose from 'mongoose';
import Producto from '../../src/models/Producto.js';
import { crearProducto } from '../../src/controllers/vendedorController.js';

describe('Controlador crearProducto', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        nombreProducto: "Mouse",
        precio: 12,
        stock: 5,
        descripcion: "El mejor mouse economico",
        categoria: new mongoose.Types.ObjectId().toString(),
        imagenIA: null,
      },
      estudianteBDD: { _id: new mongoose.Types.ObjectId() },
      files: {
        imagen: { tempFilePath: '/temp/path/to/image.jpg' }
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('debería crear un producto correctamente', async () => {
    Producto.prototype.save = jest.fn().mockResolvedValue();

    await crearProducto(req, res);

    const fs = require('fs-extra');
    const cloudinary = require('cloudinary').v2;

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith('/temp/path/to/image.jpg', { folder: 'ImagenesProductos' });
    expect(fs.unlink).toHaveBeenCalledWith('/temp/path/to/image.jpg');
    expect(Producto.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: "Producto creado correctamente" });
  });

  it('debería devolver error si falta algún campo', async () => {
    req.body.nombreProducto = "";

    await crearProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: "Debe llenar todo los campo" });
  });

  it('debería devolver error si categoría es inválida', async () => {
    req.body.categoria = "123invalidid";

    await crearProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID de categoría no válido' });
  });

  it('debería devolver error si precio es negativo', async () => {
    req.body.precio = -10;

    await crearProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: "Precio y stock deben ser positivos" });
  });

  it('debería devolver error si stock es negativo', async () => {
    req.body.stock = -5;

    await crearProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: "Precio y stock deben ser positivos" });
  });

  it('no debería subir ni eliminar imagen si no hay imagen', async () => {
    delete req.files;

    Producto.prototype.save = jest.fn().mockResolvedValue();

    await crearProducto(req, res);

    const fs = require('fs-extra');
    const cloudinary = require('cloudinary').v2;

    expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
    expect(fs.unlink).not.toHaveBeenCalled();
    expect(Producto.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: "Producto creado correctamente" });
  });

  it('debería subir imagenIA cuando se proporciona imagen base64 válida', async () => {
    Producto.prototype.save = jest.fn().mockResolvedValue();

    // Simula imagenIA base64 (una cadena corta para test)
    req.body.imagenIA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';

    await crearProducto(req, res);

    const cloudinary = require('cloudinary').v2;

    expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
    expect(Producto.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: "Producto creado correctamente" });
  });

  it('debería manejar error si imagenIA tiene formato inválido y no crashea', async () => {
    Producto.prototype.save = jest.fn().mockResolvedValue();

    // Cadena no base64 válida
    req.body.imagenIA = 'invalid_base64_data';

    await crearProducto(req, res);

    // Debería crear producto igual pero no subir imagenIA, o si tu código lanza error, lo capturas con try/catch

    expect(Producto.prototype.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: "Producto creado correctamente" });
  });
});
