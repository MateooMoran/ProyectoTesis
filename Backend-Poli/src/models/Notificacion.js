// models/Notificacion.js
import { Schema, model } from "mongoose";

const notificacionSchema = new Schema({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Estudiantes", 
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  leido: {
    type: Boolean,
    default: false
  },
  tipo: {
    type: String,
    enum: ["venta", "sistema", "mensaje"],
    default: "sistema"
  }
}, {
  timestamps: true
});

export default model("Notificacion", notificacionSchema);
