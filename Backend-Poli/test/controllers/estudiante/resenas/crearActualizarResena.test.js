import { crearActualizarResena } from '../../../../src/controllers/estudiante/resenaController.js';
import Resena from '../../../../src/models/Resena.js';
import Producto from '../../../../src/models/Producto.js';
import Orden from '../../../../src/models/Orden.js';

jest.mock('../../../../src/models/Resena.js');
jest.mock('../../../../src/models/Producto.js');
jest.mock('../../../../src/models/Orden.js');

describe('Estudiante - crearActualizarResena', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, estudianteBDD: { _id: 'est123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('Debería crear reseña correctamente (éxito)', async () => {
    req.body = { productoId: '507f1f77bcf86cd799439050', estrellas: 5, comentario: 'Excelente' };

    const mockProducto = { _id: req.body.productoId, activo: true, eliminadoPorVendedor: false };
    const mockOrden = { producto: req.body.productoId, comprador: 'est123', estado: 'completada' };
    const mockResena = { save: jest.fn().mockResolvedValue(true) };

    Producto.findById = jest.fn().mockResolvedValue(mockProducto);
    Producto.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
    Orden.findOne = jest.fn().mockResolvedValue(mockOrden);
    Resena.findOne = jest.fn().mockResolvedValue(null);
    Resena.find = jest.fn().mockResolvedValue([]);
    Resena.mockImplementation(() => mockResena);

    await crearActualizarResena(req, res);

    expect(mockResena.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Reseña creada correctamente' }));
  });

  it('Debería actualizar reseña existente (éxito)', async () => {
    req.body = { productoId: '507f1f77bcf86cd799439051', estrellas: 4, comentario: 'Bueno' };

    const mockProducto = { _id: req.body.productoId, activo: true, eliminadoPorVendedor: false };
    const mockOrden = { producto: req.body.productoId, comprador: 'est123', estado: 'completada' };
    const mockResena = { estrellas: 3, comentario: 'Regular', save: jest.fn().mockResolvedValue(true) };

    Producto.findById = jest.fn().mockResolvedValue(mockProducto);
    Producto.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
    Orden.findOne = jest.fn().mockResolvedValue(mockOrden);
    Resena.findOne = jest.fn().mockResolvedValue(mockResena);
    Resena.find = jest.fn().mockResolvedValue([mockResena]);

    await crearActualizarResena(req, res);

    expect(mockResena.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Reseña actualizada correctamente' }));
  });

  it('Debería rechazar ID de producto inválido (validación)', async () => {
    req.body = { productoId: 'invalid', estrellas: 5 };

    await crearActualizarResena(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'ID de producto no válido' });
  });

  it('Debería rechazar si producto no encontrado (validación)', async () => {
    req.body = { productoId: '507f1f77bcf86cd799439052', estrellas: 5 };
    Producto.findById = jest.fn().mockResolvedValue(null);

    await crearActualizarResena(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Producto no encontrado' });
  });

  it('Debería rechazar si no ha comprado el producto (validación)', async () => {
    req.body = { productoId: '507f1f77bcf86cd799439053', estrellas: 5 };

    const mockProducto = { _id: req.body.productoId, activo: true, eliminadoPorVendedor: false };
    Producto.findById = jest.fn().mockResolvedValue(mockProducto);
    Orden.findOne = jest.fn().mockResolvedValue(null);

    await crearActualizarResena(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Solo puedes reseñar productos que hayas comprado y recibido' });
  });

  it('Debería manejar error del sistema al crear reseña (sistema)', async () => {
    req.body = { productoId: '507f1f77bcf86cd799439054', estrellas: 5 };
    Producto.findById = jest.fn().mockRejectedValue(new Error('DB error'));

    await crearActualizarResena(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error procesando reseña' }));
  });
});
