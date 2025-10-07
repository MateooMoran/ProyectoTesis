import Producto from "../../models/Producto.js";
import Estudiante from "../../models/Estudiante.js";
import Orden from "../../models/Orden.js";
import { similitudCoseno } from "../../utils/embeddings.js";
import { sendMailRecomendaciones } from "../../config/nodemailer.js";

// Obtener recomendaciones basadas en favoritos y compras
export const obtenerRecomendaciones = async (req, res) => {
    try {
        const estudianteId = req.estudianteBDD._id;

        const estudiante = await Estudiante.findById(estudianteId).populate("favoritos");
        const favoritos = estudiante.favoritos || [];

        // Obtener historial de compras pagadas
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

        // Usar embeddings de favoritos + compras pasadas para el perfil del usuario
        const itemsParaEmbedding = [...favoritos, ...productosComprados];
        if (!itemsParaEmbedding.length) {
            return res.json({ msg: "Sin favoritos ni compras, sin recomendaciones", recomendaciones: [] });
        }

        // Promediar embeddings del usuario
        const embeddingUsuario = itemsParaEmbedding[0].embedding.map((_, i) =>
            itemsParaEmbedding.reduce((sum, item) => sum + (item.embedding[i] || 0), 0) / itemsParaEmbedding.length
        );

        // Obtener productos candidatos (stock > 0, activo, y que no haya comprado)
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

        // Ordenar por similitud descendente
        productosScored.sort((a, b) => b.score - a.score);

        // Tomar el top 3
        const topRecomendaciones = productosScored.slice(0, 3).map(p => {
            const { createdAt, updatedAt, __v, embedding, ...resto } = p.producto._doc;
            return resto;
        });

        // Enviar correo de forma asíncrona (sin bloquear)
        sendMailRecomendaciones(estudiante.email, estudiante.nombre, topRecomendaciones)
            .catch(error => {
                console.log("Error al enviar correo de recomendaciones (no bloqueante):", {
                    error: error.message,
                    code: error.code,
                    command: error.command
                });
            });

        res.json({
            msg: "Recomendaciones obtenidas exitosamente",
            recomendaciones: topRecomendaciones,
        });

    } catch (error) {
        console.error("Error obtenerRecomendaciones:", error);
        res.status(500).json({ msg: "Error al obtener recomendaciones", error: error.message });
    }
};
