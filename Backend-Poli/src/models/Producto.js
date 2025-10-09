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
    imagenID: {
      type: String,
      trim: true,
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
      required: true

    },
    vendedor: {
      type: Schema.Types.ObjectId,
      ref: "Estudiantes",
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
    },
    eliminadoPorVendedor: {
      type: Boolean,
      default: false, 
    },
    vendidos: {
      type: Number,
      default: 0
    },
    modelo_url: {
      type: String,
      trim: true,
    },
    model_id: {
      type: String,
      trim: true,
    },
    embedding: {
      type: [Number],
      default: []
    },
  },
  {
    timestamps: true,
  }
);

export default model("Producto", productoSchema);
