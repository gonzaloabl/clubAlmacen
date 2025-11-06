import express from 'express';
import Post from '../models/Post.js';
import { protect , admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Obtener todas las publicaciones con filtros
// @route   GET /api/posts
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filtro por categoría
    if (category) {
      query.category = category;
    }
    
    // Búsqueda por texto
    if (search) {
      query.$text = { $search: search };
    }
    
    const posts = await Post.find(query)
      .populate('author', 'name email')
      .populate('category', 'name color')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Post.countDocuments(query);
    
    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: '💥 Error al obtener publicaciones' });
  }
});

// @desc    Obtener una publicación específica
// @route   GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email')
      .populate('category', 'name color')
      .populate('comments.user', 'name email')
      .populate('likes', 'name email');
      
    
    if (!post) {
      return res.status(404).json({ message: '❌ Publicación no encontrada' });
    }
    
    // 🔥 INCREMENTAR VISTAS - Esta es la parte clave
    post.viewCount = (post.viewCount || 0) + 1;
    await post.save();
    
    console.log(`👁️ Vista incrementada para post ${post._id}: ${post.viewCount} vistas`);
    
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
    const { title, content, category, tags } = req.body;
    
    const post = await Post.create({
      title,
      content,
      category,
      tags: tags || [],
      author: req.user._id
    });
    
    // Populate para devolver datos completos
    await post.populate('author', 'name email');
    await post.populate('category', 'name color');
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: '💥 Error al crear publicación' });
  }
});

// @desc    Actualizar una publicación
// @route   PUT /api/posts/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: '❌ Publicación no encontrada' });
    }
    
    // Verificar que el usuario es el autor
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '⛔ No autorizado para editar esta publicación' });
    }
    
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email').populate('category', 'name color');
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: '💥 Error al actualizar publicación' });
  }
});

// @desc    Eliminar una publicación
// @route   DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: '❌ Publicación no encontrada' });
    }
    
    // Verificar que el usuario es el autor
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '⛔ No autorizado para eliminar esta publicación' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Publicación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: '💥 Error al eliminar publicación' });
  }
});

// @desc    Agregar comentario
// @route   POST /api/posts/:id/comments
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: '❌ Publicación no encontrada' });
    }
    
    post.comments.push({
      user: req.user._id,
      content
    });
    
    await post.save();
    await post.populate('comments.user', 'name email');
    
    res.status(201).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: '💥 Error al agregar comentario' });
  }
});

// @desc    Like/Unlike publicación
// @route   POST /api/posts/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: '❌ Publicación no encontrada' });
    }
    
    const alreadyLiked = post.likes.includes(req.user._id);
    
    if (alreadyLiked) {
      // Quitar like
      post.likes = post.likes.filter(like => 
        like.toString() !== req.user._id.toString()
      );
    } else {
      // Agregar like
      post.likes.push(req.user._id);
    }
    
    await post.save();
    res.json({ 
      likes: post.likes,
      liked: !alreadyLiked 
    });
  } catch (error) {
    res.status(500).json({ message: '💥 Error al actualizar like' });
  }
});

// @desc    Reportar publicación
// @route   POST /api/posts/:id/report
router.post('/:id/report', protect, async (req, res) => {
  try {
    const { reason, description } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '❌ Publicación no encontrada' });
    }

    // Verificar si el usuario ya reportó esta publicación
    const existingReport = post.reports.find(
      report => report.user.toString() === req.user._id.toString()
    );

    if (existingReport) {
      return res.status(400).json({ message: '❌ Ya has reportado esta publicación' });
    }

    post.reports.push({
      user: req.user._id,
      reason,
      description
    });

    post.reportCount = post.reports.length;
    
    // Si tiene más de 5 reportes, desactivar automáticamente
    if (post.reportCount >= 5) {
      post.isActive = false;
    }

    await post.save();
    res.json({ message: '✅ Publicación reportada correctamente' });
  } catch (error) {
    res.status(500).json({ message: '💥 Error al reportar publicación' });
  }
});

// @desc    Obtener publicaciones reportadas (solo admin)
// @route   GET /api/posts/admin/reported
router.get('/admin/reported', protect, admin, async (req, res) => {
  try {
    const posts = await Post.find({ reportCount: { $gt: 0 } })
      .populate('author', 'name email')
      .populate('reports.user', 'name email')
      .sort({ reportCount: -1, createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: '💥 Error al obtener publicaciones reportadas' });
  }
});

// En postRoutes.js - agregar este nuevo endpoint
router.post('/:id/view', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: '❌ Publicación no encontrada' });
    }
    
    // Incrementar vistas de manera segura
    post.viewCount = (post.viewCount || 0) + 1;
    await post.save();
    
    console.log(`👁️ Vista registrada para post ${post._id}: ${post.viewCount} vistas`);
    res.json({ viewCount: post.viewCount });
  } catch (error) {
    console.error('💥 Error al registrar vista:', error);
    res.status(500).json({ message: '💥 Error al registrar vista' });
  }
});


export default router;