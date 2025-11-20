import { check } from 'express-validator';

const nombreApellidoRegex =
  /^(?!.*([A-Za-zÁÉÍÓÚáéíóúÑñ])\1{2})(?!.*([A-Za-zÁÉÍÓÚáéíóúÑñ]{2,})\1)[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

const direccionRegex =
  /^(?!.*([A-Za-zÁÉÍÓÚáéíóúÑñ0-9])\1{2})(?!.*([A-Za-zÁÉÍÓÚáéíóúÑñ0-9]{2,})\1)[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s#\-,./]+$/;

export const registroValidations = [
  check('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 20 }).withMessage('El nombre debe tener entre 2 y 20 caracteres')
    .matches(nombreApellidoRegex)
    .withMessage('El nombre solo puede contener letras y espacios, sin repeticiones como "aaa" o patrones como "lelele"'),

  check('apellido')
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 20 }).withMessage('El apellido debe tener entre 2 y 20 caracteres')
    .matches(nombreApellidoRegex)
    .withMessage('El apellido solo puede contener letras y espacios, sin repeticiones como "aaa" o patrones como "lelele"'),

  check('telefono')
    .notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^0\d{9}$/).withMessage('El teléfono debe tener 10 dígitos y comenzar con 0'),

  check('direccion')
    .notEmpty().withMessage('La dirección es obligatoria')
    .isLength({ max: 50 }).withMessage('La dirección no puede exceder los 50 caracteres')
    .matches(direccionRegex)
    .withMessage('La dirección contiene caracteres inválidos o patrones repetitivos'),

  check('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email debe ser válido'),

  check('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres'),
];
