import Resena from "../../models/Resena.js";
import Producto from "../../models/Producto.js";
import Orden from "../../models/Orden.js";
import mongoose from "mongoose";

// Función auxiliar para recalcular estadísticas del producto
const recalcularEstadisticasProducto = async (productoId) => {
  const resenas = await Resena.find({ producto: productoId });
  
  if (resenas.length === 0) {
    await Producto.findByIdAndUpdate(productoId, {
      promedioCalificacion: 0,
      totalResenas: 0,
      distribucionEstrellas: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    return;
  }

  const totalEstrellas = resenas.reduce((sum, r) => sum + r.estrellas, 0);
  const promedio = (totalEstrellas / resenas.length).toFixed(1);
  
  const distribucion = {
    5: resenas.filter(r => r.estrellas === 5).length,
    4: resenas.filter(r => r.estrellas === 4).length,
    3: resenas.filter(r => r.estrellas === 3).length,
    2: resenas.filter(r => r.estrellas === 2).length,
    1: resenas.filter(r => r.estrellas === 1).length,
  };

  await Producto.findByIdAndUpdate(productoId, {
    promedioCalificacion: parseFloat(promedio),
    totalResenas: resenas.length,
    distribucionEstrellas: distribucion
  });
};

// Crear o actualizar reseña
export const crearActualizarResena = async (req, res) => {
  try {
    const { productoId, estrellas, comentario } = req.body;
    const usuarioId = req.estudianteBDD._id;

    // Validaciones básicas
    if (!productoId || !estrellas) {
      return res.status(400).json({ msg: "Producto y estrellas son obligatorios" });
    }

    if (!mongoose.Types.ObjectId.isValid(productoId)) {
      return res.status(400).json({ msg: "ID de producto no válido" });
    }

    if (estrellas < 1 || estrellas > 5) {
      return res.status(400).json({ msg: "Las estrellas deben estar entre 1 y 5" });
    }

    if (comentario && comentario.length > 250) {
      return res.status(400).json({ msg: "El comentario no puede superar los 250 caracteres" });
    }

    // Verificar que el producto existe y está visible
    const producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    if (producto.eliminadoPorVendedor || !producto.activo) {
      return res.status(403).json({ 
        msg: "No puedes reseñar un producto que ya no está disponible" 
      });
    }

    // Verificar que el usuario haya comprado el producto Y lo haya recibido (estado: completada)
    const ordenCompletada = await Orden.findOne({
      producto: productoId,
      comprador: usuarioId,
      estado: "completada"
    });

    if (!ordenCompletada) {
      return res.status(403).json({ 
        msg: "Solo puedes reseñar productos que hayas comprado y recibido" 
      });
    }

    // Buscar si ya existe una reseña
    let resena = await Resena.findOne({ producto: productoId, usuario: usuarioId });

    if (resena) {
      // Actualizar reseña existente
      resena.estrellas = estrellas;
      resena.comentario = comentario?.trim() || "";
      await resena.save();

      // Recalcular estadísticas
      await recalcularEstadisticasProducto(productoId);

      return res.status(200).json({ 
        msg: "Reseña actualizada correctamente", 
        resena 
      });
    } else {
      // Crear nueva reseña
      resena = new Resena({
        producto: productoId,
        usuario: usuarioId,
        estrellas,
        comentario: comentario?.trim() || ""
      });

      await resena.save();

      // Recalcular estadísticas
      await recalcularEstadisticasProducto(productoId);

      return res.status(201).json({ 
        msg: "Reseña creada correctamente", 
        resena 
      });
    }
  } catch (error) {
    console.error(error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        msg: "Ya has reseñado este producto" 
      });
    }

    res.status(500).json({ 
      msg: "Error procesando reseña", 
      error: error.message 
    });
  }
};

// Visualizar reseñas de un producto con filtros
export const visualizarResenasProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { estrellas } = req.query; // Filtro opcional por estrellas

    if (!mongoose.Types.ObjectId.isValid(productoId)) {
      return res.status(400).json({ msg: "ID de producto no válido" });
    }

    // Construir filtro
    const filtro = { producto: productoId };
    if (estrellas) {
      const numEstrellas = parseInt(estrellas);
      if (numEstrellas >= 1 && numEstrellas <= 5) {
        filtro.estrellas = numEstrellas;
      }
    }

    // Obtener reseñas con datos del usuario
    const resenas = await Resena.find(filtro)
      .populate("usuario", "nombre apellido")
      .sort({ createdAt: -1 })
      .lean();

    // Obtener producto para estadísticas
    const producto = await Producto.findById(productoId).select('promedioCalificacion totalResenas distribucionEstrellas');

    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.status(200).json({
      totalResenas: producto.totalResenas,
      promedioEstrellas: producto.promedioCalificacion,
      distribucion: producto.distribucionEstrellas,
      resenas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      msg: "Error obteniendo reseñas", 
      error: error.message 
    });
  }
};

// Visualizar reseñas del usuario autenticado
export const visualizarMisResenas = async (req, res) => {
  try {
    const usuarioId = req.estudianteBDD._id;

    const resenas = await Resena.find({ usuario: usuarioId })
      .populate("producto", "nombreProducto imagen precio")
      .sort({ createdAt: -1 })
      .lean();

    if (!resenas.length) {
      return res.status(404).json({ msg: "No has realizado ninguna reseña" });
    }

    res.status(200).json({
      totalResenas: resenas.length,
      resenas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      msg: "Error obteniendo tus reseñas", 
      error: error.message 
    });
  }
};

// Obtener reseña del usuario para un producto específico
export const obtenerMiResena = async (req, res) => {
  try {
    const { productoId } = req.params;
    const usuarioId = req.estudianteBDD._id;

    if (!mongoose.Types.ObjectId.isValid(productoId)) {
      return res.status(400).json({ msg: "ID de producto no válido" });
    }

    const resena = await Resena.findOne({ 
      producto: productoId, 
      usuario: usuarioId 
    }).populate("usuario", "nombre apellido");

    if (!resena) {
      return res.status(404).json({ msg: "No has reseñado este producto" });
    }

    res.status(200).json({ resena });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      msg: "Error obteniendo tu reseña", 
      error: error.message 
    });
  }
};

// Verificar si el usuario puede reseñar un producto
export const verificarPuedeResenar = async (req, res) => {
  try {
    const { productoId } = req.params;
    const usuarioId = req.estudianteBDD._id;

    if (!mongoose.Types.ObjectId.isValid(productoId)) {
      return res.status(400).json({ msg: "ID de producto no válido" });
    }

    // Verificar producto existe y está visible
    const producto = await Producto.findById(productoId);
    if (!producto || producto.eliminadoPorVendedor || !producto.activo) {
      return res.status(200).json({ 
        puedeResenar: false, 
        razon: "Producto no disponible" 
      });
    }

    // Verificar compra completada
    const ordenCompletada = await Orden.findOne({
      producto: productoId,
      comprador: usuarioId,
      estado: "completada"
    });

    if (!ordenCompletada) {
      return res.status(200).json({ 
        puedeResenar: false, 
        razon: "No has comprado este producto o aún no lo has recibido" 
      });
    }

    // Verificar si ya tiene reseña
    const resenaExistente = await Resena.findOne({ 
      producto: productoId, 
      usuario: usuarioId 
    });

    res.status(200).json({ 
      puedeResenar: true,
      tieneResena: !!resenaExistente,
      resena: resenaExistente || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      msg: "Error verificando permisos", 
      error: error.message 
    });
  }
};