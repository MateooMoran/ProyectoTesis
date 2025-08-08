import { actualizarContraseña, actualizarPerfil, comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, perfil, recuperarPassword, registro } from "../controllers/usuarioController.js";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";
import { Router } from "express";


const router = Router()


//REGISTRO
router.post('/registro',registro,)
router.get('/confirmar/:token',confirmarMail)

//LOGIN
router.post('/login',login)

//RECUPERAR CONTRASEÑA
router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPassword)
router.post('/nuevopassword/:token',crearNuevoPassword)

// PERFIL
router.get('/perfil', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'),perfil)
router.put('/perfil/actualizarperfil/:id',verifyTokenJWT,tieneRol('estudiante', 'admin', 'vendedor'),actualizarPerfil)
router.put('/perfil/actualizarpassword/:id',verifyTokenJWT,tieneRol('estudiante', 'admin', 'vendedor'),actualizarContraseña)

export default router;