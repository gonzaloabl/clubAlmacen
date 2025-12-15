import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import User from '../models/User.js'; // Importar User para Karma
import { protect } from '../middleware/authMiddleware.js';

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
    cb(null, `post-${uniqueSuffix}${path.extname(file.originalname)}`);
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

// @desc    Obtener todas las publicaciones
// @route   GET /api/posts
router.get('/', async (req, res) => {
  try {
    const { category, search, region } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let query = {};
    if (category) query.category = category;
    if (region && region !== 'Todas') query.region = region;
    if (search) query.$text = { $search: search };
    
    const posts = await Post.find(query)
      .populate('author', 'name email role adminRole region avatar') 
      .populate('category', 'name color')
      .sort({ isPinned: -1, score: -1, createdAt: -1 }) // Ordenar por Score también
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await Post.countDocuments(query);
    
    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '💥 Error al obtener publicaciones' });
  }
});

// @desc    Obtener una publicación específica
// @route   GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email role adminRole region avatar')
      .populate('category', 'name color')
      // 👇 CORRECCIÓN: Quitamos el populate('likes') porque ya no existe en el Post
      .populate('comments.user', 'name email role avatar');
      
    if (!post) {
      return res.status(404).json({ message: '❌ Publicación no encontrada' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('💥 Error al obtener publicación:', error);
    res.status(500).json({ message: '💥 Error al obtener publicación' });
  }
});

// @desc    Crear publicación
// @route   POST /api/posts
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, tags, region, type } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) return res.status(400).json({ message: 'Categoría no válida' });

    const role = req.user.role; 
    const group = categoryDoc.group; 

    if (role !== 'admin') {
        if (group === 'proveedores' && role !== 'proveedor') {
            return res.status(403).json({ message: '⛔ Solo proveedores pueden publicar aquí.' });
        }
        if (group === 'locatarios' && role !== 'locatario') {
            return res.status(403).json({ message: '⛔ Solo locatarios pueden publicar aquí.' });
        }
    }

    let parsedTags = [];
    if (tags) {
        parsedTags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(t => t);
    }

    const postData = {
      title,
      content,
      category,
      tags: parsedTags,
      author: req.user._id,
      region: region || 'Nacional',
      type: type || 'forum'
    };

    if (req.file) {
        postData.image = `/uploads/${req.file.filename}`;
    }

    const post = await Post.create(postData);
    
    await post.populate('author', 'name email role adminRole region avatar');
    await post.populate('category', 'name color');
    
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creando post:", error);
    res.status(500).json({ message: '💥 Error al crear publicación', error: error.message });
  }
});

// @desc    Votar una publicación (Upvote/Downvote)
// @route   POST /api/posts/:id/vote
router.post('/:id/vote', protect, async (req, res) => {
  try {
    const { value } = req.body; // 1 o -1
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'No encontrado' });
    if (![1, -1].includes(value)) return res.status(400).json({ message: 'Voto inválido' });

    const existingVoteIndex = post.votes.findIndex(v => v.user.toString() === req.user._id.toString());
    const existingVote = post.votes[existingVoteIndex];

    let scoreChange = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        // Toggle (Quitar voto)
        post.votes.splice(existingVoteIndex, 1);
        scoreChange = -value;
      } else {
        // Swap (Cambiar voto)
        existingVote.value = value;
        scoreChange = value * 2;
      }
    } else {
      // Nuevo Voto
      post.votes.push({ user: req.user._id, value });
      scoreChange = value;
    }

    post.score += scoreChange;
    await post.save();

    // Actualizar Karma del Autor
    if (post.author.toString() !== req.user._id.toString()) {
        const author = await User.findById(post.author);
        if (author) {
            author.karma += scoreChange;
            await author.save();
        }
    }

    res.json({ score: post.score, votes: post.votes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al votar' });
  }
});

// @desc    Dar Like a un comentario
// @route   POST /api/posts/:id/comments/:commentId/like
router.post('/:id/comments/:commentId/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'No encontrado' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });

    const userId = req.user._id;
    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);
    }

    await post.save();
    res.json(comment.likes);
  } catch (error) {
    res.status(500).json({ message: 'Error like comentario' });
  }
});

// @desc    Agregar comentario
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'No encontrado' });
    
    post.comments.push({ user: req.user._id, content });
    await post.save();
    await post.populate('comments.user', 'name email role avatar');
    
    res.status(201).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: 'Error al comentar' });
  }
});

// @desc    Actualizar
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'No encontrado' });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'No autorizado' });
    
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('author', 'name email role avatar')
      .populate('category', 'name color');
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
});

// @desc    Eliminar
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'region role');
    if (!post) return res.status(404).json({ message: 'No encontrado' });

    const authorExists = !!post.author;
    const isAuthor = authorExists && post.author._id.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'admin' && req.user.adminRole === 'superadmin';
    const isRegionalAdmin = authorExists && req.user.role === 'admin' && req.user.adminRole === 'regional' && req.user.region === post.author.region;

    if (isAuthor || isSuperAdmin || isRegionalAdmin || (!authorExists && isSuperAdmin)) {
      await Post.findByIdAndDelete(req.params.id);
      res.json({ message: '✅ Publicación eliminada' });
    } else {
      res.status(403).json({ message: '⛔ No tienes permiso' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
});

// @desc    Reportar
router.post('/:id/report', protect, async (req, res) => {
  try {
    const { reason, description } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'No encontrado' });

    const existingReport = post.reports.find(r => r.user.toString() === req.user._id.toString());
    if (existingReport) return res.status(400).json({ message: 'Ya reportado' });

    post.reports.push({ user: req.user._id, reason, description });
    post.reportCount = post.reports.length;
    if (post.reportCount >= 5) post.isActive = false;

    await post.save();
    res.json({ message: 'Reportado' });
  } catch (error) {
    res.status(500).json({ message: 'Error report' });
  }
});

// @desc    Registrar vista
router.post('/:id/view', async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error vista' });
  }
});

// ==========================================
// 🛡️ ZONA DE ADMIN (MODERACIÓN)
// ==========================================

// @desc    1. Ver Reportes (CON FILTRO DE ROLES)
// @route   GET /api/posts/admin/reported
router.get('/admin/reported', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });

    // Buscamos posts con al menos 1 reporte
    let query = { reportCount: { $gt: 0 } };
    
    let posts = await Post.find(query)
      .populate('author', 'name email region avatar role') 
      .populate('reports.user', 'name email')
      .sort({ reportCount: -1 });

    // 🕵️‍♂️ FILTRO DE PODERES
    if (req.user.adminRole === 'regional') {
        const myRegion = req.user.region;
        // El Regional solo ve posts de su región o autores de su región
        posts = posts.filter(p => 
            p.region === myRegion || 
            (p.author && p.author.region === myRegion)
        );
    }
    // SuperAdmin y Technical ven todo.

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo reportes' });
  }
});

// @desc    2. Perdonar/Descartar reportes (Limpia el post)
// @route   POST /api/posts/:id/dismiss-reports
router.post('/:id/dismiss-reports', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'No encontrado' });

    // 🧹 Limpieza
    post.reports = [];        // Vaciar array de reportes
    post.reportCount = 0;     // Resetear contador
    post.isActive = true;     // Asegurar que sea visible

    await post.save();
    res.json({ message: '✅ Reportes descartados, post limpio.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al limpiar reportes' });
  }
});

export default router;