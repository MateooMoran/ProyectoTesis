import { Schema, model } from "mongoose";

const conversacionSchema = new Schema(
  {
    miembros: [{ type: Schema.Types.ObjectId, ref: 'Estudiantes' }],
    mensajes: [
      {
        emisor: { type: Schema.Types.ObjectId, ref: 'Estudiantes' },
        texto: String,
        fecha: { type: Date, default: Date.now }
      }
    ],
    lecturas: [
      {
        usuario: { type: Schema.Types.ObjectId, ref: 'Estudiantes' },
        ultimaLectura: { type: Date, default: Date.now }
      }
    ],
    // Array de usuarios que han ocultado esta conversación
    ocultadaPor: [{ type: Schema.Types.ObjectId, ref: 'Estudiantes' }]
  },
  {
    timestamps: true,
  }
);

export default model("Conversacion", conversacionSchema);
