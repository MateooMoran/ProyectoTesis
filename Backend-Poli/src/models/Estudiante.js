import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const estudianteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    apellido: {
      type: String,
      required: true,
      trim: true,
    },
    telefono: {
      type: String,
      default: null,
      trim: true,
    },
    direccion: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: ["admin", "vendedor", "estudiante"],
      default: "estudiante",
    },
    estado: {
      type: Boolean,
      default: true,
    },
    token: {
      type: String,
      default: null,
    },
    emailConfirmado: {
      type: Boolean,
      default: false,
    },
    favoritos: [{ 
      type: Schema.Types.ObjectId, 
      ref: "Producto" 
    }],

  },
  {
    timestamps: true,
  }
);

// Método para encriptar contraseña
estudianteSchema.methods.encrypPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  const passwordEncrypt = await bcrypt.hash(password, salt);
  return passwordEncrypt;
};

// Método para comparar contraseña
estudianteSchema.methods.matchPassword = async function (password) {
  const respuesta = await bcrypt.compare(password, this.password);
  return respuesta;
};

// Método para crear token
estudianteSchema.methods.createToken = function () {
  const tokenGenerado = this.token = Math.random().toString(36).slice(2)
  return tokenGenerado;
};

export default model("Estudiantes", estudianteSchema);
