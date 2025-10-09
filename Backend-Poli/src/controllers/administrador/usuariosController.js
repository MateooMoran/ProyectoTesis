import Estudiante from "../../models/Estudiante.js";
import Producto from "../../models/Producto.js";
import mongoose from "mongoose";
import { sendMailToAssignSeller } from "../../config/nodemailer.js";

// Obtener todos los estudiantes y vendedores
export const obtenerUsuarios = async (req, res) => {
  try {
    const estudianteBDD = await Estudiante.find({ rol: { $in: ['estudiante', 'vendedor'] } })
      .select('_id nombre apellido telefono direccion rol estado').sort({ createdAt: -1 })

    if (!estudianteBDD || estudianteBDD.length === 0) {
      return res.status(404).json({ msg: "No hay estudiantes registrados" });
    }

    res.status(200).json(estudianteBDD);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo usuarios", error: error.message });
  }
};

// Cambiar rol de usuario
export const cambioRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!rol) return res.status(400).json({ msg: "Rol es requerido" });
    if (!id) return res.status(400).json({ msg: "ID de usuario es requerido" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de usuario no válido" });

    const usuario = await Estudiante.findById(id);
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });
    if (!['vendedor', 'estudiante'].includes(rol)) return res.status(400).json({ msg: 'Rol no válido' });
    if (usuario.rol === rol) return res.status(400).json({ msg: `El usuario ya tiene el rol ${rol}` });

    usuario.rol = rol;
    await usuario.save();

    // Activar o desactivar productos según rol
    if (rol === 'vendedor') {
      await Producto.updateMany(
        { vendedor: id, activo: false, eliminadoPorVendedor: { $ne: true } },
        { $set: { activo: true } }
      );
    } else if (rol === 'estudiante') {
      await Producto.updateMany(
        { vendedor: id, activo: true },
        { $set: { activo: false } }
      );
    }

    sendMailToAssignSeller(usuario.email, usuario.nombre, usuario.rol);

    res.status(200).json({ msg: 'Rol actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error cambiando rol", error: error.message });
  }
};
