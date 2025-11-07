import { Schema, model } from "mongoose";

const resenaSchema = new Schema(
  {
    producto: {
      type: Schema.Types.ObjectId,
      ref: "Producto",
      required: true
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Estudiantes",
      required: true
    },
    estrellas: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comentario: {
      type: String,
      trim: true,
      maxlength: 250,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

resenaSchema.index({ producto: 1, usuario: 1 }, { unique: true });

export default model("Resena", resenaSchema);