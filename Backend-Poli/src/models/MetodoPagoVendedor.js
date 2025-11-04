import { Schema, model } from "mongoose";

const metodoPagoVendedorSchema = new Schema({
  vendedor: { type: Schema.Types.ObjectId, ref: "Estudiantes", required: true },
  tipo: { type: String, enum: ["transferencia", "qr", "retiro"], required: true },

  banco: { type: String, trim: true },
  numeroCuenta: { type: String, trim: true },
  titular: { type: String, trim: true },
  cedula: { type: String, trim: true },

  imagenComprobante: { type: String, trim: true },
  imagenID: { type: String, trim: true },

  lugares: [{ type: String, trim: true }],

}, { timestamps: true });

export default model("MetodoPagoVendedor", metodoPagoVendedorSchema);
