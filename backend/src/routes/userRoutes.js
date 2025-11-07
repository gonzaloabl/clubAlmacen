import express from 'express';
import { protect, authorize, requireAdmin } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// ✅ MANTENEMOS TU RUTA ACTUAL /me
// @desc    Obtener perfil del usuario
// @route   GET /api/users/me
// @access  Privado
router.get('/me', protect, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});

// 🆕 AGREGAMOS NUEVAS RUTAS PARA GESTIÓN DE USUARIOS

// @desc    Obtener todos los usuarios (SOLO ADMIN)
// @route   GET /api/users
// @access  Privado (solo admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password -adminCreationCode');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Privado (usuario propio o admin)
router.put('/:id', protect, async (req, res) => {
  try {
    // Verificar que el usuario edite su propio perfil o sea admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para editar este usuario' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).select('-password -adminCreationCode');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
});

// @desc    Eliminar usuario (SOLO ADMIN)
// @route   DELETE /api/users/:id
// @access  Privado (solo admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
});

export default router;