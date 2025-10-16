import express from 'express';
import { generateToken } from '../utils/generateToken.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Registrar usuario
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  console.log('Intentando registrar usuario', {name,email});

  try {
    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('❌ Usuario ya existe:', email);
      return res.status(400).json({ message: "👤 Usuario ya registrado" });
    }

    // Crear nuevo usuario
    const user = await User.create({ name, email, password });
    console.log('✅ Usuario creado:', user._id);

    const token = generateToken(user._id);
    console.log('✅ Token generado');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token
    });

  } catch (error) {
    console.error('💥 Error al registrar usuario:', error);
    res.status(500).json({ message: "💥 Error al registrar usuario", error: error.message });
  }
});

// @desc    Login de usuario
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('🔄 Intentando login:', { email });

  try {
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

    console.log('✅ Login exitoso:', user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('💥 Error al iniciar sesión:', error);
    res.status(500).json({ message: "💥 Error al iniciar sesión", error: error.message });
  }
});

export default router;