import { Router } from "express";
import { actualizarContraseña, actualizarPerfil, comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, perfil, recuperarPassword, registro, visualizarProductos } from "../controllers/estudiante_controller.js"
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";

const router = Router()

router.post('/registro',registro)
router.post('/login',login)
router.get('/confirmar/:token',confirmarMail)
router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPassword)
router.post('/nuevopassword/:token',crearNuevoPassword)

router.get('/productos',visualizarProductos)


router.get('/perfil', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'),perfil)
router.put('/perfil/actualizarperfil',verifyTokenJWT,tieneRol('estudiante', 'admin', 'vendedor'),actualizarPerfil)
router.put('/perfil/actualizarpassword',verifyTokenJWT,tieneRol('estudiante', 'admin', 'vendedor'),actualizarContraseña)
export default router