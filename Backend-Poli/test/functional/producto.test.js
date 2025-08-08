import request from 'supertest';
import app from '../../src/server.js';

describe('Pruebas funcionales en /producto', () => {
  it('Debería crear un producto y responder con éxito', async () => {
    const response = await request(app)
      .post('/api/vendedor/crear/producto')
      .send({
        nombreProducto: "Mouse",
        precio: 20,
        stock: 10,
        descripcion: "Mouse test funcional",
        categoria: "6892c47e1efa4dd416c65495"
      });

    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("Producto creado correctamente");
  });

  it('Debería fallar si falta un campo obligatorio', async () => {
    const response = await request(app)
      .post('/api/vendedor/crear/producto')
      .send({
        nombreProducto: "",
        precio: 20,
        stock: 10,
        descripcion: "Falta nombre",
        categoria: "6892c47e1efa4dd416c65495"
      });

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Debe llenar todo los campo");
  });
});
