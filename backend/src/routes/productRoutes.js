import express from 'express';
import Product from '../models/Product.js';
// Asegúrate de importar los middlewares correctos
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Crear un producto (Solo Proveedores y Admins)
// @route   POST /api/products
router.post('/', protect, authorize('proveedor', 'admin'), async (req, res) => {
  try {
    const { name, price, description, image, stock, category } = req.body;
    
    // Creamos el producto asignando el usuario actual como 'provider'
    const product = await Product.create({ 
      name, 
      price, 
      description, 
      image, 
      stock, 
      category,
      provider: req.user._id // 🆕 Asignamos el dueño
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).json({ message: '💥 Error al crear producto' });
  }
});

// @desc    Obtener productos de un proveedor específico (PÚBLICO)
// @route   GET /api/products/provider/:providerId
router.get('/provider/:providerId', async (req, res) => {
  try {
    const products = await Product.find({ provider: req.params.providerId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos del proveedor' });
  }
});

// @desc    Obtener mis productos (Solo para el dashboard del proveedor)
// @route   GET /api/products/mine
router.get('/mine', protect, authorize('proveedor'), async (req, res) => {
  try {
    const products = await Product.find({ provider: req.user._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tus productos' });
  }
});

// @desc    Obtener todos los productos (General)
// @route   GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).populate('provider', 'name businessName');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

export default router;