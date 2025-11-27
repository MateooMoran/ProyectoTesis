import Producto from "../../models/Producto.js";
import { crearModelo3D, consultarProgresoMeshy } from "../../utils/apis.js";
import mongoose from "mongoose";
import cloudinary from "cloudinary";

const MAX_INTENTOS = 3;

// Generar modelo 3D para un producto
export const generarModelo3DParaProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const vendedorId = req.estudianteBDD._id;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID de producto no válido" });

    const producto = await Producto.findOne({ _id: id, vendedor: vendedorId });
    if (!producto) return res.status(404).json({ msg: "Producto no encontrado o sin permisos" });
    
    // Verificar intentos restantes
    const intentosUsados = producto.intentosModelo3D || 0;
    const intentosRestantes = MAX_INTENTOS - intentosUsados;
    
    console.log(`📊 Intentos de modelo 3D: ${intentosUsados}/${MAX_INTENTOS} usados, ${intentosRestantes} restantes`);
    
    if (intentosUsados >= MAX_INTENTOS) {
      return res.status(403).json({ 
        msg: `Has alcanzado el límite de ${MAX_INTENTOS} intentos para generar el modelo 3D de este producto`,
        intentosUsados,
        intentosRestantes: 0
      });
    }
    
    // Si ya tiene modelo generado, permitir regenerar pero eliminar el anterior
    if (producto.modelo_url && producto.model_id) {
      console.log(`🗑️ Eliminando modelo anterior de Cloudinary: ${producto.model_id}`);
      try {
        await cloudinary.v2.uploader.destroy(producto.model_id, { resource_type: 'raw' });
        console.log('✅ Modelo anterior eliminado de Cloudinary');
      } catch (deleteError) {
        console.error('⚠️ Error eliminando modelo anterior:', deleteError.message);
      }
      
      // Resetear para nueva generación
      producto.modelo_url = null;
      producto.model_id = null;
      producto.task_id = null;
      producto.progreso = 0;
      await producto.save();
    }
    
    // Si ya está en proceso, verificar el estado real en Meshy
    if (producto.task_id) {
      console.log("🔍 Producto ya tiene task_id, verificando estado en Meshy...");
      try {
        const estadoMeshy = await consultarProgresoMeshy(producto.task_id);
        console.log("📊 Estado en Meshy:", estadoMeshy);
        
        // Si falló o fue cancelado, permitir reintentar
        if (estadoMeshy.status === 'FAILED' || estadoMeshy.status === 'CANCELED') {
          console.log("⚠️ Tarea falló o fue cancelada, permitiendo reintento");
          producto.task_id = null;
          producto.progreso = 0;
          await producto.save();
          // Continuar con nueva generación
        } else {
          // Si está en progreso o exitoso, retornar estado actual
          return res.status(202).json({
            msg: "Generación ya en progreso",
            task_id: producto.task_id,
            progress: estadoMeshy.progress || producto.progreso || 0,
            status: estadoMeshy.status
          });
        }
      } catch (error) {
        console.log("❌ Error consultando Meshy, permitiendo reintento:", error.message);
        // Si no se puede consultar, resetear para permitir reintento
        producto.task_id = null;
        producto.progreso = 0;
        await producto.save();
      }
    }
    
    // Obtener la URL de la imagen
    let imagenUrl = producto.imagen || producto.imagenIA;
    
    // Si imagenIA es un objeto JSON, extraer secure_url
    if (typeof imagenUrl === 'string' && imagenUrl.startsWith('{')) {
      try {
        const imagenObj = JSON.parse(imagenUrl);
        imagenUrl = imagenObj.secure_url || imagenObj.url;
      } catch (e) {
        console.log("imagenIA no es un objeto JSON válido, usando como string");
      }
    }

    if (!imagenUrl) {
      return res.status(400).json({ msg: "El producto debe tener una imagen para generar el modelo 3D" });
    }

    console.log("✅ Iniciando generación de modelo 3D desde imagen:", imagenUrl);
    console.log("📦 Producto ID:", producto._id.toString());
    console.log("👤 Vendedor ID:", vendedorId.toString());
    
    // Iniciar generación en background y retornar task_id inmediatamente
    const resultadoModelo = await crearModelo3D(imagenUrl, producto._id.toString(), req);
    console.log("🔑 Task ID recibido:", resultadoModelo?.task_id);

    // Guardar task_id en el producto e incrementar intentos
    producto.task_id = resultadoModelo?.task_id || null;
    producto.progreso = 0;
    producto.intentosModelo3D = intentosUsados + 1;
    await producto.save();
    console.log("💾 Task ID guardado en producto");
    console.log(`📈 Intentos actualizados: ${producto.intentosModelo3D}/${MAX_INTENTOS}`);

    const nuevosIntentosRestantes = MAX_INTENTOS - producto.intentosModelo3D;
    
    res.status(202).json({ 
      msg: "Generación de modelo 3D iniciada", 
      task_id: producto.task_id,
      progress: 0,
      status: 'PENDING',
      intentosUsados: producto.intentosModelo3D,
      intentosRestantes: nuevosIntentosRestantes
    });
  } catch (error) {
    console.error("Error en generarModelo3DParaProducto:", error);
    res.status(500).json({ msg: "Error generando modelo 3D", error: error.message });
  }
};

// Consultar estado del modelo 3D por ID de producto
export const consultarEstadoModelo = async (req, res) => {
  try {
    const { id } = req.params;
    const vendedorId = req.estudianteBDD._id;

    const producto = await Producto.findOne({ _id: id, vendedor: vendedorId });
    if (!producto) return res.status(404).json({ msg: "Producto no encontrado" });

    // Si ya tiene el modelo generado
    if (producto.modelo_url) {
      return res.status(200).json({
        status: 'SUCCEEDED',
        progress: 100,
        modelo_url: producto.modelo_url
      });
    }

    // Si no tiene task_id, no hay generación en progreso
    if (!producto.task_id) {
      return res.status(200).json({
        status: 'NOT_STARTED',
        progress: 0,
        modelo_url: null
      });
    }

    // Consultar estado en Meshy
    try {
      console.log("🔍 Consultando estado en Meshy para task_id:", producto.task_id);
      const progresoData = await consultarProgresoMeshy(producto.task_id);
      const { status, progress = 0 } = progresoData;
      console.log("📊 Estado recibido de Meshy:", { status, progress });

      // Si está completado pero no tiene modelo_url, el proceso background falló
      if (status === 'SUCCEEDED' && progress === 100 && !producto.modelo_url) {
        console.log("⚠️ Modelo completado en Meshy pero falta modelo_url, reseteando...");
        producto.task_id = null;
        producto.progreso = 0;
        await producto.save();
        
        return res.status(200).json({
          status: 'FAILED',
          progress: 0,
          modelo_url: null,
          msg: 'Generación falló. Por favor intenta de nuevo.'
        });
      }

      // Actualizar progreso en BD
      producto.progreso = progress;
      await producto.save();

      return res.status(200).json({
        status,
        progress,
        modelo_url: producto.modelo_url || null
      });
    } catch (error) {
      console.log("❌ Error consultando Meshy:", error.message);
      // Si hay error consultando Meshy (tarea no existe), resetear
      if (error.message?.includes('no encontrada')) {
        producto.task_id = null;
        producto.progreso = 0;
        await producto.save();
        
        return res.status(200).json({
          status: 'NOT_STARTED',
          progress: 0,
          modelo_url: null
        });
      }
      
      // Si hay error consultando Meshy, retornar el progreso guardado
      return res.status(200).json({
        status: producto.estadoModelo3D || 'IN_PROGRESS',
        progress: producto.progreso || 0,
        modelo_url: producto.modelo_url || null
      });
    }

  } catch (error) {
    console.error("Error consultando estado:", error);
    res.status(500).json({ msg: "Error consultando estado del modelo", error: error.message });
  }
};
