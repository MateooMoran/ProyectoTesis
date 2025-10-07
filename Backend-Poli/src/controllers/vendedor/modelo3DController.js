import Producto from "../../models/Producto.js";
import { crearModelo3D } from "../../utils/apis.js";
import mongoose from "mongoose";

// Generar modelo 3D para un producto
export const generarModelo3DParaProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const vendedorId = req.estudianteBDD._id;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de producto no válido" });

    const producto = await Producto.findOne({ _id: id, vendedor: vendedorId });
    if (!producto) return res.status(404).json({ msg: "Producto no encontrado o sin permisos" });
    if (producto.modelo_url) return res.status(400).json({ msg: "Este producto ya tiene un modelo 3D generado" });

    const resultadoModelo = await crearModelo3D(producto.imagen, producto._id.toString());

    producto.modelo_url = resultadoModelo?.url_model || null;
    producto.public_model_id = resultadoModelo?.public_model_id || null;
    await producto.save();

    res.status(200).json({ msg: "Modelo 3D generado correctamente", modelo_url: producto.modelo_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error generando modelo 3D", error: error.message });
  }
};
