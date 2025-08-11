import mongoose from "mongoose";
import { sendMailToRecoveryPassword, sendMailToRegister } from "../config/nodemailer.js";
import { createTokenJWT } from "../middlewares/JWT.js";
import Estudiante from "../models/Estudiante.js";
import { check, validationResult } from 'express-validator';

const registroValidations = [
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
    .isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres')
];


const registro = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errores: errors.array().map(({ msg }) => ({ msg }))
    });
  }
  const { nombre, email, password } = req.body;

  try {
    // Verifica si existe algún correo en la base de datos
    const verificarEmailBDD = await Estudiante.findOne({ email });
    if (verificarEmailBDD) {
      return res.status(400).json({ msg: "Lo sentimos, el correo ya se encuentra registrado" });
    }

    // Crear el nuevo estudiante con rol "estudiante"
    const nuevoEstudiante = new Estudiante({
      ...req.body,
      rol: "estudiante"
    });

    // Encriptar la contraseña
    nuevoEstudiante.password = await nuevoEstudiante.encrypPassword(password);

    // Crear token
    const token = nuevoEstudiante.createToken();

    // Enviar correo y guardar estudiante nuevo
    sendMailToRegister(nombre, email, token);
    await nuevoEstudiante.save();

    res.status(200).json({ msg: "Registro exitoso, revisa tu correo para confirmar tu cuenta" });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

const confirmarMail = async (req, res) => {
  // Obtener el token
  const { token } = req.params

  //Verificar el token
  const estudianteBDD = await Estudiante.findOne({ token })

  //Verificar si ya se verifico el token
  if (!estudianteBDD?.token) return res.status(404).json({ msg: "La cuenta ya ha sido confirmada" })

  //Cambiar el estado del token
  estudianteBDD.token = null
  estudianteBDD.emailConfirmado = true
  await estudianteBDD.save()
  res.status(200).json({ msg: "Cuenta confirmada correctamente" })
}

const recuperarPassword = async (req, res) => {
  //Obtener el email
  const { email } = req.body

  //Verificar que no exista un campo vacio
  if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes ingresar tu correo" })

  //Buscamos en la base el correo
  const estudianteBDD = await Estudiante.findOne({ email })
  if (!estudianteBDD) return res.status(404).json({ msg: "Lo sentimos, el correo no se encuentra registrado" })

  //Creamos un nuevo token
  const token = estudianteBDD.createToken()
  estudianteBDD.token = token
  sendMailToRecoveryPassword(email, token)
  await estudianteBDD.save()
  res.status(200).json({ msg: "Revisa tu correo electronico para cambiar tu contraseña" })

}

const comprobarTokenPassword = async (req, res) => {
  // Obtener el token
  const { token } = req.params

  // Verificar el token con el de la BD
  const estudianteBDD = await Estudiante.findOne({ token })
  if (estudianteBDD.token !== token) return res.status(404).json({ msg: "Lo sentimos, no se puede confirmar la cuenta" })

  // Guardar 
  await estudianteBDD.save()
  res.status(200).json({ msg: "Token valido, puedes crear una nueva contraseña" })
}


const crearNuevoPassword = async (req, res) => {
  // Obtener contraseña
  const { password, confirmPassword } = req.body

  //Validaciones
  if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" })
  if (password.length && confirmPassword.length < 4) return res.status(404).json({ msg: "Lo sentimos, la contraseña debe tener al menos 4 caracteres" })

  if (password !== confirmPassword) return res.status(404).json({ msg: "Lo sentimos, las contraseñas no coinciden" })

  const estudianteBDD = await Estudiante.findOne({ token: req.params.token })

  if (estudianteBDD.token !== req.params.token) return res.status(404).json({ msg: "Lo sentimos, la cuenta no se puede validar" })


  estudianteBDD.token = null
  estudianteBDD.password = await estudianteBDD.encrypPassword(password)
  await estudianteBDD.save()

  res.status(200).json({ msg: "Contraseña cambiada correctamente, ya puedes iniciar sesión" })
}

const login = async (req, res) => {

  const { email, password } = req.body;

  if (Object.values(req.body).includes("")) {
    return res.status(400).json({ msg: "Debes llenar todos los campos." });
  }

  const estudianteBDD = await Estudiante.findOne({ email }).select("-__v -updatedAt -createdAt");

  if (!estudianteBDD) {
    return res.status(404).json({ msg: "Correo no registrado." });
  }

  if (estudianteBDD.emailConfirmado === false) {
    return res.status(403).json({ msg: "Debes confirmar tu cuenta antes de iniciar sesión." });
  }

  const verificarPassword = await estudianteBDD.matchPassword(password);
  if (!verificarPassword) {
    return res.status(401).json({ msg: "Contraseña incorrecta." });
  }

  const { nombre, apellido, direccion, telefono, _id, rol } = estudianteBDD;
  const token = createTokenJWT(estudianteBDD._id, estudianteBDD.rol);
  if (!token) {
    return res.status(401).json({ msg: "No se pudo crear el token" })
  }
  res.status(200).json({
    token,
    rol,
    nombre,
    apellido,
    direccion,
    telefono,
    _id,
  });

};


const perfil = (req, res) => {
  const { token, emailConfirmado, createdAt, updatedAt, __v, ...datosPerfil } = req.estudianteBDD
  res.status(200).json(datosPerfil)
}

const actualizarPerfil = async (req, res) => {
  const { id } = req.params
  const { nombre, apellido, telefono, direccion, email } = req.body
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: "Lo sentimos id no valida" })
  if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos deben llenarse todo los campos" });

  const estudianteBDD = await Estudiante.findById(id)
  if (!estudianteBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el estudiante ${id}` });
  if (estudianteBDD.email != email) {
    const estudianteBDDMail = await Estudiante.findOne({ email })
    if (estudianteBDDMail) {
      return res.status(404).json({ msg: 'Lo sentimos el email ya se encuentra registrado' })
    }
  }
  estudianteBDD.nombre = nombre ?? estudianteBDD.nombre
  estudianteBDD.apellido = apellido ?? estudianteBDD.apellido
  estudianteBDD.telefono = telefono ?? estudianteBDD.telefono
  estudianteBDD.direccion = direccion ?? estudianteBDD.direccion
  estudianteBDD.email = email ?? estudianteBDD.email
  await estudianteBDD.save()
  res.status(200).json(estudianteBDD)
}

const actualizarContraseña = async (req, res) => {
  const estudianteBDD = await Estudiante.findById(req.estudianteBDD._id)
  if (!estudianteBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el estudiante ${id}` })
  const verificarPassword = await estudianteBDD.matchPassword(req.body.passwordactual)
  if (!verificarPassword) return res.status(404).json({ msg: "Lo sentimos, el password actual no es el correcto" })
  estudianteBDD.password = await estudianteBDD.encrypPassword(req.body.passwordnuevo)
  await estudianteBDD.save()
  res.status(200).json({ msg: "Password actualizado correctamente" })
}


export {
  registroValidations,
  registro,
  confirmarMail,
  recuperarPassword,
  comprobarTokenPassword,
  crearNuevoPassword,
  login,
  perfil,
  actualizarPerfil,
  actualizarContraseña
}