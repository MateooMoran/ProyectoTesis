import { body } from "express-validator";
import Producto from "../models/Producto.js";
import mongoose from "mongoose";

// Regex para nombre y descripción
const textoValidoRegex = /^(?!.*([a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ])\1{3,})(?!.*[<>@])[\wáéíóúüñÁÉÍÓÚÜÑ.,;:!?\s-]+$/;

export const validarProducto = [
  body("nombreProducto")
    .trim()
    .notEmpty().withMessage("El nombre del producto es obligatorio")
    .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres")
    .matches(textoValidoRegex).withMessage("El nombre contiene caracteres inválidos o repetidos")
    .custom(async (value, { req }) => {
      const productoExistente = await Producto.findOne({ nombreProducto: value.trim() });
      if (productoExistente && (!req.params.id || req.params.id !== productoExistente._id.toString())) {
        throw new Error("Ya existe un producto con ese nombre");
      }
      return true;
    }),

  body("precio")
    .notEmpty().withMessage("El precio es obligatorio")
    .matches(/^\d{1,6}(\.\d{1,2})?$/).withMessage("El precio debe tener máximo 6 enteros y 2 decimales"),

  body("stock")
    .notEmpty().withMessage("El stock es obligatorio")
    .isInt({ min: 0, max: 9999 }).withMessage("El stock debe ser un entero entre 0 y 9999"),

  body("descripcion")
    .trim()
    .notEmpty().withMessage("La descripción es obligatoria")
    .isLength({ min: 10, max: 500 }).withMessage("La descripción debe tener entre 10 y 500 caracteres")
    .matches(textoValidoRegex).withMessage("La descripción contiene caracteres inválidos o repetidos"),

  body("categoria")
    .notEmpty().withMessage("La categoría es obligatoria")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("ID de categoría no válido");
      }
      return true;
    }),

  body("imagen")
    .custom((value, { req }) => {
      const esActualizacion = !!req.params.id; 
      if (!esActualizacion && !req.files?.imagen && !req.body.imagenIA) {
        throw new Error("Debe subir al menos una imagen");
      }

      if (req.files?.imagen && !req.files.imagen.mimetype.startsWith("image/")) {
        throw new Error("Solo se permiten archivos de imagen");
      }

      return true;
    }),
];
