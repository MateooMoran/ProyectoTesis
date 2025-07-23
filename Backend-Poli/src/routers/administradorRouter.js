import { Router } from "express";
import { esAdmin } from "../middlewares/roles.js";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { cambioRol, obtenerUsuarios } from "../controllers/adminController.js";

const router = Router()

router.get('/admin/usuario',verifyTokenJWT,esAdmin,obtenerUsuarios)
router.put('/admin/rol/:id',verifyTokenJWT,esAdmin,cambioRol)


export default router