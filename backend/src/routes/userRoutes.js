import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// --- CONFIGURACIÓN MULTER ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5000000 }, 
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Error: Solo se permiten imágenes!'));
  },
});

// @desc    Obtener perfil del usuario logueado
router.get('/me', protect, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    adminRole: req.user.adminRole,
    region: req.user.region,
    phone: req.user.phone,
    address: req.user.address,
    businessName: req.user.businessName,
    businessDescription: req.user.businessDescription,
    website: req.user.website,
    whatsapp: req.user.whatsapp,
    avatar: req.user.avatar,
    oauthProvider: req.user.oauthProvider,
    registrationComplete: req.user.registrationComplete,
    isVerified: req.user.isVerified,
    karma: req.user.karma,       // 👈 Ahora sí enviamos el karma
    postCount: req.user.postCount, // 👈 Y el contador de posts
    profileViews: req.user.profileViews // 🆕 Vistas de perfil
  });
});

// @desc    Actualizar perfil propio
router.put('/profile', protect, upload.single('avatar') , async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.region = req.body.region || user.region;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.businessName = req.body.businessName || user.businessName;
      user.businessDescription = req.body.businessDescription || user.businessDescription;
      user.website = req.body.website || user.website;
      user.whatsapp = req.body.whatsapp || user.whatsapp;
      user.avatar = req.body.avatar || user.avatar;

      if (req.file) {
        user.avatar = `/uploads/${req.file.filename}`;
      } else if (req.body.avatar) {
        user.avatar = req.body.avatar; 
      }

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
        region: updatedUser.region,
        phone: updatedUser.phone,
        businessName: updatedUser.businessName,
        avatar: updatedUser.avatar,
        token: req.headers.authorization.split(' ')[1] 
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
});

// --- RUTAS DE ADMIN ---

// @desc    Obtener usuarios (UNIFICADA: Incluye lógica Regional)
// @route   GET /api/users
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    let query = {};

    // Filtro de Seguridad Regional
    if (req.user.adminRole === 'regional') {
        query.region = req.user.region;
    }

    // Eliminamos password y adminCreationCode de la respuesta
    const users = await User.find(query)
        .select('-password -adminCreationCode')
        .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ message: 'Error obteniendo usuarios' });
  }
});

// @desc    Actualizar Rol o Estado (Banear/Ascender)
// @route   PUT /api/users/:id/admin-action
router.put('/:id/admin-action', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Sin permiso' });

    console.log(`🛠️ ADMIN ACTION: Modificando usuario ${req.params.id}`);
    console.log(`📦 Datos recibidos:`, req.body);

    const { role, isActive, adminRole } = req.body;
    const userToEdit = await User.findById(req.params.id);

    if (!userToEdit) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Protección SuperAdmin
    if (userToEdit.adminRole === 'superadmin' && req.user.adminRole !== 'superadmin') {
        return res.status(403).json({ message: 'No puedes editar a un SuperAdmin' });
    }

    // Aplicar cambios
    if (role) userToEdit.role = role;
    if (isActive !== undefined) userToEdit.isActive = isActive;
    
    if (adminRole && req.user.adminRole === 'superadmin') {
        userToEdit.adminRole = adminRole;
    }

    await userToEdit.save();
    console.log("✅ Usuario actualizado con éxito");
    res.json({ message: 'Usuario actualizado', user: userToEdit });

  } catch (error) {
    console.error("🔥 ERROR CRÍTICO AL ACTUALIZAR USUARIO:", error); // <-- ¡ESTO NOS DIRÁ LA CAUSA!
    res.status(500).json({ message: 'Error actualizando usuario', error: error.message });
  }
});

// @desc    Actualizar usuario genérico (Admin)
router.put('/:id', protect, async (req, res) => {
    try {
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

// @desc    Crear un Admin (Solo para SuperAdmin)
// @route   POST /api/users/create-admin
router.post('/create-admin', protect, async (req, res) => {
  try {
    // 1. Solo el SuperAdmin puede crear otros admins
    if (req.user.adminRole !== 'superadmin') {
        return res.status(403).json({ message: '⛔ Solo el SuperAdmin puede crear administradores.' });
    }

    const { name, email, password, adminType, region } = req.body;

    // 2. Validar duplicados
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    // 3. Crear el usuario con los poderes
    const user = await User.create({
      name,
      email,
      password, // El modelo se encarga de encriptarla
      role: 'admin',
      adminRole: adminType, // 'regional' o 'technical'
      region: adminType === 'regional' ? region : null, // Solo guardamos región si es regional
      isActive: true,
      emailVerified: true // Como lo crea el jefe, nace verificado
    });

    res.status(201).json({ 
        message: `✅ Admin ${adminType} creado exitosamente`,
        user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("Error creando admin:", error);
    res.status(500).json({ message: 'Error al crear administrador', error: error.message });
  }
});

// --- RUTAS PÚBLICAS ---

router.get('/public/providers', async (req, res) => {
  try {
    const providers = await User.find({ role: 'proveedor' })
      .select('name businessName businessDescription email phone address website whatsapp avatar region');
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
});

router.get('/public/locatarios', async (req, res) => {
  try {
    const locatarios = await User.find({ role: 'locatario' })
      .select('name businessName businessDescription email phone address website whatsapp avatar region');
    res.json(locatarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener locatarios' });
  }
});

router.get('/public/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name businessName businessDescription email phone address website whatsapp avatar region role');
      
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil público' });
  }
});

// @desc    Registrar vista de perfil (Separado para evitar duplicados en React)
// @route   POST /api/users/:id/view
router.post('/:id/view', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error registrando vista' });
  }
});

export default router;