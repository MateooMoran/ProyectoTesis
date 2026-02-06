import axios from "axios";
import cloudinary from "cloudinary"; 
import { compressGLBBuffer } from "./glbCompressor.js";
import Producto from "../models/Producto.js";
import { crearNotificacionSocket } from "./notificaciones.js";

const headers = { Authorization: `Bearer ${process.env.MESHY_API_TOKEN}` };

export async function crearModelo3D(imagenCloudinary, imageId, req) {
  if (!imagenCloudinary) throw new Error("Debes pasar la URL de la imagen de Cloudinary");

  const payload = {
    image_url: imagenCloudinary,
    enable_pbr: true,
    should_remesh: true,
    should_texture: true,
    target_polycount: 30000,
    ai_model: "meshy-5",
  };

  try {
    console.log("🚀 Enviando request a Meshy API...");
    console.log("📸 Imagen URL:", imagenCloudinary);
    const response = await axios.post(
      `${process.env.URL_API_MESHY}image-to-3d`,
      payload,
      { headers }
    );

    const taskId = response?.data?.result;
    if (!taskId) throw new Error("No se obtuvo el ID del modelo 3D");
    console.log("✅ Modelo 3D solicitado con task ID:", taskId);
    console.log("🔄 Iniciando proceso en background...");

    // Lanzar proceso en background para completar la tarea (no await)
    (async function backgroundProcess(taskIdInner, imageIdInner, reqContext) {
      let producto = null;
      let vendedorId = null;

      try {
        console.log("⏳ Background process iniciado para task:", taskIdInner);
        // Obtener vendedorId si hay contexto de request
        if (reqContext?.estudianteBDD?._id) {
          vendedorId = reqContext.estudianteBDD._id;
          console.log("👤 Vendedor ID en background:", vendedorId.toString());
        }

        // Notificar inicio de generación
        if (vendedorId && imageIdInner) {
          try {
            console.log("📬 Enviando notificación de inicio...");
            await crearNotificacionSocket(reqContext, vendedorId, 
              "Generación de modelo 3D iniciada. Te notificaremos cuando esté listo.", 
              "sistema");
            console.log("✅ Notificación de inicio enviada");
          } catch (notifError) {
            console.error("❌ Error enviando notificación de inicio:", notifError.message);
          }
        }

        console.log("🔍 Iniciando verificación de status en Meshy...");

        const modeloFinal = await verificarStatusModelo3D(taskIdInner, imageIdInner, reqContext, vendedorId);
        const glbURL = modeloFinal.model_urls.glb;
        console.log("URL del modelo GLB desde Meshy:", glbURL);

        // Actualizar estado a "downloading"
        if (imageIdInner) {
          await Producto.findByIdAndUpdate(imageIdInner, { estadoModelo3D: 'downloading' });
        }

        const downloadResponse = await axios.get(glbURL, { responseType: "arraybuffer" });
        const glbBuffer = Buffer.from(downloadResponse.data);

        const compressedBuffer = await compressGLBBuffer(glbBuffer);
        console.log("Modelo GLB comprimido");

        // Actualizar estado a "uploading"
        if (imageIdInner) {
          await Producto.findByIdAndUpdate(imageIdInner, { estadoModelo3D: 'uploading' });
        }

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            {
              resource_type: "raw",
              folder: "modelos3D",
              public_id: `modelo_${imageIdInner || taskIdInner}`,
              format: "glb",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(compressedBuffer);
        });

        console.log("Subido a Cloudinary:", uploadResult.secure_url);

        // Actualizar producto con modelo completo y estado "completed"
        if (imageIdInner) {
          try {
            producto = await Producto.findByIdAndUpdate(
              imageIdInner, 
              {
                modelo_url: uploadResult.secure_url,
                model_id: uploadResult.public_id,
                estadoModelo3D: 'completed',
                mensajeError: null,
                progreso: 100,
                // NO eliminar task_id aquí, se eliminará después de notificación
              },
              { new: true }
            );
            console.log(`✅ Producto ${imageIdInner} actualizado con modelo 3D:`, uploadResult.secure_url);

            // Notificar éxito
            if (vendedorId && reqContext) {
              try {
                await crearNotificacionSocket(reqContext, vendedorId, 
                  "¡Tu modelo 3D se ha generado exitosamente! Ya puedes visualizarlo.", 
                  "sistema");
                console.log("✅ Notificación de éxito enviada");
              } catch (notifError) {
                console.error("❌ Error enviando notificación de éxito:", notifError.message);
              }
            }

            // Ahora sí, limpiar task_id después de todo completado
            await Producto.findByIdAndUpdate(imageIdInner, { task_id: null });
            console.log(`🧹 task_id limpiado para producto ${imageIdInner}`);
          } catch (err) {
            console.error("❌ Error actualizando producto con modelo 3D:", err.message || err);
            throw err;
          }
        }

      } catch (error) {
        console.error("Error en backgroundProcess crearModelo3D:", error.message || error);
        
        // Rollback: decrementar intentos, marcar como failed, guardar error
        if (imageIdInner) {
          try {
            producto = await Producto.findById(imageIdInner);
            if (producto) {
              producto.estadoModelo3D = 'failed';
              producto.mensajeError = error.message || "Error desconocido durante la generación";
              producto.intentosModelo3D = Math.max(0, (producto.intentosModelo3D || 1) - 1);
              producto.task_id = null;
              await producto.save();

              console.log(`Producto ${imageIdInner} marcado como failed, intentos decrementados a ${producto.intentosModelo3D}`);

              // Notificar error
              if (vendedorId && reqContext) {
                try {
                  await crearNotificacionSocket(reqContext, vendedorId, 
                    `Error generando modelo 3D: ${producto.mensajeError}. Intento devuelto.`, 
                    "sistema");
                } catch (notifError) {
                  console.error("Error enviando notificación de fallo:", notifError.message);
                }
              }
            }
          } catch (rollbackError) {
            console.error("Error durante rollback:", rollbackError.message);
          }
        }
      }
    })(taskId, imageId, req).catch(err => console.error(err));

    // Devolver inmediatamente el taskId para que el frontend / controlador lo guarde
    return { task_id: taskId };

  } catch (error) {
    console.error("Error en crearModelo3D:", error.message);
    throw error;
  }
}

// Polling para verificar el estado del modelo 3D en Meshy
async function verificarStatusModelo3D(taskId, imageIdInner, reqContext, vendedorId, maxIntentos = 180, intervalo = 5000) {
  for (let i = 0; i < maxIntentos; i++) {
    try {
      const response = await axios.get(
        `${process.env.URL_API_MESHY}image-to-3d/${taskId}`,
        { headers }
      );

      const { status, progress, task_error } = response.data;

      console.log(`[Meshy] Task ${taskId} - Status: ${status}, Progress: ${progress}%`);

      // Actualizar progreso en BD
      if (imageIdInner && progress !== undefined) {
        try {
          await Producto.findByIdAndUpdate(imageIdInner, { progreso: progress });
        } catch (updateError) {
          console.error("Error actualizando progreso:", updateError.message);
        }
      }

      if (status === "SUCCEEDED") {
        return response.data;
      }

      if (status === "FAILED") {
      }

      if (status === "CANCELED") {
        throw new Error("La tarea fue cancelada");
      }

      // Esperar antes de reintentar
      await new Promise((resolve) => setTimeout(resolve, intervalo));
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error("Tarea no encontrada en Meshy");
      }
      throw error;
    }
  }

  throw new Error("Timeout: El modelo 3D no se completó en el tiempo esperado");
}

// Función exportada para consultar progreso (usada por SSE)
export async function consultarProgresoMeshy(taskId) {
  try {
    const response = await axios.get(
      `${process.env.URL_API_MESHY}image-to-3d/${taskId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Tarea no encontrada en Meshy");
    }
    throw error;
  }
}

