import { check } from 'express-validator';

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const repeticionFuerte = /(.)\1{2,}/;

function tienePatronRepetido(texto) {
  const t = texto.toLowerCase().replace(/\s+/g, '').trim();

  if (/^(.{1,3})\1{2,}$/.test(t)) return true;

  for (let size = 2; size <= 4; size++) {
    const base = t.slice(0, size);
    let count = 0;

    for (let i = 0; i < t.length; i += size) {
      if (t.slice(i, i + size) === base) count++;
    }

    const repRatio = (count * size) / t.length;
    if (repRatio >= 0.60) return true;
  }

  return false;
}

export const registroValidations = [
  check('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 20 }).withMessage('El nombre debe tener entre 2 y 20 caracteres')
    .custom(valor => {
      if (!soloLetras.test(valor)) throw new Error('El nombre solo puede contener letras y espacios');
      if (repeticionFuerte.test(valor)) throw new Error('El nombre contiene repeticiones excesivas');
      if (tienePatronRepetido(valor)) throw new Error('El nombre contiene patrones repetitivos');
      return true;
    }),

  check('apellido')
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 20 }).withMessage('El apellido debe tener entre 2 y 20 caracteres')
    .custom(valor => {
      if (!soloLetras.test(valor)) throw new Error('El apellido solo puede contener letras y espacios');
      if (repeticionFuerte.test(valor)) throw new Error('El apellido contiene repeticiones excesivas');
      if (tienePatronRepetido(valor)) throw new Error('El apellido contiene patrones repetitivos');
      return true;
    }),

  check('telefono')
    .notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^0\d{9}$/).withMessage('El teléfono debe tener 10 dígitos y comenzar con 0'),

  check('direccion')
    .notEmpty().withMessage('La dirección es obligatoria')
    .isLength({ max: 50 }).withMessage('La dirección no puede exceder los 50 caracteres'),

  check('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email debe ser válido'),

  check('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres'),
];
