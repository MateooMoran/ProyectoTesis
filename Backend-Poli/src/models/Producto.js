import { Schema, model } from "mongoose";

const productoSchema = new Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: "Categoria",
      required: true,
    },
    vendedor: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Producto", productoSchema);
