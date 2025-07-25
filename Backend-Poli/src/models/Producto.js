import { Schema, model } from "mongoose";

const productoSchema = new Schema(
  {
    nombreProducto: {
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
      default: 1,
      required: true,

    },
    descripcion: {
      type: String,
      trim: true,
      required: true,

    },
    imagen: {
      type: String,
      trim: true
    },
    imagenIA: {
      type: String,
      trim: true
    },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: "Categoria",
    },
    vendedor: {
      type: Schema.Types.ObjectId,
      ref: "vendedor",
      required: true,
    },
    estado: {
      type: String,
      enum: ["disponible", "no disponible"],
      default: "disponible",
    },
    activo: {
      type: Boolean,
      default: true,
    }

  },
  {
    timestamps: true,
  }
);

export default model("Producto", productoSchema);
