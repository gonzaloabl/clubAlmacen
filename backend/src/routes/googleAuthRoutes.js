import express from 'express';
import passport from '../config/passport.js';
import { generateToken } from '../utils/generateToken.js';

const router = express.Router();

// @desc    Verificar estado de Google Auth
// @route   GET /api/auth/google/status
router.get('/status', (req, res) => {
  const isConfigured = process.env.GOOGLE_CLIENT_ID && 
                      process.env.GOOGLE_CLIENT_ID !== 'placeholder_por_ahora';
  
  res.json({
    googleAuth: isConfigured ? 'configurado' : 'no_configurado',
    message: isConfigured ? 
      '✅ Google Auth listo' : 
      '⚠️ Configura las credenciales de Google'
  });
});

// @desc    Iniciar autenticación con Google
// @route   GET /api/auth/google
router.get('/', (req, res, next) => {
  console.log('🔍 DEBUG - Iniciando autenticación Google');
  
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'placeholder_por_ahora') {
    console.log('❌ DEBUG - Google Auth no configurado');
    return res.status(503).json({ 
      message: 'Google Auth no configurado. Agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET al .env' 
    });
  }
  
  console.log('✅ DEBUG - Redirigiendo a Google OAuth');
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })(req, res, next);
});

// @desc    Callback de Google
// @route   GET /api/auth/google/callback
router.get('/callback', (req, res, next) => {
  console.log('🔍 DEBUG - Llegó al callback de Google');

  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'placeholder_por_ahora') {
    console.log('❌ DEBUG - Google no configurado en callback');
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_not_configured`);
  }

  console.log('✅ DEBUG - Autenticando con Google...');
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    session: false 
  })(req, res, next);
}, async (req, res) => {
  try {
    // 🛡️ FIX: La verificación de baneo va AQUÍ, después de que Passport autentica al usuario.
    if (req.user.isActive === false) {
      console.log('⛔ Usuario Google baneado intentó entrar:', req.user.email);
      // Redirigimos al login con un parámetro de error específico
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=account_suspended`);
    }

    console.log('🔍 DEBUG - Procesando callback exitoso');
    console.log('🔍 DEBUG - Usuario autenticado:', {
      id: req.user._id,
      email: req.user.email,
      registrationComplete: req.user.registrationComplete,
      oauthProvider: req.user.oauthProvider,
      role: req.user.role
    });

    const token = generateToken(req.user._id);
    console.log('🔍 DEBUG - Token generado:', token ? '✅' : '❌');

    // Verificar si debe completar registro
    if (!req.user.registrationComplete && req.user.oauthProvider === 'google') {
      const redirectUrl = `${process.env.FRONTEND_URL}/complete-google-registration?token=${token}`;
      console.log('🔄 DEBUG - Redirigiendo a completar registro:', redirectUrl);
      return res.redirect(redirectUrl);
    }

    console.log('✅ DEBUG - Usuario ya completó registro, redirigiendo a dashboard');
    const redirectUrl = `${process.env.FRONTEND_URL}/auth-success?token=${token}`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('💥 DEBUG - Error en callback:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
});

export default router;