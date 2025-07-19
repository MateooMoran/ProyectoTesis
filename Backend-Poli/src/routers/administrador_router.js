import { Router } from "express";
import  {cambiarRolAVendedor, obtenerEstudiantes}from "../controllers/administrador_controller.js";
import { esAdmin } from "../middlewares/roles.js";
import { verifyTokenJWT } from "../middlewares/JWT.js";

const router = Router()

router.get('/admin/estudiantes',verifyTokenJWT,esAdmin,obtenerEstudiantes)
router.put('/admin/estudiantes/:id',verifyTokenJWT,esAdmin,cambiarRolAVendedor)


export default router