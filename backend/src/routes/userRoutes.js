// src/routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

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

export default router;