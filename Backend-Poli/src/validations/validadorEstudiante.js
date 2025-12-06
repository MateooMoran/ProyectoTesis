import { check } from 'express-validator';

const soloLetrasRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;

const textoValidoRegex =
  /^(?!.*([a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ])\1{3,})(?!.*[<>@])[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,#°-]+$/;

export const registroValidations = [
  check('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 20 }).withMessage('El nombre debe tener entre 2 y 20 caracteres')
    .custom(valor => {
      if (!soloLetrasRegex.test(valor)) {
        throw new Error('El nombre solo puede contener letras y espacios');
      }
      return true;
    }),

  check('apellido')
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 20 }).withMessage('El apellido debe tener entre 2 y 20 caracteres')
    .custom(valor => {
      if (!soloLetrasRegex.test(valor)) {
        throw new Error('El apellido solo puede contener letras y espacios');
      }
      return true;
    }),

  check('telefono')
    .notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^0\d{9}$/).withMessage('El teléfono debe tener 10 dígitos y comenzar con 0'),

  check('direccion')
    .notEmpty().withMessage('La dirección es obligatoria')
    .isLength({ max: 50 }).withMessage('La dirección no puede exceder los 50 caracteres')
    .custom(valor => {
      if (!textoValidoRegex.test(valor)) {
        throw new Error('La dirección contiene caracteres no permitidos o patrones inválidos');
      }
      return true;
    }),

  check('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email debe ser válido'),

  check('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres')
    .custom(valor => {
      if (!textoValidoRegex.test(valor)) {
        throw new Error('La contraseña contiene caracteres no permitidos o repeticiones excesivas');
      }
      return true;
    }),
];
