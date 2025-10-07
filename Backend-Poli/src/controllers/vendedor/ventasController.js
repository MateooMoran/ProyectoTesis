import Orden from "../../models/Orden.js";

// Visualizar historial de ventas del vendedor
export const visualizarHistorialVentasVendedor = async (req, res) => {
  try {
    const historial = await Orden.find({ vendedor: req.estudianteBDD._id })
      .populate("comprador", "nombre apellido")
      .populate("productos.producto", "nombreProducto precio imagen estado activo vendidos")
      .sort({ createdAt: -1 });

    if (!historial.length) return res.status(404).json({ msg: "No tienes ventas registradas" });

    res.status(200).json(historial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo historial de ventas", error: error.message });
  }
};

// Actualizar estado de una venta a "pagado"
export const actualizarEstadoVenta = async (req, res) => {
  try {
    const venta = await Orden.findByIdAndUpdate(
      req.params.id,
      { estado: 'pagado' },
      { new: true }
    );

    if (!venta) return res.status(404).json({ msg: 'Venta no encontrada' });

    res.status(200).json({ msg: 'Venta actualizada a pagado', venta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error actualizando venta', error: error.message });
  }
};
