// src/routes/productRoutes.js
import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Crear un producto (solo admin)
// @route   POST /api/products
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, price, description, image, stock, category } = req.body;
    const product = await Product.create({ name, price, description, image, stock, category });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: '💥 Error al crear producto' });
  }
});

export default router;