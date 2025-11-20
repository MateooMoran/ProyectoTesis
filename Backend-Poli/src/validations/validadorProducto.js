import { body } from "express-validator";
import Producto from "../models/Producto.js";
import mongoose from "mongoose";

const textoValidoRegex = /^(?!.*([a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ])\1{3,})(?!.*[<>@])[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ.,;:!?\s-]+$/;

export const validarProducto = [
  body("nombreProducto")
    .trim()
    .notEmpty().withMessage("Ingrese el nombre del producto")
    .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres")
    .matches(textoValidoRegex).withMessage(
      "El nombre contiene caracteres no permitidos, repeticiones excesivas o un patrón inválido"
    )
    .custom(async (value, { req }) => {
      const existente = await Producto.findOne({ nombreProducto: value.trim() });

      if (existente && (!req.params.id || req.params.id !== existente._id.toString())) {
        throw new Error("Ya existe un producto con ese nombre");
      }
      return true;
    }),

  body("precio")
    .notEmpty().withMessage("Ingrese el precio del producto")
    .matches(/^\d{1,6}(\.\d{1,2})?$/)
    .withMessage("El precio solo puede tener hasta 6 números enteros y 2 decimales"),

  body("stock")
    .notEmpty().withMessage("Ingrese el stock disponible")
    .isInt({ min: 1, max: 999 }).withMessage("El stock debe ser un número entre 1 y 999"),

  body("descripcion")
    .trim()
    .notEmpty().withMessage("Ingrese una descripción del producto")
    .isLength({ min: 10, max: 500 }).withMessage("La descripción debe tener entre 10 y 500 caracteres")
    .matches(textoValidoRegex).withMessage(
      "La descripción contiene caracteres no permitidos o patrones repetitivos"
    ),

  body("categoria")
    .notEmpty().withMessage("Seleccione una categoría")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("La categoría seleccionada no es válida");
      }
      return true;
    }),

  body("imagen")
    .custom((value, { req }) => {
      const esActualizacion = !!req.params.id;

      if (!esActualizacion && !req.files?.imagen && !req.body.imagenIA) {
        throw new Error("Debe subir al menos una imagen del producto");
      }

      if (req.files?.imagen && !req.files.imagen.mimetype.startsWith("image/")) {
        throw new Error("Solo se permiten archivos de imagen");
      }

      return true;
    }),
];
