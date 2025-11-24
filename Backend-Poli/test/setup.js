import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.test" });

jest.mock("node-fetch", () => jest.fn());

// Configurar timeout global
jest.setTimeout(10000);

// Limpiar mocks después de cada test
afterEach(() => {
    jest.clearAllMocks();
});

// Cerrar conexión después de todos los tests
afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
});
