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

    // Filtrar solo items con embeddings válidos (no vacíos)
    const itemsConEmbedding = itemsParaEmbedding.filter(item => {
      if (!item.embedding || !Array.isArray(item.embedding) || item.embedding.length === 0) return false;
      // Verificar que no sea un vector de ceros
      const sumaTotal = item.embedding.reduce((sum, val) => sum + Math.abs(val), 0);
      return sumaTotal > 0;
    });

    if (!itemsConEmbedding.length) {
      console.log("⚠️ No hay productos con embeddings válidos para generar recomendaciones");
      return;
    }

    // Crear embedding promedio del usuario
    const embeddingUsuario = itemsConEmbedding[0].embedding.map((_, i) =>
      itemsConEmbedding.reduce((sum, item) => sum + (item.embedding[i] || 0), 0) / itemsConEmbedding.length
    );

    // Buscar candidatos
    const idsComprados = productosComprados.map(p => p._id.toString());
    const productos = await Producto.find({
      stock: { $gt: 0 },
      activo: true,
      _id: { $nin: idsComprados }
    });

    // Filtrar productos con embeddings válidos y calcular similitud
    const productosScored = productos
      .filter(p => {
        if (!p.embedding || !Array.isArray(p.embedding) || p.embedding.length === 0) return false;
        const sumaTotal = p.embedding.reduce((sum, val) => sum + Math.abs(val), 0);
        return sumaTotal > 0;
      })
      .map(p => ({
        producto: p,
        score: similitudCoseno(embeddingUsuario, p.embedding)
      }))
      .filter(item => item.score > 0); // Solo productos con score válido

    if (productosScored.length === 0) {
      console.log("⚠️ No hay productos con embeddings válidos para recomendar");
      return;
    }

    // Top 3 recomendaciones
    productosScored.sort((a, b) => b.score - a.score);
    const topRecomendaciones = productosScored.slice(0, 3).map(p => {
      const { createdAt, updatedAt, __v, embedding, ...resto } = p.producto._doc;
      return resto;
    });

    console.log(`✅ Generadas ${topRecomendaciones.length} recomendaciones para ${estudiante.nombre}`);

    // Enviar correo de recomendaciones
    await sendMailRecomendaciones(estudiante.email, estudiante.nombre, topRecomendaciones);

  } catch (error) {
    console.error("❌ Error generando recomendaciones:", error.message);
  }
};
