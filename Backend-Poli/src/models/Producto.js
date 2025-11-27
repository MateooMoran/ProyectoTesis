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
      trim: true,
    },
    imagenIA: {
      type: String,
      trim: true,
    },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: "Categoria",
      required: true,
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
      default: 0,
    },
    modelo_url: {
      type: String,
      trim: true,
    },
    model_id: {
      type: String,
      trim: true,
    },
    task_id: {
      type: String,
      trim: true,
    },
    intentosModelo3D: {
      type: Number,
      default: 0,
      max: 3,
    },
    progreso: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    promedioCalificacion: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalResenas: {
      type: Number,
      default: 0,
    },
    distribucionEstrellas: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 },
    },

    nombreNormalizado: {
      type: String,
      index: true, 
    },
    descripcionNormalizada: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para normalizar texto antes de guardar
productoSchema.pre("save", function (next) {
  const normalizar = (t) =>
    t?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  if (this.nombreProducto)
    this.nombreNormalizado = normalizar(this.nombreProducto);

  if (this.descripcion)
    this.descripcionNormalizada = normalizar(this.descripcion);

  next();
});

export default model("Producto", productoSchema);
