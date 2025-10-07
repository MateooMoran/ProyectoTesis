import { Router } from "express";
import { esAdmin } from "../middlewares/roles.js";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { cambioRol, obtenerUsuarios } from "../controllers/administrador/usuariosController.js";
import { eliminarQuejaSugerencia, listarTodasLasQuejasSugerencias, responderQuejaSugerencia } from "../controllers/administrador/quejasController.js";

const router = Router()

// USUARIOS
router.get('/admin/usuario',verifyTokenJWT,esAdmin,obtenerUsuarios)
router.put('/admin/rol/:id',verifyTokenJWT,esAdmin,cambioRol)

// QUEJAS Y SUGERENCIAS
router.get('/admin/quejas-sugerencias', verifyTokenJWT, esAdmin, listarTodasLasQuejasSugerencias);
router.put('/admin/quejas-sugerencias/:id', verifyTokenJWT, esAdmin, responderQuejaSugerencia);
router.delete('/admin/quejas-sugerencias/:id', verifyTokenJWT, esAdmin, eliminarQuejaSugerencia);



export default router