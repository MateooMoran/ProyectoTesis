import { body } from "express-validator";

const textoValidoRegex = /^(?!.*([a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ])\1{3,})(?!.*[<>@])[\wáéíóúüñÁÉÍÓÚÜÑ\s.,#°\-]+$/;

export const validarDatosPersona = [
    body("nombre")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 25 }).withMessage("El nombre no debe superar los 25 caracteres")
        .matches(textoValidoRegex).withMessage("El nombre contiene caracteres inválidos"),

    body("apellido")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 25 }).withMessage("El apellido no debe superar los 25 caracteres")
        .matches(textoValidoRegex).withMessage("El apellido contiene caracteres inválidos"),

    body("telefono")
        .optional({ checkFalsy: true })
        .trim()
        .matches(/^0\d{9}$/).withMessage("El teléfono debe empezar con 0 y tener 10 dígitos numéricos"),

    body("direccion")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100, min: 10 }).withMessage("La dirección debe tener entre 10 y 100 caracteres")
        .matches(textoValidoRegex).withMessage("La dirección contiene caracteres inválidos"),
];
