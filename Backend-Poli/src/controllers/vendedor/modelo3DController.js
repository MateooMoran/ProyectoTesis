import Producto from "../../models/Producto.js";
import { crearModelo3D, consultarProgresoMeshy } from "../../utils/apis.js";
import mongoose from "mongoose";

const MAX_INTENTOS = 3;

// Generar modelo 3D para un producto
export const generarModelo3DParaProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const vendedorId = req.estudianteBDD._id;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de producto no válido" });

    const producto = await Producto.findOne({ _id: id, vendedor: vendedorId });
    if (!producto) return res.status(404).json({ msg: "Producto no encontrado o sin permisos" });
    
    // Si ya tiene modelo generado, retornar info
    if (producto.modelo_url) {
      return res.status(200).json({ 
        msg: "Modelo 3D ya generado",
        modelo_url: producto.modelo_url,
        progreso: 100,
        estado: 'completed'
      });
    }

    // Si tiene task_id activo, consultar progreso
    if (producto.task_id) {
      try {
        const progresoData = await consultarProgresoMeshy(producto.task_id);
        const { status, progress = 0 } = progresoData;

        // Actualizar progreso en BD
        await Producto.findByIdAndUpdate(id, { progreso: progress });

        return res.status(200).json({
          msg: "Generación en progreso",
          task_id: producto.task_id,
          progreso: progress,
          estado: status,
          intentos: producto.intentosModelo3D,
          intentosRestantes: MAX_INTENTOS - producto.intentosModelo3D
        });
      } catch (err) {
        console.error("Error consultando progreso:", err.message);
      }
    }
    
    // Verificar límite de intentos
    if (producto.intentosModelo3D >= MAX_INTENTOS) {
      return res.status(403).json({ 
        msg: `Has alcanzado el límite de ${MAX_INTENTOS} intentos para generar el modelo 3D de este producto`,
        intentos: producto.intentosModelo3D,
        maxIntentos: MAX_INTENTOS
      });
    }
    
    // Validar que el producto tenga imagen o imagenIA
    const imagenFuente = producto.imagenIA || producto.imagen;
    if (!imagenFuente) {
      return res.status(400).json({ msg: "El producto no tiene una imagen asociada. Agrega una imagen antes de generar el modelo 3D." });
    }

    // Incrementar contador de intentos y guardar task_id inmediatamente
    producto.intentosModelo3D = (producto.intentosModelo3D || 0) + 1;
    producto.progreso = 0;
    
    // Iniciar tarea en Meshy (devuelve task_id inmediatamente)
    const resultado = await crearModelo3D(imagenFuente, producto._id.toString(), req);

    const taskId = resultado?.task_id || null;
    producto.task_id = taskId;
    await producto.save();

    return res.status(202).json({
      msg: "Generación de modelo 3D iniciada",
      task_id: taskId,
      progreso: 0,
      estado: 'PENDING',
      intentos: producto.intentosModelo3D,
      intentosRestantes: MAX_INTENTOS - producto.intentosModelo3D
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error generando modelo 3D", error: error.message });
  }
};
