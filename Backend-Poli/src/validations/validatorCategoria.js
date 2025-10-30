import { check } from 'express-validator';

const textoValidoRegex = /^(?!.*([a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])\1{3,})[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s.,;:!?-]+$/;

export const validarCategoria = [
    check('nombreCategoria')
        .isLength({ min: 3, max: 150 })
        .withMessage('El nombre de la categoría debe tener entre 3 y 150 caracteres')
        .matches(textoValidoRegex)
        .withMessage('La categoría contiene caracteres inválidos o letras repetida')
];
