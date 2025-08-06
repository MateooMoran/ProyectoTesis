import { Schema, model } from "mongoose";

const carritoSchema  = new Schema(
  {
    comprador: {
      type: Schema.Types.ObjectId,
      ref: "Estudiantes",
      required: true,
    },
    productos: [
      {
        producto: { type: Schema.Types.ObjectId, ref: "Producto", required: true },
        cantidad: { type: Number, required: true, default: 1 },
        precioUnitario: {type:Number, required:true},
        subtotal: {type:Number, required:true}
      }
    ],
    total: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export default model("Carrito", carritoSchema);
