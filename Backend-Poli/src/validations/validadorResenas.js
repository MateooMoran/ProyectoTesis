import { check } from "express-validator";

const textoValidoRegex =
  /^(?!.*([a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ])\1{3,})[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,;:!?()'"-]*$/;

export const resenaValidations = [
  check("productoId")
    .notEmpty().withMessage("El ID del producto es obligatorio")
    .isMongoId().withMessage("El ID del producto no es válido"),

  check("estrellas")
    .notEmpty().withMessage("Las estrellas son obligatorias")
    .isInt({ min: 1, max: 5 }).withMessage("Las estrellas deben estar entre 1 y 5"),

  check("comentario")
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (!value) return true;

      if (value.trim().length === 0) {
        throw new Error("El comentario no puede estar vacío");
      }

      if (/^\d+$/.test(value.trim())) {
        throw new Error("El comentario no puede contener solo números");
      }

      if (/^[^\p{L}\p{N}]+$/u.test(value.trim())) {
        throw new Error("El comentario debe contener texto válido");
      }

      if (value.trim().length > 250) {
        throw new Error("El comentario no puede superar los 250 caracteres");
      }

      if (!textoValidoRegex.test(value.trim())) {
        throw new Error("El comentario contiene caracteres inválidos o repetidos");
      }

      return true;
    }),
];
