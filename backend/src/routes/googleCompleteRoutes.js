import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { registerSchema, validateData } from '../schemas/authSchemas.js';

const router = express.Router();

// @desc    Completar registro de usuario Google
// @route   POST /api/auth/google/complete
// @access  Privado (solo usuarios Google con registrationComplete: false)
router.post('/', protect, async (req, res) => {
  console.log('🔍 INICIANDO COMPLETAR REGISTRO GOOGLE');
  console.log('🔍 Usuario en request:', {
    id: req.user._id,
    email: req.user.email,
    oauthProvider: req.user.oauthProvider,
    registrationComplete: req.user.registrationComplete
  });
  console.log('🔍 Body recibido:', req.body);

  try {
    // Verificar que el usuario sea de Google y no haya completado registro
    if (req.user.oauthProvider !== 'google' || req.user.registrationComplete) {
      console.log('❌ Usuario no válido para completar registro Google');
      return res.status(400).json({ 
        message: "Este usuario ya completó el registro o no es de Google" 
      });
    }

    // Validar datos con Yup (solo rol y código admin si aplica)
    console.log('🔍 Validando datos...');
    const validation = await validateData(registerSchema.pick(['role', 'adminCreationCode']), req.body);
    
    if (!validation.isValid) {
      console.log('❌ Validación falló:', validation.errors);
      return res.status(400).json({ 
        message: "Datos inválidos",
        errors: validation.errors 
      });
    }

    const { role, adminCreationCode } = validation.data;
    console.log('🔍 Datos validados:', { role, adminCreationCode });

    // Validar código de administrador si es necesario
    if (role === 'admin') {
      if (!adminCreationCode || adminCreationCode !== process.env.ADMIN_CREATION_CODE) {
        console.log('❌ Código de admin inválido');
        return res.status(403).json({ 
          message: "No autorizado para crear cuenta de administrador" 
        });
      }
    }

    // Actualizar usuario
    console.log('🔍 Actualizando usuario...');
    const updateData = {
      role,
      registrationComplete: true
    };

    if (role === 'admin') {
      updateData.adminCreationCode = adminCreationCode;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password -adminCreationCode');

    console.log('✅ Registro Google completado:', user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      oauthProvider: user.oauthProvider,
      registrationComplete: user.registrationComplete,
      message: "✅ Registro completado exitosamente"
    });

  } catch (error) {
    console.error('💥 Error al completar registro Google:', error);
    res.status(500).json({ 
      message: "💥 Error al completar registro", 
      error: error.message 
    });
  }
});

export default router;