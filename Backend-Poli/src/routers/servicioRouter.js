import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";
import { buscarEstudiantePorNombre, eliminarNotificacion, listarNotificaciones, marcarNotificacionLeida, obtenerConversacionesRecientes } from "../controllers/servicioController.js";
import { createTokenJWT } from "../middlewares/JWT.js";
import passport from '../../src/Auth/passport.js';

const router = Router();

router.get('/chat/buscar', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), buscarEstudiantePorNombre);
router.get('/chat/conversaciones', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'),obtenerConversacionesRecientes);

router.get('/notificaciones', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), listarNotificaciones);
router.put('/notificaciones/leida/:id', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), marcarNotificacionLeida);
router.delete('/notificaciones/:id', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), eliminarNotificacion);

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.URL_FRONTEND}/login`, session: false }),
  async (req, res) => {
    try {
      const estudianteBDD = req.user;

      if (!estudianteBDD.emailConfirmado) {
        return res.redirect(`${process.env.URL_FRONTEND}/login?error=email_no_confirmado`);
      }
      console.log("Usuario Google:", estudianteBDD);
      const token = createTokenJWT(estudianteBDD._id, estudianteBDD.rol);
      console.log("Token JWT:", token);
      if (!token) {
        return res.redirect(`${process.env.URL_FRONTEND}/login?error=token_error`);
      }

      res.redirect(`${process.env.URL_FRONTEND}/auth/callback?token=${encodeURIComponent(token)}&rol=${encodeURIComponent(estudianteBDD.rol)}`);
    } catch (error) {
      console.error("Error en login Google:", error);
      res.redirect(`${process.env.URL_FRONTEND}/login?error=server_error`);
    }
  }
);

router.get('/auth/usuario', verifyTokenJWT, (req, res) => {
  res.json({
    _id: req.usuario._id,
    nombre: req.usuario.nombre,
    apellido: req.usuario.apellido,
    email: req.usuario.email,
    rol: req.usuario.rol,
    direccion: req.usuario.direccion,
    telefono: req.usuario.telefono,
  });
});

// Logout (solo redirigir, porque JWT no mantiene sesión en backend)
router.get('/auth/logout', (req, res) => {
  // El frontend debe borrar el token para "cerrar sesión"
  res.redirect(`${process.env.URL_FRONTEND}/login`);
});

export default router;
