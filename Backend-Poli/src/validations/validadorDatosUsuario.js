import { body } from "express-validator";

const soloLetrasRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;

const textoValidoRegex = /^(?!.*([a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ])\1{3,})(?!.*[<>@])[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,#°-]+$/;

export const validarDatosPersona = [
  body("nombre")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 25 }).withMessage("El nombre no debe superar los 25 caracteres")
    .matches(soloLetrasRegex).withMessage("El nombre solo puede contener letras y espacios"),

  body("apellido")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 25 }).withMessage("El apellido no debe superar los 25 caracteres")
    .matches(soloLetrasRegex).withMessage("El apellido solo puede contener letras y espacios"),

  body("telefono")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^0\d{9}$/).withMessage("El teléfono debe empezar con 0 y tener 10 dígitos"),

  body("direccion")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('La dirección no puede exceder los 50 caracteres')
    .matches(textoValidoRegex).withMessage("La dirección contiene caracteres inválidos"),
];
