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
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'placeholder_por_ahora') {
    return res.status(503).json({ 
      message: 'Google Auth no configurado. Agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET al .env' 
    });
  }
  
  // ✅ CORREGIDO: Usar passport.authenticate correctamente
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })(req, res, next);
});

// @desc    Callback de Google
// @route   GET /api/auth/google/callback
router.get('/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'placeholder_por_ahora') {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_not_configured`);
  }

  // ✅ CORREGIDO: Manejo correcto del callback
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    session: false 
  })(req, res, next);
}, (req, res) => {
  try {
    // Solo se ejecuta si la autenticación fue exitosa
    const token = generateToken(req.user._id);
    
    // Redirigir al frontend con el token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth-success?token=${token}&user=${encodeURIComponent(req.user.name)}`;
    console.log('✅ Autenticación Google exitosa, redirigiendo a:', redirectUrl);
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error generando token:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
  }
});

export default router;