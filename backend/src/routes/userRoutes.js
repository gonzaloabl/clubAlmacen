import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Obtener perfil del usuario logueado
// @route   GET /api/users/me
router.get('/me', protect, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    adminRole: req.user.adminRole,
    region: req.user.region,
    // Devolvemos también los datos de perfil
    phone: req.user.phone,
    address: req.user.address,
    businessName: req.user.businessName,
    businessDescription: req.user.businessDescription,
    website: req.user.website,
    whatsapp: req.user.whatsapp,
    avatar: req.user.avatar,
    
    oauthProvider: req.user.oauthProvider,
    registrationComplete: req.user.registrationComplete,
    isVerified: req.user.isVerified
  });
});

// 🆕 NUEVA RUTA: ACTUALIZAR PERFIL PROPIO
// @desc    Actualizar datos del usuario logueado
// @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Actualizamos campos si vienen en el body
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.businessName = req.body.businessName || user.businessName;
      user.businessDescription = req.body.businessDescription || user.businessDescription;
      user.website = req.body.website || user.website;
      user.whatsapp = req.body.whatsapp || user.whatsapp;
      user.avatar = req.body.avatar || user.avatar;

      // Solo actualizamos password si el usuario envió uno nuevo
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        adminRole: updatedUser.adminRole,
        // Datos actualizados
        phone: updatedUser.phone,
        businessName: updatedUser.businessName,
        avatar: updatedUser.avatar,
        
        token: req.headers.authorization.split(' ')[1] // Devolver el mismo token
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
});

// --- RUTAS DE ADMIN (MANTENER IGUAL) ---

// @desc    Obtener todos los usuarios (SOLO ADMIN)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password -adminCreationCode');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});

// @desc    Actualizar usuario (Admin)
router.put('/:id', protect, async (req, res) => {
    // ... (Tu lógica existente para editar otros usuarios si la tenías)
    // Por ahora la dejamos simple o puedes copiar la que tenías antes
    try {
        // Verificar permisos (Admin o el mismo usuario)
        if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'No autorizado' });
        }
    
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        res.json(user);
      } catch (error) {
        res.status(500).json({ message: 'Error al actualizar' });
      }
});

// @desc    Eliminar usuario (SOLO ADMIN)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
});

// @desc    Obtener lista pública de proveedores
// @route   GET /api/users/providers
// @access  Público (o Privado según prefieras, lo haremos público para atraer usuarios)
router.get('/public/providers', async (req, res) => {
  try {
    // Buscamos usuarios con role 'proveedor'
    const providers = await User.find({ role: 'proveedor' })
      .select('name businessName businessDescription email phone address website whatsapp avatar region'); // Solo datos públicos
    
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
});



export default router;