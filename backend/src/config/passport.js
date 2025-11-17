import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export const configurePassport = () => {
  console.log('🔍 Configurando Passport...');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ No configurado');
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Configurado' : '❌ No configurado');

  const hasValidGoogleConfig = process.env.GOOGLE_CLIENT_ID && 
                              process.env.GOOGLE_CLIENT_ID !== 'placeholder_por_ahora';

  if (hasValidGoogleConfig) {
    console.log('✅ Configurando Google Strategy con credenciales reales');

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('🔐 Perfil de Google recibido:', profile.id);
          
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log('✅ Usuario existente encontrado:', user.email);
            console.log('🔍 DEBUG - Usuario listo para callback:', {
              id: user._id,
              email: user.email, 
              registrationComplete: user.registrationComplete,
              oauthProvider: user.oauthProvider
            });
            return done(null, user);
          }

          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            console.log('🔗 Vinculando cuenta existente con Google:', user.email);
            user.googleId = profile.id;
            user.avatar = profile.photos[0].value;
            user.isVerified = true;
            user.oauthProvider = 'google';
            await user.save();
            console.log('🔍 DEBUG - Usuario vinculado listo para callback:', {
              id: user._id,
              email: user.email, 
              registrationComplete: user.registrationComplete,
              oauthProvider: user.oauthProvider
            });
            return done(null, user);
          }

          // ✅ CORREGIDO: Asignar el resultado de User.create a la variable user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            oauthProvider: 'google',
            role: 'pending',
            registrationComplete: false,
            isVerified: true
          });

          console.log('✅ Nuevo usuario Google creado:', user.email);
          console.log('🔍 DEBUG - Nuevo usuario listo para callback:', {
            id: user._id,
            email: user.email, 
            registrationComplete: user.registrationComplete,
            oauthProvider: user.oauthProvider
          });
          
          return done(null, user);
        } catch (error) {
          console.error('💥 Error en autenticación Google:', error);
          return done(error, null);
        }
      }
    ));
    
    console.log('✅ Google Strategy configurada exitosamente');
  } else {
    console.log('❌ Google OAuth NO configurado');
  }

  return passport;
};

export default passport;