import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Blog from '../models/Blog.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// --- CONFIGURACIÓN MULTER (Imágenes) ---
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
    cb(null, `blog-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo imágenes'));
  }
});

// @desc    Leer el Muro (Público)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({})
      .populate('author', 'name role')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar el muro' });
  }
});

// @desc    Publicar en el Muro (Solo SuperAdmin)
router.post('/', protect, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    // 🔒 CANDADO: Solo SuperAdmin
    if (req.user.adminRole !== 'superadmin') {
        return res.status(403).json({ message: '⛔ Solo Club Almacén puede publicar aquí.' });
    }

    const blogData = {
      title: req.body.title,
      content: req.body.content,
      tag: req.body.tag || 'Oficial',
      author: req.user._id
    };

    if (req.file) {
        blogData.image = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.create(blogData);
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error al publicar' });
  }
});

// @desc    Borrar del Muro (Solo Admin)
router.delete('/:id', protect, requireAdmin, async (req, res) => {
  try {
    if (req.user.adminRole !== 'superadmin') {
        return res.status(403).json({ message: 'No autorizado' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
});

export default router;