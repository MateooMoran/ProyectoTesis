import { Schema, model } from "mongoose";

const mensajeSchema = new Schema(
  {
    conversacion: {
      type: Schema.Types.ObjectId,
      ref: "Conversacion",
      required: true,
      index: true
    },
    emisor: {
      type: Schema.Types.ObjectId,
      ref: "Estudiantes",
      required: true
    },
    tipo: {
      type: String,
      enum: ["texto", "imagen"],
      default: "texto"
    },
    contenido: {
      type: String,
      required: function() {
        return this.tipo === "texto";
      },
      maxlength: 1000
    },
    imagenUrl: {
      type: String,
      required: function() {
        return this.tipo === "imagen";
      }
    },
    imagenPublicId: {
      type: String 
    },
    eliminado: {
      type: Boolean,
      default: false
    },
    leido: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Índices para mejorar queries
mensajeSchema.index({ conversacion: 1, createdAt: -1 });
mensajeSchema.index({ emisor: 1 });

export default model("Mensaje", mensajeSchema);
