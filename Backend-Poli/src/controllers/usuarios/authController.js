import { sendMailToRegister } from "../../config/nodemailer.js";
import Estudiante from "../../models/Estudiante.js";
import { createTokenJWT } from "../../middlewares/JWT.js";

export const registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const verificarEmailBDD = await Estudiante.findOne({ email });
    if (verificarEmailBDD) return res.status(400).json({ msg: "Correo ya registrado" });

    const nuevoEstudiante = new Estudiante({ ...req.body, rol: "estudiante" });
    nuevoEstudiante.password = await nuevoEstudiante.encrypPassword(password);
    const token = nuevoEstudiante.createToken();

    await sendMailToRegister(nombre, email, token);
    await nuevoEstudiante.save();

    res.status(200).json({ msg: "Registro exitoso, revisa tu correo para confirmar tu cuenta" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error interno del servidor", error: error.message });
  }
};

export const confirmarMail = async (req, res) => {
  try {
    const { token } = req.params;
    const estudianteBDD = await Estudiante.findOne({ token });
    if (!estudianteBDD?.token) return res.status(404).json({ msg: "La cuenta ya ha sido confirmada" });

    estudianteBDD.token = null;
    estudianteBDD.emailConfirmado = true;
    await estudianteBDD.save();

    res.status(200).json({ msg: "Cuenta confirmada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error confirmando la cuenta", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Debes llenar todos los campos." });

    const estudianteBDD = await Estudiante.findOne({ email }).select("-__v -updatedAt -createdAt");
    if (!estudianteBDD) return res.status(404).json({ msg: "Correo no registrado." });
    if (!estudianteBDD.emailConfirmado) return res.status(403).json({ msg: "Debes confirmar tu cuenta antes de iniciar sesión." });

    const verificarPassword = await estudianteBDD.matchPassword(password);
    if (!verificarPassword) return res.status(401).json({ msg: "Contraseña incorrecta." });

    const token = createTokenJWT(estudianteBDD._id, estudianteBDD.rol);
    res.status(200).json({
      token,
      rol: estudianteBDD.rol,
      nombre: estudianteBDD.nombre,
      apellido: estudianteBDD.apellido,
      direccion: estudianteBDD.direccion,
      telefono: estudianteBDD.telefono,
      _id: estudianteBDD._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el login", error: error.message });
  }
};