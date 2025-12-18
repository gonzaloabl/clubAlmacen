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

          // 🛡️ Obtenemos la URL del avatar de forma segura y la limpiamos para mejor calidad
          const avatarUrl = (profile.photos && profile.photos.length > 0)
            ? profile.photos[0].value.replace(/=s\d+-c$/, '=s250-c') 
            : '';
          
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log('✅ Usuario existente encontrado:', user.email);

            // 🔄 FIX: Actualizamos el avatar y nombre por si el usuario los cambió en Google.
            let needsSave = false;
            if (user.avatar !== avatarUrl && avatarUrl) { user.avatar = avatarUrl; needsSave = true; }
            if (user.name !== profile.displayName) { user.name = profile.displayName; needsSave = true; }
            if (needsSave) {
              await user.save();
              console.log('🔄 Avatar/Nombre de usuario Google actualizado.');
            }

            return done(null, user);
          }

          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            console.log('🔗 Vinculando cuenta existente con Google:', user.email);
            user.googleId = profile.id;
            user.avatar = avatarUrl;
            user.isVerified = true;
            user.oauthProvider = 'google';
            await user.save();
            return done(null, user);
          }

          // ✅ CORREGIDO: Asignar el resultado de User.create a la variable user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: avatarUrl,
            oauthProvider: 'google',
            role: 'pending',
            registrationComplete: false,
            isVerified: true
          });

          console.log('✅ Nuevo usuario Google creado:', user.email);
          
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