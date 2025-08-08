import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";
import { buscarEstudiantePorNombre } from "../controllers/servicioController.js";
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router();

router.get('/chat/buscar', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), buscarEstudiantePorNombre);

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    try {
      const user = req.user;
      const token = jwt.sign(
        { id: user._id, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Redirigir al frontend con token y rol
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&rol=${user.rol}`);
    } catch (err) {
      console.error('Error en google callback:', err);
      res.redirect(`${process.env.FRONTEND_URL}/login`);
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

// Cerrar sesión
router.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect(`${process.env.FRONTEND_URL}`);
  });
});

export default router;