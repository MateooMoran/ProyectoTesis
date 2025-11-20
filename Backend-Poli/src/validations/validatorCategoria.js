import { check } from 'express-validator';

const textoValidoRegex =
  /^(?!.*([a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])\1{3,})[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s.,;:!?-]+$/;

export const validarCategoria = [
  check('nombreCategoria')
    .notEmpty().withMessage('El nombre de la categoría es obligatorio')
    .isLength({ min: 3, max: 150 })
    .withMessage('El nombre de la categoría debe tener entre 3 y 150 caracteres')
    .matches(textoValidoRegex)
    .withMessage(
      'El nombre de la categoría contiene caracteres inválidos o tiene letras repetidas en exceso'
    )
];
