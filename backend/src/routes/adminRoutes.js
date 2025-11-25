import express from 'express';
// 1. IMPORTANTE: Agregamos 'protect' y 'requireSuperAdmin' a los imports
import { protect, requireAdmin, requireSuperAdmin } from '../middleware/authMiddleware.js';
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
      role: req.user.role,
      adminRole: req.user.adminRole // Agregamos esto para que lo veas en el frontend
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

// 🆕 NUEVA RUTA: CREAR STAFF
// @desc    Crear un nuevo miembro del Staff (Admin Regional/Técnico)
// @route   POST /api/admin/staff
// @access  Privado (Solo Superadmin)
router.post('/staff', protect, requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, adminRole, region } = req.body;

    // 1. Validar que no exista el email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // 2. Crear el usuario con privilegios de Admin
    // Forzamos role: 'admin' y registrationComplete: true
    const user = await User.create({
      name,
      email,
      password, // El modelo User.js encriptará esto automáticamente
      role: 'admin',
      adminRole, // 'regional' o 'technical'
      region: adminRole === 'regional' ? region : null, // Solo asignar región si es regional
      isVerified: true,
      registrationComplete: true
    });

    console.log(`✅ Nuevo Staff creado: ${user.email} (${user.adminRole})`);

    res.status(201).json({
      message: `✅ Staff creado correctamente: ${user.name}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        adminRole: user.adminRole,
        region: user.region
      }
    });

  } catch (error) {
    console.error('Error creando staff:', error);
    res.status(500).json({ message: 'Error al crear miembro del staff' });
  }
});

export default router;