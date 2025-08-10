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
    ]
  },
  {
    timestamps: true,
  }
);

export default model("Conversacion", conversacionSchema);
