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

  // Validar email solo si se envió Y es diferente al actual
  if (email && email.trim() !== "" && estudianteBDD.email !== email) {
    const estudianteBDDMail = await Estudiante.findOne({ email })
    if (estudianteBDDMail) {
      return res.status(404).json({ msg: 'Lo sentimos el email ya se encuentra registrado' })
    }
    estudianteBDD.email = email.trim()
  }

  // Solo actualizar si el campo tiene valor 
  if (nombre && nombre.trim() !== "") estudianteBDD.nombre = nombre.trim()
  if (apellido && apellido.trim() !== "") estudianteBDD.apellido = apellido.trim()
  if (telefono && telefono.trim() !== "") estudianteBDD.telefono = telefono.trim()
  if (direccion && direccion.trim() !== "") estudianteBDD.direccion = direccion.trim()

  await estudianteBDD.save()
  res.status(200).json(estudianteBDD)
}

export const actualizarContraseña = async (req, res) => {
  try {
    const { passwordactual, passwordnuevo } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "El ID proporcionado no es válido." });
    }

    const estudiante = await Estudiante.findById(id);
    if (!estudiante) {
      return res.status(404).json({ msg: `No se encontró ningún estudiante con el ID ${id}.` });
    }

    const esPasswordCorrecto = await estudiante.matchPassword(passwordactual);
    if (!esPasswordCorrecto) {
      return res.status(401).json({ msg: "La contraseña actual es incorrecta." });
    }

    if (passwordactual === passwordnuevo) {
      return res.status(400).json({ msg: "La nueva contraseña no puede ser igual a la actual." });
    }

    estudiante.password = passwordnuevo;
    await estudiante.save();

    return res.status(200).json({ msg: "Contraseña actualizada correctamente." });
  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    return res.status(500).json({ msg: "Error al actualizar la contraseña.", error: error.message });
  }
};
