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

//CONFIGURACION MULTER
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Construimos la ruta absoluta:
    // __dirname está en /backend/src/routes
    // Subimos dos niveles (../../) para llegar a la raíz /backend
    // Entramos a /uploads
    const uploadPath = path.join(__dirname, '../../uploads');

    // Creamos la carpeta si no existe (Seguro de vida)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    // Nombre limpio y único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: function (req, file, cb) {
    // 1. Definir los tipos permitidos
    const filetypes = /jpeg|jpg|png|webp/;
    
    // 2. Verificar la extensión usando 'path' (Asegúrate de que 'path' esté importado arriba)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    // 3. Verificar el tipo MIME
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Solo se permiten imágenes (jpeg, jpg, png, webp)!'));
    }
  },
});

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
router.put('/profile', protect, upload.single('avatar') , async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Actualizamos campos si vienen en el body
      user.name = req.body.name || user.name;
      user.region = req.body.region || user.region;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.businessName = req.body.businessName || user.businessName;
      user.businessDescription = req.body.businessDescription || user.businessDescription;
      user.website = req.body.website || user.website;
      user.whatsapp = req.body.whatsapp || user.whatsapp;
      user.avatar = req.body.avatar || user.avatar;

      // 4️⃣ SI HAY ARCHIVO, GUARDAMOS LA RUTA
      if (req.file) {
        // Guardamos la ruta relativa. Ej: /uploads/avatar-123.jpg
        user.avatar = `/uploads/${req.file.filename}`;
      } else if (req.body.avatar) {
        // Si no subió archivo pero mandó texto (caso raro, mantener por compatibilidad)
        user.avatar = req.body.avatar; 
      }

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
        region: updatedUser.region,
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

// @desc    Obtener lista pública de locatarios
// @route   GET /api/users/public/locatarios
router.get('/public/locatarios', async (req, res) => {
  try {
    const locatarios = await User.find({ role: 'locatario' })
      .select('name businessName businessDescription email phone address website whatsapp avatar region');
    
    res.json(locatarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener locatarios' });
  }
});

// @desc    Obtener perfil público de un usuario específico (Proveedor)
// @route   GET /api/users/public/:id
router.get('/public/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name businessName businessDescription email phone address website whatsapp avatar region role');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil público' });
  }
});





export default router;