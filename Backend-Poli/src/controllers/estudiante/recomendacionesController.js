import Producto from "../../models/Producto.js";
import Estudiante from "../../models/Estudiante.js";
import Orden from "../../models/Orden.js";
import { similitudCoseno } from "../../utils/embeddings.js";
import { sendMailRecomendaciones } from "../../config/nodemailer.js";

export const generarYEnviarRecomendaciones = async (estudianteId) => {
  try {
    const estudiante = await Estudiante.findById(estudianteId).populate("favoritos");
    if (!estudiante) return;

    const favoritos = estudiante.favoritos || [];

    // Obtener historial de compras
    const ordenes = await Orden.find({
      comprador: estudianteId,
      estado: "pagado"
    }).populate("productos.producto");

    const productosComprados = [];
    ordenes.forEach(orden => {
      orden.productos.forEach(item => {
        if (item.producto) productosComprados.push(item.producto);
      });
    });

    // Si no hay base para recomendar
    const itemsParaEmbedding = [...favoritos, ...productosComprados];
    if (!itemsParaEmbedding.length) return;

    // Crear embedding promedio del usuario
    const embeddingUsuario = itemsParaEmbedding[0].embedding.map((_, i) =>
      itemsParaEmbedding.reduce((sum, item) => sum + (item.embedding[i] || 0), 0) / itemsParaEmbedding.length
    );

    // Buscar candidatos
    const idsComprados = productosComprados.map(p => p._id.toString());
    const productos = await Producto.find({
      stock: { $gt: 0 },
      activo: true,
      _id: { $nin: idsComprados }
    });

    // Calcular similitud coseno
    const productosScored = productos.map(p => ({
      producto: p,
      score: similitudCoseno(embeddingUsuario, p.embedding)
    }));

    // Top 3 recomendaciones
    productosScored.sort((a, b) => b.score - a.score);
    const topRecomendaciones = productosScored.slice(0, 3).map(p => {
      const { createdAt, updatedAt, __v, embedding, ...resto } = p.producto._doc;
      return resto;
    });

    // Enviar correo de recomendaciones
    await sendMailRecomendaciones(estudiante.email, estudiante.nombre, topRecomendaciones);

  } catch (error) {
    console.error("Error generando recomendaciones:", error.message);
  }
};
