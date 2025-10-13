import express from 'express';
import Post from '../models/Post.js';
import { protect } from '../middleware/authMiddleware.js';

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
      .populate('comments.user', 'name email');
    
    if (!post) {
      return res.status(404).json({ message: '❌ Publicación no encontrada' });
    }
    
    // Incrementar contador de vistas
    post.viewCount += 1;
    await post.save();
    
    res.json(post);
  } catch (error) {
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

export default router;