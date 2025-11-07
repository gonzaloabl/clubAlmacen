import express from 'express';
import { generateToken } from '../utils/generateToken.js';
import User from '../models/User.js';

// 🆕 IMPORTAR YUP Y ESQUEMAS
import { registerSchema, loginSchema, validateData } from '../schemas/authSchemas.js';

const router = express.Router();

// @desc    Registrar usuario
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('Intentando registrar usuario', { 
    name: req.body.name, 
    email: req.body.email,
    role: req.body.role  // 🆕 NUEVO: log del rol
  });

  try {
    console.log('📝 Intentando registrar usuario:', { 
      name: req.body.name, 
      email: req.body.email,
      role: req.body.role 
    });
    // 🆕 PASO 1: VALIDACIÓN CON YUP
    
    console.log('🔍 Iniciando validación Yup...');
    const validation = await validateData(registerSchema, req.body);
    console.log('📋 Resultado validación:', validation);
    
    if (!validation.isValid) {
      console.log('❌ Validación Yup falló:', validation.errors);
      return res.status(400).json({ 
        message: "Datos de registro inválidos",
        errors: validation.errors 
      });
    }

    // 🆕 Datos ya validados y limpios
    const { name, email, password, role, adminCreationCode } = validation.data;

    // ✅ MANTENEMOS TU LÓGICA EXISTENTE (pero mejorada)
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('❌ Usuario ya existe:', email);
      return res.status(400).json({ message: "👤 Usuario ya registrado" });
    }

    // 🆕 VALIDACIÓN DE ADMIN SEGURO
    let finalRole = role || 'locatario';
    
    if (finalRole === 'admin') {
      if (!adminCreationCode || adminCreationCode !== process.env.ADMIN_CREATION_CODE) {
        console.log('❌ Intento de crear admin sin código válido');
        return res.status(403).json({ 
          message: "No autorizado para crear cuenta de administrador" 
        });
      }
    }

    // 🆕 CREACIÓN MEJORADA CON ROL
    const userData = {
      name, 
      email, 
      password,
      role: finalRole
    };

    // 🆕 Solo guardar código si es admin
    if (finalRole === 'admin') {
      userData.adminCreationCode = adminCreationCode;
    }

    const user = await User.create(userData);
    console.log('✅ Usuario creado:', user._id, 'Rol:', user.role);

    // ✅ MANTENEMOS TU GENERACIÓN DE TOKEN
    const token = generateToken(user._id);
    console.log('✅ Token generado');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,  // 🆕 INCLUIMOS EL ROL EN LA RESPUESTA
      token: token
    });

  } catch (error) {
    console.error('💥 Error al registrar usuario:', error);
    
    // 🆕 MEJOR MANEJO DE ERRORES DE MONGOOSE
    if (error.code === 11000) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }
    
    res.status(500).json({ 
      message: "💥 Error al registrar usuario", 
      error: error.message 
    });
  }
});

// @desc    Login de usuario
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('🔄 Intentando login:', { email: req.body.email });

  try {
    // � PASO 1: VALIDACIÓN CON YUP
    const validation = await validateData(loginSchema, req.body);
    
    if (!validation.isValid) {
      console.log('❌ Validación de login falló:', validation.errors);
      return res.status(400).json({ 
        message: "Datos de login inválidos",
        errors: validation.errors 
      });
    }

    const { email, password } = validation.data;

    // ✅ MANTENEMOS TU LÓGICA DE LOGIN (igual)
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({ message: "🔐 Credenciales inválidas" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('❌ Contraseña incorrecta para:', email);
      return res.status(401).json({ message: "🔐 Credenciales inválidas" });
    }

    console.log('✅ Login exitoso:', user._id, 'Rol:', user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,  // 🆕 INCLUIMOS EL ROL
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('💥 Error al iniciar sesión:', error);
    res.status(500).json({ message: "💥 Error al iniciar sesión", error: error.message });
  }
});

export default router;