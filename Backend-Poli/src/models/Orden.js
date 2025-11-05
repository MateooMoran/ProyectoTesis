import { Schema, model } from "mongoose";

const ordenSchema = new Schema({
  comprador: { type: Schema.Types. ObjectId, ref: "Estudiantes", required: true },
  vendedor: { type: Schema.Types.ObjectId, ref: "Estudiantes", required: true },
  producto: { type: Schema.Types.ObjectId, ref: "Producto", required: true },
  cantidad: { type: Number, required: true },
  precioUnitario: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  estado: {
    type: String,
    enum: [
      "pendiente_pago",
      "comprobante_subido",
      "pago_confirmado_vendedor",
      "producto_entregado",
      "completada",
      "cancelada"
    ],
    default: "pendiente_pago"
  },
  metodoPagoVendedor: { type: Schema.Types.ObjectId, ref: "MetodoPagoVendedor", required: false },
  tipoPago: { type: String, enum: ["transferencia", "qr", "retiro", "tarjeta"], default: null },
  lugarRetiroSeleccionado: { type: String, trim: true },

  comprobantePago: { type: String },
  confirmadoPagoVendedor: { type: Boolean, default: false },
  confirmadoEntregaComprador: { type: Boolean, default: false },
  fechaComprobanteSubido: { type: Date },
  fechaPagoConfirmado: { type: Date },
  fechaProductoEntregado: { type: Date },
  fechaCompletada: { type: Date }
}, { timestamps: true });

export default model("Orden", ordenSchema);
