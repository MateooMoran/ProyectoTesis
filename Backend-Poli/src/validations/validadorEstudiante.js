import { check } from 'express-validator';

export const registroValidations = [
  check('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 10 }).withMessage('El nombre debe tener entre 2 y 10 caracteres')
    .matches(/^[A-Za-zÀ-ÿ]+$/).withMessage('El nombre solo debe contener letras, sin números ni símbolos')
    .custom(value => {
      if (/(.)\1{3,}/.test(value.toLowerCase())) {
        throw new Error('El nombre no puede contener letras repetidas muchas veces consecutivas');
      }
      return true;
    }),
  check('apellido')
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 10 }).withMessage('El apellido debe tener entre 2 y 10 caracteres')
    .matches(/^[A-Za-zÀ-ÿ]+$/).withMessage('El apellido solo debe contener letras, sin números ni símbolos')
    .custom(value => {
      if (/(.)\1{3,}/.test(value.toLowerCase())) {
        throw new Error('El apellido no puede contener letras repetidas muchas veces consecutivas');
      }
      return true;
    }),
  check('telefono')
    .notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^0\d{9}$/).withMessage('El teléfono debe tener 10 números y comenzar con 0'),
  check('direccion')
    .notEmpty().withMessage('La dirección es obligatoria'),
  check('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email debe ser válido'),
  check('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres'),
];