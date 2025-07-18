import { Router } from "express";
import { actualizarContraseña, actualizarPerfil, comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, perfil, recuperarPassword, registro, visualizarProductos } from "../controllers/estudiante_controller.js"
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";

const router = Router()

router.post('/registro',registro)
router.get('/confirmar/:token',confirmarMail)
router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPassword)
router.post('/nuevopassword/:token',crearNuevoPassword)
router.post('/login',login)

router.get('/productos',visualizarProductos)


router.get('/perfil', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'),perfil)
router.put('/estudiante/actualizarperfil',verifyTokenJWT,tieneRol,actualizarPerfil)
router.put('/estudiante/actualizarpassword',verifyTokenJWT,tieneRol,actualizarContraseña)
export default router