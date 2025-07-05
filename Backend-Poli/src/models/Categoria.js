import { Schema, model } from "mongoose";

const categoriaSchema = new Schema(
  {
    nombreCategoria: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

export default model("Categoria", categoriaSchema);
