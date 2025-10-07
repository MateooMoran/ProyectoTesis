import passport from '../../Auth/passport.js';
import { createTokenJWT } from "../../middlewares/JWT.js";

// Login con Google
export const loginGoogle = passport.authenticate('google', { scope: ['profile', 'email'], session: false });

// Callback de Google
export const callbackGoogle = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, estudiante, info) => {
    try {
      if (err) {
        console.error("Error en Google Strategy:", err);
        return res.redirect(`${process.env.URL_FRONTEND}/login?error=server_error`);
      }

      if (!estudiante) {
        return res.redirect(`${process.env.URL_FRONTEND}/login?error=no_user`);
      }

      // Verificar email confirmado
      if (!estudiante.emailConfirmado) {
        return res.redirect(`${process.env.URL_FRONTEND}/login?error=email_no_confirmado`);
      }

      // Generar token JWT
      const token = createTokenJWT(estudiante._id, estudiante.rol);
      if (!token) {
        return res.redirect(`${process.env.URL_FRONTEND}/login?error=token_error`);
      }

      // Redirigir al frontend con token y rol
      return res.redirect(
        `${process.env.URL_FRONTEND}/auth/callback?token=${encodeURIComponent(token)}&rol=${encodeURIComponent(estudiante.rol)}`
      );
    } catch (error) {
      console.error("Error en callbackGoogle:", error);
      return res.redirect(`${process.env.URL_FRONTEND}/login?error=server_error`);
    }
  })(req, res, next);
};

// Obtener usuario logueado
export const obtenerUsuario = (req, res) => {
  const usuario = req.usuario;
  if (!usuario) return res.status(401).json({ msg: "No autenticado" });

  res.json({
    _id: usuario._id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    rol: usuario.rol,
    direccion: usuario.direccion,
    telefono: usuario.telefono,
  });
};

// Logout
export const logout = (req, res) => {
  res.redirect(`${process.env.URL_FRONTEND}/login`);
};
