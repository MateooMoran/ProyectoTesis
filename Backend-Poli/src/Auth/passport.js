import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Estudiante from "../models/Estudiante.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Buscar usuario en DB
      let existingUser = await Estudiante.findOne({ email: profile.emails[0].value });

      if (existingUser) {
        // Si el usuario ya existe, verificar si tiene googleId
        if (!existingUser.googleId) {
          existingUser.googleId = profile.id;
          await existingUser.save();
        }
        return done(null, existingUser);
      }

      // Si no existe, crear uno nuevo
      const nuevoEstudiante = await Estudiante.create({
        googleId: profile.id,
        nombre: profile.name?.givenName || 'Usuario',
        apellido: profile.name?.familyName || 'Google',
        email: profile.emails[0].value,
        rol: "estudiante",
        direccion: "Google",
        telefono: "Google"
      });

      return done(null, nuevoEstudiante);
    } catch (error) {
      console.error('Error en Google Strategy:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Estudiante.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;