import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";
import { buscarEstudiantePorNombre } from "../controllers/servicioController.js";
import { createTokenJWT } from "../middlewares/JWT.js"; 
import passport from 'passport';


const router = Router();

// Buscar estudiante
router.get('/chat/buscar', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), buscarEstudiantePorNombre);

// Login con Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/login',
    session: false
  }),
  async (req, res) => {
    try {
      const estudianteBDD = req.user;

      if (!estudianteBDD.emailConfirmado) {
        return res.status(403).json({ msg: "Debes confirmar tu cuenta antes de iniciar sesión." });
      }

      const token = createTokenJWT(estudianteBDD._id, estudianteBDD.rol);
      if (!token) {
        return res.status(401).json({ msg: "No se pudo crear el token" });
      }

      const frontendUrl = `${process.env.URL_FRONTEND}/dashboard?token=${encodeURIComponent(token)}&rol=${encodeURIComponent(estudianteBDD.rol)}&nombre=${encodeURIComponent(estudianteBDD.nombre)}&apellido=${encodeURIComponent(estudianteBDD.apellido)}&direccion=${encodeURIComponent(estudianteBDD.direccion || '')}&telefono=${encodeURIComponent(estudianteBDD.telefono || '')}&_id=${encodeURIComponent(estudianteBDD._id)}`;

      res.redirect(frontendUrl);

    } catch (error) {
      console.error("Error en login Google:", error);
      res.status(500).json({ msg: "Error en el servidor" });
    }
  }
);

router.get('/auth/usuario', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ msg: 'No autenticado' });
  }
});

router.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect(`${process.env.FRONTEND_URL}`);
  });
});

export default router;