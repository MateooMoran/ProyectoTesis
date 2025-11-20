import { check } from "express-validator";

const textoValidoConEmojisRegex =
  /^(?!.*([a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\u{1F300}-\u{1FAFF}])\1{3,})[\p{L}\p{N}\p{Emoji}\s.,;:!?()'"-\u{1F300}-\u{1FAFF}]+$/u;

export const resenaValidations = [
  check("productoId")
    .notEmpty().withMessage("El ID del producto es obligatorio")
    .isMongoId().withMessage("El ID del producto no es válido"),

  check("estrellas")
    .notEmpty().withMessage("Las estrellas son obligatorias")
    .isInt({ min: 1, max: 5 }).withMessage("Las estrellas deben estar entre 1 y 5"),

  check("comentario")
    .notEmpty().withMessage("El comentario es obligatorio")
    .trim()
    .custom((value) => {
      const texto = value.trim();

      if (texto.length === 0) {
        throw new Error("El comentario no puede estar vacío");
      }

      if (/^\d+$/.test(texto)) {
        throw new Error("El comentario no puede contener solo números");
      }

      if (/^[^\p{L}\p{N}\p{Emoji}]+$/u.test(texto)) {
        throw new Error("El comentario debe contener texto válido");
      }

      if (texto.length > 100) {
        throw new Error("El comentario no puede superar los 100 caracteres");
      }

      if (!textoValidoConEmojisRegex.test(texto)) {
        throw new Error("El comentario contiene caracteres inválidos, emojis repetidos o patrones no permitidos");
      }

      return true;
    }),
];
