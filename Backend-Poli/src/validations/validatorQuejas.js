import { check } from 'express-validator';

const textoValidoRegex =
/^(?!.*([a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ])\1{3,})[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,;:!?-\u{1F300}-\u{1FAFF}\u{1F1E0}-\u{1F1FF}]+$/u;

export const quejasValidations = [
  check('tipo')
    .custom(value => {
      if (!value || !value.trim()) {
        throw new Error('El tipo es obligatorio');
      }

      const tipo = value.trim().toLowerCase();
      if (!['queja', 'sugerencia'].includes(tipo)) {
        throw new Error('El tipo debe ser queja o sugerencia');
      }

      return true;
    }),

  check('mensaje')
    .custom(value => {
      if (!value || !value.trim()) {
        throw new Error('El mensaje es obligatorio');
      }

      const mensaje = value.trim();
      if (mensaje.length < 10 || mensaje.length > 250) {
        throw new Error('El mensaje debe tener entre 10 y 250 caracteres');
      }

      if (!textoValidoRegex.test(mensaje)) {
        throw new Error('El mensaje contiene caracteres inválidos o repetidos');
      }

      return true;
    })
];

export const respuestaQuejasValidations = [
  check('respuesta')
    .notEmpty().withMessage('La respuesta es obligatoria')
    .isLength({ min: 10, max: 250 }).withMessage('La respuesta debe tener entre 10 y 250 caracteres')
    .matches(textoValidoRegex).withMessage('La respuesta contiene caracteres inválidos o repetidos')
];
