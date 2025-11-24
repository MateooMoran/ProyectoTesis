import { crearProducto } from '../../../../src/controllers/vendedor/productoController.js';
import Producto from '../../../../src/models/Producto.js';
import Categoria from '../../../../src/models/Categoria.js';
import { generarEmbedding } from '../../../../src/utils/embeddings.js';
import cloudinary from 'cloudinary';
import fs from 'fs-extra';

jest.mock('../../../../src/models/Producto.js');
jest.mock('../../../../src/models/Categoria.js');
jest.mock('../../../../src/utils/embeddings.js');
jest.mock('cloudinary', () => ({ v2: { uploader: { upload: jest.fn(), upload_stream: jest.fn(), destroy: jest.fn() } } }));
jest.mock('fs-extra', () => ({ pathExists: jest.fn(), unlink: jest.fn() }));

describe('Vendedor - Crear Producto', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, estudianteBDD: { _id: 'vend1' }, files: undefined };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería crear producto correctamente (éxito)', async () => {
    req.body = { nombreProducto: 'Pantalón', categoria: '507f1f77bcf86cd799439011', descripcion: 'Bonito', precio: 1200, stock: 20 };

    Categoria.findById = jest.fn().mockResolvedValue({ _id: req.body.categoria });
    Producto.findOne = jest.fn().mockResolvedValue(null);
    generarEmbedding.mockResolvedValue([0.1, 0.2]);
    // Mock constructor and capture passed data
    let createdData = null;
    Producto.mockImplementation((data) => {
      createdData = data;
      return { ...data, save: jest.fn().mockResolvedValue(true) };
    });

    await crearProducto(req, res);

    expect(Categoria.findById).toHaveBeenCalledWith(req.body.categoria);
    expect(Producto.findOne).toHaveBeenCalledWith({ nombreProducto: req.body.nombreProducto.trim() });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto creado correctamente' });
    // Verificar que el constructor recibió precio, stock y vendedor correctos
    expect(createdData).not.toBeNull();
    expect(createdData.precio).toBe(1200);
    expect(createdData.stock).toBe(20);
    expect(createdData.vendedor).toBe(req.estudianteBDD._id);
  });

  it('Debería crear producto subiendo imagen normal (éxito)', async () => {
    req.body = { nombreProducto: 'Camisa', categoria: '507f1f77bcf86cd799439011', descripcion: 'Bonita', precio: 25, stock: 50 };
    req.files = { imagen: { tempFilePath: 'tmp/cam.jpg' } };

    Categoria.findById = jest.fn().mockResolvedValue({ _id: req.body.categoria });
    Producto.findOne = jest.fn().mockResolvedValue(null);
    generarEmbedding.mockResolvedValue([0.1, 0.2]);
    // cloudinary upload
    const cloud = cloudinary.v2;
    cloud.uploader.upload.mockResolvedValue({ secure_url: 'http://img.cam', public_id: 'img123' });
    fs.pathExists.mockResolvedValue(true);
    fs.unlink.mockResolvedValue();

    let createdDataImg = null;
    Producto.mockImplementation((data) => {
      createdDataImg = data;
      return { ...data, save: jest.fn().mockResolvedValue(true) };
    });

    await crearProducto(req, res);

    expect(cloud.uploader.upload).toHaveBeenCalled();
    expect(fs.pathExists).toHaveBeenCalledWith('tmp/cam.jpg');
    expect(fs.unlink).toHaveBeenCalledWith('tmp/cam.jpg');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto creado correctamente' });
    expect(createdDataImg).not.toBeNull();
    expect(createdDataImg.precio).toBe(25);
    expect(createdDataImg.stock).toBe(50);
    expect(createdDataImg.vendedor).toBe(req.estudianteBDD._id);
  });

  it('Debería crear producto con imagen IA (éxito)', async () => {
    req.body = { nombreProducto: 'Zapato', categoria: '507f1f77bcf86cd799439011', descripcion: 'Cómodo', imagenIA: 'data:image/png;base64,AAA', precio: 80, stock: 10 };

    Categoria.findById = jest.fn().mockResolvedValue({ _id: req.body.categoria });
    Producto.findOne = jest.fn().mockResolvedValue(null);
    generarEmbedding.mockResolvedValue([0.1, 0.2]);

    const cloud = cloudinary.v2;
    cloud.uploader.upload_stream.mockImplementation((opts, cb) => {
      // directly call callback with fake response and return a stream-like object
      cb(null, { secure_url: 'http://ia.img', public_id: 'ia123' });
      return { end: jest.fn() };
    });

    let createdDataIA = null;
    Producto.mockImplementation((data) => {
      createdDataIA = data;
      return { ...data, save: jest.fn().mockResolvedValue(true) };
    });

    await crearProducto(req, res);

    expect(cloud.uploader.upload_stream).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto creado correctamente' });
    expect(createdDataIA).not.toBeNull();
    expect(createdDataIA.precio).toBe(80);
    expect(createdDataIA.stock).toBe(10);
    expect(createdDataIA.vendedor).toBe(req.estudianteBDD._id);
  });

  it('Debería crear producto cuando se envía `imagen` como URL en el body', async () => {
    const url = 'https://cdn.example.com/productos/laptop.jpg';
    req.body = {
      nombreProducto: 'Laptop HP',
      precio: 500,
      stock: 10,
      descripcion: 'Laptop nueva',
      categoria: '507f1f77bcf86cd799439011',
      imagen: url
    };

    Categoria.findById = jest.fn().mockResolvedValue({ _id: req.body.categoria });
    Producto.findOne = jest.fn().mockResolvedValue(null);
    generarEmbedding.mockResolvedValue([0.2, 0.3]);

    let createdDataUrl = null;
    Producto.mockImplementation((data) => {
      createdDataUrl = data;
      return { ...data, save: jest.fn().mockResolvedValue(true) };
    });

    await crearProducto(req, res);

    expect(Categoria.findById).toHaveBeenCalledWith(req.body.categoria);
    expect(Producto.findOne).toHaveBeenCalledWith({ nombreProducto: req.body.nombreProducto.trim() });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto creado correctamente' });
    expect(createdDataUrl).not.toBeNull();
    expect(createdDataUrl.precio).toBe(500);
    expect(createdDataUrl.stock).toBe(10);
    expect(createdDataUrl.imagen).toBe(url);
    expect(createdDataUrl.vendedor).toBe(req.estudianteBDD._id);
  });

  it('Debería rechazar ID de categoría inválido (validación)', async () => {
    req.body = { nombreProducto: 'Pantalón', categoria: 'invalid-id' };

    await crearProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID de categoría no válido' });
  });

  it('Debería rechazar categoría inexistente (validación)', async () => {
    req.body = { nombreProducto: 'Pantalón', categoria: '507f1f77bcf86cd799439011' };
    Categoria.findById = jest.fn().mockResolvedValue(null);

    await crearProducto(req, res);

    expect(Categoria.findById).toHaveBeenCalledWith(req.body.categoria);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'La categoría proporcionada no existe' });
  });

  it('Debería rechazar nombre duplicado (validación)', async () => {
    req.body = { nombreProducto: 'Pantalón', categoria: '507f1f77bcf86cd799439011' };
    Categoria.findById = jest.fn().mockResolvedValue({ _id: req.body.categoria });
    Producto.findOne = jest.fn().mockResolvedValue({ _id: 'p1' });

    await crearProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Ya existe un producto con ese nombre' });
  });
});
