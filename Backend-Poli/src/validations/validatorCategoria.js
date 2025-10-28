
import { check } from 'express-validator';

export const categoriaValidator = [
    check('nombreCategoria')
        .isLength({ max: 150 }).withMessage('La respuesta no puede tener más de 150 caracteres')
];
