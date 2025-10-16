import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

console.log('🔍 DEBUG Google Auth Variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Existe' : '❌ No existe');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Configuración temporal - no se ejecutará sin credenciales reales
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'placeholder_por_ahora') {

  console.log('✅ Configurando Google Strategy con credenciales reales');

  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔐 Perfil de Google recibido:', profile.id);
        
        // Buscar usuario por Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('✅ Usuario existente encontrado:', user.email);
          return done(null, user);
        }

        // Si no existe, buscar por email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          console.log('🔗 Vinculando cuenta existente con Google:', user.email);
          user.googleId = profile.id;
          user.avatar = profile.photos[0].value;
          user.isVerified = true;
          user.oauthProvider = 'google';
          await user.save();
          return done(null, user);
        }

        // Crear nuevo usuario
        console.log('👤 Creando nuevo usuario desde Google:', profile.emails[0].value);
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          password: 'oauth-google', // No se usará para login
          isVerified: true,
          oauthProvider: 'google'
        });

        return done(null, user);
      } catch (error) {
        console.error('💥 Error en autenticación Google:', error);
        return done(error, null);
      }
    }
  ));
} else {
  console.log('⚠️ Google OAuth no configurado - usando placeholders');
}

export default passport;