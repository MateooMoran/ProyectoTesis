import { Router } from "express";
import { esAdmin, esVendedorOrAdmin } from "../middlewares/roles.js";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { cambioRol, obtenerUsuarios } from "../controllers/administrador/usuariosController.js";
import { eliminarQuejaSugerencia, listarTodasLasQuejasSugerencias, responderQuejaSugerencia } from "../controllers/administrador/quejasController.js";
import { respuestaQuejasValidations } from "../validations/validatorQuejas.js";
import handleValidationErrors from "../middlewares/handleValidationErrors.js";
import { validarCategoria } from "../validations/validatorCategoria.js";
import { crearCategoria, eliminarCategoria, listarCategorias } from "../controllers/administrador/categoriaController.js";

const router = Router()

// USUARIOS
router.get('/admin/usuario',verifyTokenJWT,esAdmin,obtenerUsuarios)
router.put('/admin/rol/:id',verifyTokenJWT,esAdmin,cambioRol)

// QUEJAS Y SUGERENCIAS
router.get('/admin/quejas-sugerencias', verifyTokenJWT, esAdmin, listarTodasLasQuejasSugerencias);
router.put('/admin/quejas-sugerencias/:id', verifyTokenJWT, esAdmin,respuestaQuejasValidations,handleValidationErrors, responderQuejaSugerencia);
router.delete('/admin/quejas-sugerencias/:id', verifyTokenJWT, esAdmin, eliminarQuejaSugerencia);

//  CATEGORÍAS 
router.post('/admin/crear/categoria', verifyTokenJWT, esAdmin,validarCategoria,handleValidationErrors, crearCategoria);
router.get('/admin/visualizar/categoria', verifyTokenJWT, esVendedorOrAdmin, listarCategorias);
router.delete('/admin/eliminar/categoria/:id', verifyTokenJWT, esAdmin, eliminarCategoria);


export default router