
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";
import { Router } from "express";
import { registroValidations } from "../validations/validadorEstudiante.js";
import { confirmarMail, login, registro } from "../controllers/usuarios/authController.js";
import { comprobarTokenPassword, crearNuevoPassword, recuperarPassword } from "../controllers/usuarios/passwordController.js";
import { actualizarContraseña, actualizarPerfil, perfil } from "../controllers/usuarios/perfilController.js";
import handleValidationErrors from "../middlewares/handleValidationErrors.js";


const router = Router()


//REGISTRO
router.post('/registro',registroValidations, handleValidationErrors,registro,)
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