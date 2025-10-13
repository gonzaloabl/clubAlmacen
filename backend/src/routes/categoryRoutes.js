import express from 'express';
import Category from '../models/Category.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Obtener todas las categorías
// @route   GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: '💥 Error al obtener categorías' });
  }
});

// @desc    Crear categoría (solo admin)
// @route   POST /api/categories
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const category = await Category.create({ name, description, color });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: '❌ La categoría ya existe' });
    }
    res.status(500).json({ message: '💥 Error al crear categoría' });
  }
});

export default router;