import { Schema, model } from "mongoose";

const ordenSchema = new Schema(
  {
    comprador: {
      type: Schema.Types.ObjectId,
      ref: "estudiante",
      required: true,
    },
    productos: [
      {
        producto: { type: Schema.Types.ObjectId, ref: "Producto", required: true },
        cantidad: { type: Number, required: true, default: 1 },
      }
    ],
    total: {
      type: Number,
      required: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "pagado"],
      default: "pendiente",
    },
  },
  {
    timestamps: true,
  }
);

export default model("Carrito", ordenSchema);
