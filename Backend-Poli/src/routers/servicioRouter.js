import { Router } from "express";
import { verifyTokenJWT } from "../middlewares/JWT.js";
import { tieneRol } from "../middlewares/roles.js";
import { buscarEstudiantePorNombre } from "../controllers/servicioController.js";
import passport from 'passport';
const router = Router()

router.get('/chat/buscar', verifyTokenJWT, tieneRol('estudiante', 'admin', 'vendedor'), buscarEstudiantePorNombre)


router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login', 
    session: true
  }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard'); 
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
    res.redirect('/'); 
  });
});


export default router
