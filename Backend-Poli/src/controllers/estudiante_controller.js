import mongoose from "mongoose";
import { sendMailToRecoveryPassword, sendMailToRegister } from "../config/nodemailer.js";
import { createTokenJWT } from "../middlewares/JWT.js";
import Estudiante from "../models/Estudiante.js";
import Producto from "../models/Producto.js";

const registro = async (req, res) => {

    // Obtener los datos
    const { nombre, email, password } = req.body

    //Verifica que no exista campo vacios
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos debes llenar todo los campos" })

    //Verifica si existe algun correo en el base de datos
    const verificarEmailBDD = await Estudiante.findOne({ email })
    if (verificarEmailBDD) return res.status(400).json({ msg: "Lo sentimos, el correo ya se encuentra registrado" });

    // Validar la contraseña
    if (password.length < 4) {
        return res.status(400).json({ msg: "La contraseña debe tener al menos 4 caracteres" });
    }
    //Encriptar la contraseña
    const nuevoEstudiante = new Estudiante(req.body)
    nuevoEstudiante.password = await nuevoEstudiante.encrypPassword(password)

    //Crer un token
    const token = nuevoEstudiante.createToken()

    //Enviar correo y guardar estudiante nuevo
    sendMailToRegister(nombre, email, token);
    await nuevoEstudiante.save()
    res.status(200).json({ msg: "Registro exitoso, revisa tu correo para confirmar tu cuenta" })

}

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
  try {
    const { email, password } = req.body;

    if (Object.values(req.body).includes("")) {
      return res.status(400).json({ msg: "Lo sentimos debes llenar todos los campos" });
    }

    const estudianteBDD = await Estudiante.findOne({ email }).select("-status -__v -updatedAt -createdAt");

    if (!estudianteBDD) {
      return res.status(404).json({ msg: "Lo sentimos, el correo no se encuentra registrado" });
    }

    if (estudianteBDD.confirmEmail === false) {
      return res.status(403).json({ msg: "Lo sentimos debes confirmar tu cuenta antes de iniciar sesión" });
    }

    const verificarPassword = await estudianteBDD.matchPassword(password);
    if (!verificarPassword) {
      return res.status(401).json({ msg: "Lo sentimos, la contraseña es incorrecta" });
    }

    const { nombre, apellido, direccion, telefono, _id, rol } = estudianteBDD;
    const token = createTokenJWT(estudianteBDD._id, estudianteBDD.rol);

    res.status(200).json({
      token,
      rol,
      nombre,
      apellido,
      direccion,
      telefono,
      _id
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};


const perfil = (req, res) => {
    const { token, confirmEmail, createdAt, updatedAt, __v, ...datosPerfil } = req.estudianteBDD
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

const visualizarProductos = async (req,res) => {
    const productos = await Producto.find().select('-_id -createdAt -updatedAt -__v -vendedor').populate('categoria','nombreCategoria -_id')  
    res.status(200).json(productos)
}
export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    login,
    perfil,
    actualizarPerfil,
    actualizarContraseña,
    visualizarProductos
}   