import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Estudiante from "../models/Estudiante.js";
import { sendMailWelcomeWithPassword } from "../config/nodemailer.js";

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      let existingUser = await Estudiante.findOne({ email: profile.emails[0].value });

      if (existingUser) {
        if (!existingUser.googleId) {
          existingUser.googleId = profile.id;
          await existingUser.save();
        }
        return done(null, existingUser);
      }

      const nombreBase = (profile.name?.givenName || 'Usuario').replace(/\s+/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000); 
      const plainPassword = `POLI${nombreBase}${randomPart}`;

      const nuevoEstudiante = new Estudiante({
        googleId: profile.id,
        nombre: profile.name?.givenName || 'Usuario',
        apellido: profile.name?.familyName || 'Google',
        email: profile.emails[0].value,
        rol: "estudiante",
        direccion: "",
        telefono: "",
        password: await Estudiante.prototype.encrypPassword(plainPassword),
        emailConfirmado: true,
        estado: true
      });

      await nuevoEstudiante.save();

      await sendMailWelcomeWithPassword(
        nuevoEstudiante.email,
        nuevoEstudiante.nombre,
        plainPassword
      );

      return done(null, nuevoEstudiante);
    } catch (error) {
      console.error('Error en Google Strategy:', error);
      return done(error, null);
    }
  }
));

export default passport;
