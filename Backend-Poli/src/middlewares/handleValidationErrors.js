import { validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      msg: err.msg
    }));

    return res.status(400).json({ errores: errorMessages });
  }

  next();
};

export default handleValidationErrors;
