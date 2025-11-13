import { Schema, model } from "mongoose";

const conversacionSchema = new Schema(
  {
    miembros: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Estudiantes',
      required: true
    }],
    ultimoMensaje: {
      type: Schema.Types.ObjectId,
      ref: 'Mensaje'
    },
    mensajesNoLeidos: [{
      usuario: { type: Schema.Types.ObjectId, ref: 'Estudiantes' },
      cantidad: { type: Number, default: 0 }
    }],
    ocultadaPor: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Estudiantes' 
    }]
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsqueda rápida
conversacionSchema.index({ miembros: 1 });
conversacionSchema.index({ updatedAt: -1 });
conversacionSchema.index({ ultimoMensaje: -1 });

export default model("Conversacion", conversacionSchema);
