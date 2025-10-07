import axios from "axios";
import cloudinary from "cloudinary"; 
import { compressGLBBuffer } from "./glbCompressor.js"; 

const headers = { Authorization: `Bearer ${process.env.MESHY_API_TOKEN}` };

export async function crearModelo3D(imagenCloudinary, imageId) {
  if (!imagenCloudinary) throw new Error("Debes pasar la URL de la imagen de Cloudinary");

  const payload = {
    image_url: imagenCloudinary,
    enable_pbr: true,
    should_remesh: true,
    should_texture: true,
  };

  try {
    const response = await axios.post(
      `${process.env.URL_API_MESHY}image-to-3d`,
      payload,
      { headers }
    );

    const taskId = response?.data?.result;
    if (!taskId) throw new Error("No se obtuvo el ID del modelo 3D");
    console.log("Modelo 3D solicitado con task ID:", taskId);

    const modeloFinal = await verificarStatusModelo3D(taskId);
    const glbURL = modeloFinal.model_urls.glb;
    console.log("URL del modelo GLB desde Meshy:", glbURL);

    const downloadResponse = await axios.get(glbURL, { responseType: "arraybuffer" });
    const glbBuffer = Buffer.from(downloadResponse.data);

    const compressedBuffer = await compressGLBBuffer(glbBuffer);
    console.log("Modelo GLB comprimido");

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "modelos3D",
          public_id: `modelo_${imageId || taskId}`,
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

    return {
      url_model: uploadResult.secure_url,
      public_model_id: uploadResult.public_id,
      task_id: taskId,
    };

  } catch (error) {
    console.error("Error en crearModelo3D:", error.message);
    throw error;
  }
}
