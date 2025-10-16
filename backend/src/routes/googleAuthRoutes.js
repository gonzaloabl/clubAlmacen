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
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'placeholder_por_ahora') {
    return res.status(503).json({ 
      message: 'Google Auth no configurado. Agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET al .env' 
    });
  }
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })(req, res);
});

// @desc    Callback de Google
// @route   GET /api/auth/google/callback
router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'placeholder_por_ahora') {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_not_configured`);
  }

  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    session: false 
  })(req, res, next);
}, (req, res) => {
  try {
    // Generar token JWT
    const token = generateToken(req.user._id);
    
    // Redirigir al frontend con el token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/success?token=${token}&user=${encodeURIComponent(req.user.name)}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error generando token:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
  }
});

export default router;