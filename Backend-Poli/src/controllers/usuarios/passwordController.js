import Estudiante from "../../models/Estudiante.js";
import { sendMailToRecoveryPassword } from "../../config/nodemailer.js";

export const recuperarPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Debes ingresar tu correo" });

    const estudianteBDD = await Estudiante.findOne({ email });
    if (!estudianteBDD) return res.status(404).json({ msg: "Correo no registrado" });

    const token = estudianteBDD.createToken();
    estudianteBDD.token = token;
    await estudianteBDD.save();
    await sendMailToRecoveryPassword(email, token);

    res.status(200).json({ msg: "Revisa tu correo para cambiar tu contraseña" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error enviando correo de recuperación", error: error.message });
  }
};

export const comprobarTokenPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const estudianteBDD = await Estudiante.findOne({ token });
    if (!estudianteBDD || estudianteBDD.token !== token)
      return res.status(404).json({ msg: "Token inválido o expirado" });

    res.status(200).json({ msg: "Token válido, puedes crear una nueva contraseña" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error comprobando token", error: error.message });
  }
};

export const crearNuevoPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    if (!password || !confirmPassword) return res.status(400).json({ msg: "Debes completar todos los campos" });
    if (password.length < 4) return res.status(400).json({ msg: "La contraseña debe tener al menos 4 caracteres" });
    if (password !== confirmPassword) return res.status(400).json({ msg: "Las contraseñas no coinciden" });

    const estudianteBDD = await Estudiante.findOne({ token });
    if (!estudianteBDD) return res.status(404).json({ msg: "Token inválido" });

    estudianteBDD.password = await estudianteBDD.encrypPassword(password);
    estudianteBDD.token = null;
    await estudianteBDD.save();

    res.status(200).json({ msg: "Contraseña cambiada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error cambiando contraseña", error: error.message });
  }
};
