import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// --- CONFIGURACIÓN DE MULTER (Carga de Imágenes) ---
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
    cb(null, `prod-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Error: Solo imágenes!'));
  },
});

// --- RUTAS ---

// @desc    Crear Producto
// @route   POST /api/products
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    // Solo proveedores y admins pueden crear
    if (req.user.role !== 'proveedor' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No autorizado para vender' });
    }

    const { name, description, price, stock, category } = req.body;

    const productData = {
        provider: req.user._id,
        name,
        description,
        price,
        stock,
        category
    };

    if (req.file) {
        productData.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create(productData);
    res.status(201).json(product);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// @desc    Obtener MIS productos (Para el dashboard del proveedor)
// @route   GET /api/products/mine
router.get('/mine', protect, async (req, res) => {
  try {
    const products = await Product.find({ provider: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// @desc    Obtener TODOS los productos (Para el catálogo público/directorio)
// @route   GET /api/products
router.get('/', async (req, res) => {
  try {
    // Podrías agregar filtros por categoría aquí
    const products = await Product.find({ isActive: true })
        .populate('provider', 'name region businessName') // Mostrar quién lo vende
        .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar catálogo' });
  }
});

// @desc    Eliminar Producto
// @route   DELETE /api/products/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    // Verificar que el usuario sea el dueño
    if (product.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No autorizado' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Producto eliminado' });

  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
});

// @desc    Actualizar Producto
// @route   PUT /api/products/:id
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category, isActive } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    // Verificar que el usuario sea el dueño
    if (product.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No autorizado' });
    }

    // Actualizar campos
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.category = category || product.category;
    if (isActive !== undefined) product.isActive = isActive;

    // Si hay nueva imagen, actualizamos la ruta
    if (req.file) {
        product.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// @desc    Obtener productos de un proveedor específico (Público)
// @route   GET /api/products/provider/:id
router.get('/provider/:id', async (req, res) => {
  try {
    const products = await Product.find({ provider: req.params.id, isActive: true })
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos del proveedor' });
  }
});

export default router;