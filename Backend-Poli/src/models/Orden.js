import { Schema, model } from "mongoose";

const ordenSchema = new Schema({
  comprador: {
    type: Schema.Types.ObjectId,
    ref: "estudiante",
    required: true
  },
  vendedor: {
    type: Schema.Types.ObjectId,
    ref: "estudiante",
    required: true
  },
  productos: [
    {
      producto: {
        type: Schema.Types.ObjectId,
        ref: "producto",
        required: true
      },
      cantidad: {
        type: Number,
        required: true
      },
      precioUnitario: {
        type: Number,
        required: true
      },
      subtotal: {
        type: Number,
        required: true
      }
    }
  ],
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ["pendiente", "pagado", "cancelado"],
    default: "pendiente"
  },
  metodoPago: {
    type: String,
    enum: ["efectivo", "tarjeta", "transferencia", "otro"],
    default: "efectivo"
  }
}, {
  timestamps: true
});

export default model("Orden", ordenSchema);
