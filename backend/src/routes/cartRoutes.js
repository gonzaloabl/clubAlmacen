import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// @desc    Obtener carrito del usuario
// @route   GET /api/cart
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: '💥 Error al obtener carrito' });
  }
});

// @desc    Añadir producto al carrito
// @route   POST /api/cart
router.post('/', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  
  if (!productId || !quantity) {
    return res.status(400).json({ message: '⚠️ Faltan productId o quantity' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: '❌ Producto no encontrado' });
    }
    const user = await User.findById(req.user._id);
    const itemIndex = user.cart.findIndex(item => item.product.equals(productId));

    if (itemIndex >= 0) {
      user.cart[itemIndex].quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    res.json(user.cart);
  } catch (error) {
    console.error('🔥 Error en POST /api/cart:', error);
    res.status(500).json({ message: '💥 Error interno del servidor' });
    res.status(500).json({ message: '💥 Error al actualizar carrito' });
  }
});

router.delete('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(item => !item.product.equals(req.params.productId));
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: '💥 Error al eliminar producto' });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: '✅ Ruta de prueba funciona' });
});
export default router;