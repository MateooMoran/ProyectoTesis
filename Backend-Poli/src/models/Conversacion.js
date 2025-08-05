import { Schema, model } from "mongoose";

const conversacionSchema = new Schema(
  {
    miembros: [{ type: Schema.Types.ObjectId, ref: "estudiante" }],
    mensajes: [
      {
        emisor: { type: Schema.Types.ObjectId, ref: "estudiante" },
        texto: String,
        fecha: {
          type: Date,
          default: Date.now,
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

export default model("Conversacion", conversacionSchema);
