import { body, param } from "express-validator";

const textoValidoRegex = /^(?!.*([a-zA-Z0-9])\1{3,})(?!.*[<>@])([a-zA-Z0-9]+(\s[a-zA-Z0-9]+)*)$/;
const soloNumerosRegex = /^(?!.*(\d)\1{3,})\d+$/;

// Validación para TRANSFERENCIA
export const validarTransferencia = [
  body("banco")
    .notEmpty().withMessage("El banco es obligatorio")
    .isString().withMessage("El banco debe ser texto")
    .isLength({ max: 30 }).withMessage("El banco no puede tener más de 30 caracteres")
    .matches(textoValidoRegex).withMessage("Banco contiene caracteres inválidos o repetidos"),

  body("numeroCuenta")
    .notEmpty().withMessage("El número de cuenta es obligatorio")
    .isLength({ min: 10, max: 10 }).withMessage("Número de cuenta debe tener exactamente 10 dígitos")
    .matches(soloNumerosRegex).withMessage("Número de cuenta solo puede contener números y no letras"),

  body("titular")
    .notEmpty().withMessage("El titular es obligatorio")
    .isString().withMessage("El titular debe ser texto")
    .isLength({ max: 30 }).withMessage("Titular no puede tener más de 30 caracteres")
    .matches(textoValidoRegex).withMessage("Titular contiene caracteres inválidos o repetidos"),

  body("cedula")
    .notEmpty().withMessage("La cédula es obligatoria")
    .isLength({ min: 10, max: 10 }).withMessage("La cédula debe tener exactamente 10 dígitos"),
];

// Validación para EFECTIVO
export const validarLugarRetiro = [
  body("lugares")
    .isArray({ min: 1 }).withMessage("Lugar de Retiro debe ser uno o más lugares")
    .custom(arr => {
      if (arr.length > 3) throw new Error("Solo puedes enviar un máximo de 3 lugares de retiro");

      for (const lugar of arr) {
        const lugarTrimmed = lugar.trim();
        if (lugarTrimmed.length === 0) throw new Error("Lugar de retiro no puede estar vacío");
        if (lugarTrimmed.length > 20) throw new Error("Cada lugar de retiro no puede exceder los 20 caracteres");
        if (!textoValidoRegex.test(lugarTrimmed)) throw new Error("Lugar de retiro contiene caracteres inválidos o repetidos");
      }
      return true;
    })
];




export const validarArchivoImagen = (req, res, next) => {
  if (!req.files?.comprobante) {
    return res.status(400).json({ msg: "Se requiere subir un archivo" });
  }

  const file = req.files.comprobante;
  if (!file.mimetype.startsWith("image/")) {
    return res.status(400).json({ msg: "Solo se permiten archivos de imagen" });
  }

  next();
};
