import { Schema, model } from "mongoose";

const quejaSugerenciaSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    tipo: {
      type: String,
      enum: ["queja", "sugerencia"],
      required: true,
    },
    mensaje: {
      type: String,
      required: true,
    },
    respuesta: {
      type: String,
      default: null,
    },
    estado: {
      type: String,
      enum: ["pendiente", "resuelto"],
      default: "pendiente",
    },
  },
  {
    timestamps: true,
  }
);

export default model("QuejaSugerencia", quejaSugerenciaSchema);
