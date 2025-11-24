import { body } from "express-validator";

const textoValidoRegex = /^(?!.*([a-zA-ZáéíóúÁÉÍÓÚñÑ])\1{2})[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/;

const soloNumerosRegex = /^(?!.*(\d)\1{3,})\d+$/;

export const validarTransferencia = [
  body("banco")
    .notEmpty().withMessage("El banco es obligatorio")
    .isString().withMessage("El banco debe ser texto")
    .isLength({ max: 30 }).withMessage("El banco no puede tener más de 30 caracteres")
    .matches(textoValidoRegex).withMessage("El nombre del banco contiene caracteres inválidos o patrones repetitivos."),

  body("numeroCuenta")
    .notEmpty().withMessage("El número de cuenta es obligatorio")
    .isLength({ min: 10, max: 10 }).withMessage("El número de cuenta debe tener exactamente 10 dígitos")
    .matches(soloNumerosRegex).withMessage("El número de cuenta solo puede contener números y no debe tener dígitos repetidos más de 3 veces."),

  body("titular")
    .notEmpty().withMessage("El titular es obligatorio")
    .isString().withMessage("El titular debe ser texto")
    .isLength({ max: 30 }).withMessage("El titular no puede tener más de 30 caracteres")
    .matches(textoValidoRegex).withMessage("El nombre del titular contiene caracteres inválidos o patrones repetitivos."),

  body("cedula")
    .notEmpty().withMessage("La cédula es obligatoria")
    .isLength({ min: 10, max: 10 }).withMessage("La cédula debe tener exactamente 10 dígitos")
    .matches(/^\d+$/).withMessage("La cédula solo debe contener números"),
];

export const validarLugarRetiro = [
  body("lugares")
    .isArray({ min: 1 }).withMessage("Debes enviar al menos un lugar de retiro")
    .custom(arr => {
      if (arr.length > 3) {
        throw new Error("Solo puedes enviar un máximo de 3 lugares de retiro");
      }

      for (const lugar of arr) {
        const lugarTrimmed = lugar.trim();

        if (lugarTrimmed.length === 0)
          throw new Error("Un lugar de retiro no puede estar vacío");

        if (lugarTrimmed.length > 20)
          throw new Error("Cada lugar de retiro no puede exceder los 20 caracteres");

        if (!textoValidoRegex.test(lugarTrimmed))
          throw new Error("Un lugar de retiro contiene caracteres inválidos o patrones repetitivos.");
      }
      return true;
    })
];

export const validarArchivoImagen = (req, res, next) => {
  if (!req.files?.comprobante) {
    return res.status(400).json({ msg: "Se requiere subir un comprobante de pago en imagen." });
  }

  const file = req.files.comprobante;

  if (!file.mimetype.startsWith("image/")) {
    return res.status(400).json({ msg: "Solo se permiten archivos de imagen (JPG, PNG, JPEG)." });
  }

  next();
};
