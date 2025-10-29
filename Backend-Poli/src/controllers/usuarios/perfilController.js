import mongoose from "mongoose";
import Estudiante from "../../models/Estudiante.js";

export const perfil = async (req, res) => {
  try {
    const { token, emailConfirmado, createdAt, updatedAt, __v, ...datosPerfil } = req.estudianteBDD
    res.status(200).json(datosPerfil)
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo perfil", error: error.message });
  }
};

export const actualizarPerfil = async (req, res) => {
  const { id } = req.params
  const { nombre, apellido, telefono, direccion, email } = req.body
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: "Lo sentimos id no valida" })

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

export const actualizarContraseña = async (req, res) => {
  try {
    const estudianteBDD = await Estudiante.findById(req.estudianteBDD._id)
    if (!estudianteBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el estudiante ${id}` })
    const verificarPassword = await estudianteBDD.matchPassword(req.body.passwordactual)
    if (!verificarPassword) return res.status(404).json({ msg: "Lo sentimos, el password actual no es el correcto" })
    estudianteBDD.password = await estudianteBDD.encrypPassword(req.body.passwordnuevo)
    await estudianteBDD.save()
    res.status(200).json({ msg: "Password actualizado correctamente" })
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error actualizando contraseña", error: error.message });
  }
};

