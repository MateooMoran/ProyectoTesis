import mongoose from 'mongoose'
import dotenv from "dotenv";
import Estudiante from "../models/Estudiante.js";

dotenv.config();

const crearAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI_LOCAL)

        const existe = await Estudiante.findOne({ rol: "admin" });
        if (existe) {
            console.log("Ya existe un administrador");
            process.exit();
        }

        const admin = new Estudiante({
            nombre: "Admin",
            apellido: "Admin",
            telefono:"099999999",
            direccion:"ESFOT",
            email: "admin@poliventas.com",
            password: await Estudiante.prototype.encrypPassword("abcd"),
            rol: "admin",
            emailConfirmado: true,
        });

        await admin.save();
        console.log("Admin creado con éxito");

        process.exit();
    } catch (error) {
        console.error("Error al crear el admin", error.message);
        process.exit(1);
    }
};

crearAdmin();
