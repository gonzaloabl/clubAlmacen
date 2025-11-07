import express from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Panel de administración
// @route   GET /api/admin/dashboard
// @access  Privado (solo admin)
router.get('/dashboard', requireAdmin, (req, res) => {
  res.json({
    message: '👑 Bienvenido al panel de administración',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    },
    stats: {
      totalUsers: 'Solo admins pueden ver esto',
      sensitiveData: 'Información confidencial'
    }
  });
});

// @desc    Gestión de usuarios (solo admin)
// @route   GET /api/admin/users
// @access  Privado (solo admin)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password -adminCreationCode');
    res.json({
      message: 'Lista de usuarios (solo visible para admin)',
      users: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});

export default router;