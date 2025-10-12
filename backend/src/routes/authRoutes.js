import express from 'express';
import { generateToken } from '../utils/generateToken.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Registrar usuario
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "👤 Usuario ya registrado" });
    }

    // Crear nuevo usuario
    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: "💥 Error al registrar usuario", error });
  }
});

// @desc    Login de usuario
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "🔐 Credenciales inválidas" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: "💥 Error al iniciar sesión", error });
  }
});

export default router;