import { Schema, model } from "mongoose";

const ordenSchema = new Schema(
  {
    comprador: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    producto: {
        type: Schema.Types.ObjectId,
        ref: "Producto",
        required: true,
    },
    cantidad: {
        type: Number,
        required: true,
        default: 1,
    },
    total: {
      type: Number,
      required: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "pagado", "enviado"],
      default: "pendiente",
    },
  },
  {
    timestamps: true,
  }
);

export default model("Orden", ordenSchema);
