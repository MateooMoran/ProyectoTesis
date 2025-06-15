import { sendMailToRecoveryPassword, sendMailToRegister } from "../config/nodemailer.js";
import Estudiante from "../models/Estudiante.js";

const registro = async (req,res) => {
    
    // Obtener los datos
    const {nombre, email,password} = req.body

    //Verifica que no exista campo vacios
    if(Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos debes llenar todo los campos"})
    
    //Verifica si existe algun correo en el base de datos
    const verificarEmailBDD = await Estudiante.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos el email ya que se encuentra registrado"})
    
    //Encriptar la contraseña
    const nuevoEstudiante = new Estudiante(req.body)
    nuevoEstudiante.password = await nuevoEstudiante.encrypPassword(password)

    //Crer un token
    const token = nuevoEstudiante.createToken()

    //Enviar correo y guardar estudiante nuevo
    sendMailToRegister(nombre, email, token);
    await nuevoEstudiante.save()
    res.status(200).json({msg:"Revisa tu correo electronico para verificar tu cuenta"})

}

const confirmarMail = async(req,res) => { 
    // Obtener el token
    const {token} = req.params

    //Verificar el token
    const estudianteBDD = await Estudiante.findOne({token})

    //Verificar si ya se verifico el token
    if(!estudianteBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
        
    //Cambiar el estado del token
    estudianteBDD.token = null
    estudianteBDD.emailConfirmado = true
    await estudianteBDD.save()
    res.status(200).json({msg:"Cuenta confirmada correctamente"})
}

const recuperarPassword = async(req,res) => {
    //Obtener el email
    const {email} = req.body

    //Verificar que no exista un campo vacio
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes ingresar tu correo"})

    //Buscamos en la base el correo
    const estudianteBDD = await Estudiante.findOne({email})
    if (!estudianteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})

    //Creamos un nuevo token
    const token = estudianteBDD.createToken()
    estudianteBDD.token = token
    sendMailToRecoveryPassword(email,token)
    await estudianteBDD.save()
    res.status(200).json({msg:"Revisa tu correo para restablecer la contraseña"})

}

const comprobarTokenPassword = async (req, res) =>{
    // Obtener el token
    const {token} = req.params

    // Verificar el token con el de la BD
    const estudianteBDD = await Estudiante.findOne({token})
    if(estudianteBDD.token !== token) return res.status(404).json({msg:"Lo sentimos no se puede validar la cuenta"})
    
    // Guardar 
    await estudianteBDD.save()
    res.status(200).json({msg:"Token confirmado ya puedes crear tu contraseña"})
}


const crearNuevoPassword = async (req,res) => {
    // Obtener contraseña
    const{password,confirmPassword} = req.body

    //Validaciones
    if(Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})

    if(password!==confirmPassword) return res.status(404).json({msg:"Lo sentimos, los password no coinciden"})

    const estudianteBDD = await Estudiante.findOne({token:req.params.token})

    if (estudianteBDD.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, la cuenta no se puede validar"})


    estudianteBDD.token = null
    estudianteBDD.password = await estudianteBDD.encrypPassword(password)
    await estudianteBDD.save()

    res.status(200).json({msg:"Felicitacioens, ya puedes inciar sesión con tu nuevo password"})
}

const login = async (req,res) =>{
  const {email, password} = req.body

  if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos debes llenar todo los campos"});

  const estudianteBDD = await Estudiante.findOne({email}).select("-status -__v -updatedAt -createdAt")

  if(estudianteBDD?.confirmEmail === false) return res.status(403).json({msg:"Lo setimos debes confirmar tu cuenta antes de iniciar sesión"})

  if(!estudianteBDD) return res.status(404).json({msg:"Lo sentimos el usuario no se encuentra registrado"});

  const verificarPassword = await estudianteBDD.matchPassword(password)
  if(!verificarPassword) return res.status(401).json({msg:"Lo sentimos el password es incorrecto"})

  const {nombre,apellido,direccion,telefono,_id,rol} = estudianteBDD

  res.status(200).json({
    rol,
    nombre,
    apellido,
    direccion,
    telefono,
    _id
  })
}
export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    login
}