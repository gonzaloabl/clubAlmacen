import express from 'express';
import Post from '../models/Post.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Obtener todas las publicaciones con filtros
// @route   GET /api/posts
router.get('/', async (req, res) => {
  try {
    const { category, search, region } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    // Filtro de Región
    if (region && region !== 'Todas') {
       query.region = region;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const posts = await Post.find(query)
      // 👇 AQUÍ ESTABA EL DETALLE: Agregamos 'avatar' a la lista de campos
      .populate('author', 'name email role adminRole region avatar') 
      .populate('category', 'name color')
      .sort({ isPinned: -1, createdAt: -1 })
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
      // 👇 ACTUALIZADO: Traer avatar y datos completos del autor
      .populate('author', 'name email role adminRole region avatar')
      .populate('category', 'name color')
      // 👇 ACTUALIZADO: Traer avatar también para los comentarios
      .populate('comments.user', 'name email role avatar') 
      .populate('likes', 'name email');
      
    if (!post) {
      return res.status(404).json({ message: '❌ Publicación no encontrada' });
    }
    
    // Incrementar vista (opcional aquí si ya usas el endpoint dedicado /view)
    // post.viewCount += 1; await post.save();
    
    res.json(post);
  } catch (error) {
    console.error('💥 Error al obtener publicación:', error);
    res.status(500).json({ message: '💥 Error al obtener publicación' });
  }
});

// @desc    Crear una publicación
// @route   POST /api/posts
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, category, tags, region, type } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const post = await Post.create({
      title,
      content,
      category,
      tags: tags || [],
      author: req.user._id,
      region: region || 'Nacional',
      type: type || 'forum'
    });
    
    // Populate para devolver el post creado con los datos del autor (incluido avatar)
    await post.populate('author', 'name email role adminRole region avatar');
    await post.populate('category', 'name color');
    
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creando post:", error);
    res.status(500).json({ message: '💥 Error al crear publicación', error: error.message });
  }
});

// @desc    Actualizar una publicación
// @route   PUT /api/posts/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'No encontrado' });
    
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('author', 'name email role avatar')
    .populate('category', 'name color');
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
});

// @desc    Eliminar una publicación
// @route   DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'region role');
    
    if (!post) return res.status(404).json({ message: 'No encontrado' });

    const authorExists = !!post.author;
    const isAuthor = authorExists && post.author._id.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'admin' && req.user.adminRole === 'superadmin';
    const isRegionalAdmin = authorExists && 
                            req.user.role === 'admin' && 
                            req.user.adminRole === 'regional' && 
                            req.user.region === post.author.region;

    if (isAuthor || isSuperAdmin || isRegionalAdmin || (!authorExists && isSuperAdmin)) {
      await Post.findByIdAndDelete(req.params.id);
      res.json({ message: '✅ Publicación eliminada correctamente' });
    } else {
      res.status(403).json({ message: '⛔ No tienes permiso' });
    }
  } catch (error) {
    console.error('Error delete:', error);
    res.status(500).json({ message: 'Error al eliminar' });
  }
});

// @desc    Agregar comentario
// @route   POST /api/posts/:id/comments
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'No encontrado' });
    
    post.comments.push({
      user: req.user._id,
      content
    });
    
    await post.save();
    // 👇 IMPORTANTE: Traer el avatar del usuario que acaba de comentar
    await post.populate('comments.user', 'name email role avatar');
    
    res.status(201).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: 'Error al comentar' });
  }
});

// @desc    Like/Unlike
// @route   POST /api/posts/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'No encontrado' });
    
    const alreadyLiked = post.likes.includes(req.user._id);
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    
    await post.save();
    res.json({ likes: post.likes, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: 'Error like' });
  }
});

// @desc    Reportar
// @route   POST /api/posts/:id/report
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

// @desc    Admin: Ver Reportes
// @route   GET /api/posts/admin/reported
router.get('/admin/reported', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });

    let query = { reportCount: { $gt: 0 } };
    
    // Traemos también el avatar por si quieres mostrar quién escribió el post reportado
    const reportedPosts = await Post.find(query)
      .populate('author', 'name email region avatar') 
      .populate('reports.user', 'name email')
      .sort({ reportCount: -1 });

    if (req.user.adminRole === 'regional') {
      const regionalPosts = reportedPosts.filter(p => p.author?.region === req.user.region);
      return res.json(regionalPosts);
    }

    res.json(reportedPosts);
  } catch (error) {
    res.status(500).json({ message: 'Error reportes' });
  }
});

// @desc    Registrar vista
// @route   POST /api/posts/:id/view
router.post('/:id/view', async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error vista' });
  }
});

export default router;