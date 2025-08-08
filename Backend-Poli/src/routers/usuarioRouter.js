import { actualizarContraseña, actualizarPerfil, comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, perfil, recuperarPassword, registro } from "../controllers/usuarioController.js";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";
import Producto from '../models/Producto.js'; 
import { Router } from "express";


const router = Router()

// Endpoint público para listar productos
router.get('/productos', async (req, res) => {
    try {
      const productos = await Producto.find({ estado: 'disponible' }).populate('categoria');
      res.json(productos);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar productos' });
    }
  });
  
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