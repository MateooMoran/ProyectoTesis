import { check } from 'express-validator';

const textoValidoRegex = /^(?!.*([a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ])\1{3,})[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,;:!?-]+$/;

export const quejasValidations = [
    check('mensaje')
        .isLength({ min: 10, max: 250 })
        .withMessage('El mensaje debe tener al menos 10 caracteres')
        .matches(textoValidoRegex)
        .withMessage('El mensaje contiene caracteres inválidos o repetidos')
];

export const respuestaQuejasValidations = [
    check('respuesta')
        .isLength({ min: 10, max: 250 })
        .withMessage('El mensaje debe tener al menos 10 caracteres')
        .matches(textoValidoRegex)
        .withMessage('El mensaje contiene caracteres inválidos o repetidos')
];
