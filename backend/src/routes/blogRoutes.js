import express from 'express';
import Blog from '../models/Blog.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

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

// @desc    Publicar en el Muro (Solo Admin)
router.post('/', protect, requireAdmin, async (req, res) => {
  try {
    const blog = await Blog.create({
      title: req.body.title,
      content: req.body.content,
      tag: req.body.tag || 'Oficial',
      author: req.user._id
    });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error al publicar' });
  }
});

// @desc    Borrar del Muro (Solo Admin)
router.delete('/:id', protect, requireAdmin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
});

export default router;