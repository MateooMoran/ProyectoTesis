// test/unit/crearCarrito.test.js
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    charges: { create: jest.fn() },
    customers: { create: jest.fn() },
  }));
});

const mongoose = require('mongoose');
const { crearCarrito } = require('../../src/controllers/estudianteController');

// Mock explícito del constructor Carrito como clase
jest.mock('../../src/models/Carrito', () => jest.fn());

const Carrito = require('../../src/models/Carrito');

// Mock explícito del modelo Producto
const mockSelect = jest.fn();
jest.mock('../../src/models/Producto', () => ({
  findById: jest.fn(() => ({ select: mockSelect }))
}));
const Producto = require('../../src/models/Producto');

const mockSave = jest.fn();
const mockEstudiante = { _id: new mongoose.Types.ObjectId('64f61feff14b4e10e0d97e34') };

describe('Controlador crearCarrito', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      estudianteBDD: mockEstudiante
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Carrito.findOne = jest.fn();
    mockSelect.mockReset();
    mockSave.mockReset();
  });

  test('400 si producto o cantidad inválida', async () => {
    req.body.productos = [{ producto: null, cantidad: 0 }];

    await crearCarrito(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto o cantidad inválida' });
  });

  test('400 si id de producto inválido', async () => {
    req.body.productos = [{ producto: '123', cantidad: 1 }];

    await crearCarrito(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID de producto inválido: 123' });
  });

  test('404 si producto no existe o inactivo', async () => {
    req.body.productos = [{ producto: '6892c7231efa4dd416c654b2', cantidad: 1 }];
    Carrito.findOne.mockResolvedValue(null);
    mockSelect.mockReturnValue(null);

    await crearCarrito(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      msg: expect.stringContaining('no encontrado')
    });
  });

  test('400 si cantidad supera stock', async () => {
    req.body.productos = [{ producto: '6892c7231efa4dd416c654b2', cantidad: 10 }];
    Carrito.findOne.mockResolvedValue(null);
    mockSelect.mockReturnValue({
      stock: 5,
      precio: 100,
      activo: true
    });

    await crearCarrito(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      msg: expect.stringContaining('Stock no disponible')
    });
  });

  test('Crea carrito nuevo y agrega productos correctamente', async () => {
    req.body.productos = [
      { producto: '6892c7231efa4dd416c654b2', cantidad: 2 },
      { producto: '6892c6ba1efa4dd416c654a9', cantidad: 1 }
    ];

    Carrito.findOne.mockResolvedValue(null);

    const carritoMock = {
      productos: [],
      total: 0,
      save: mockSave
    };

    Carrito.mockImplementation(() => carritoMock);

    mockSelect.mockReturnValue({
      stock: 100,
      precio: 50,
      activo: true
    });

    await crearCarrito(req, res);

    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Carrito actualizado correctamente',
      carrito: carritoMock
    });
  });

  test('Agrega productos a carrito existente', async () => {
    req.body.productos = [
      { producto: '6892c7231efa4dd416c654b2', cantidad: 2 },
      { producto: '6892c6ba1efa4dd416c654a9', cantidad: 1 }
    ];

    const carritoExistente = {
      productos: [],
      total: 0,
      save: mockSave
    };

    Carrito.findOne.mockResolvedValue(carritoExistente);

    mockSelect.mockReturnValue({
      stock: 100,
      precio: 20,
      activo: true
    });

    await crearCarrito(req, res);

    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Carrito actualizado correctamente',
      carrito: carritoExistente
    });
  });
});
