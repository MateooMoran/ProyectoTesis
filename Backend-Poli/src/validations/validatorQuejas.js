import { check } from 'express-validator';

export const quejasValidations = [
    check('respuesta')
        .notEmpty().withMessage('La respuesta es obligatoria')
        .isLength({ max: 150 }).withMessage('La respuesta no puede tener más de 150 caracteres')

]