// routes/categoryRoutes.js
import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// @desc    Obtener todas las categorías
// @route   GET /api/categories
router.get('/', async (req, res) => {
  try {
    console.log('🚀 SOLICITUD RECIBIDA en /api/categories');
    console.log('🔍 Buscando categorías en la base de datos...');
    
    // FORZAR la búsqueda sin await primero para debug
    const categoriesPromise = Category.find({}).sort({ name: 1 });
    console.log('📦 Query ejecutado, esperando resultados...');
    
    const categories = await categoriesPromise;
    console.log(`✅ CATEGORÍAS ENCONTRADAS: ${categories.length}`);
    
    // Debug detallado de cada categoría
    categories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ID: ${cat._id}, Nombre: "${cat.name}", Color: ${cat.color}`);
    });
    
    // Verificar que los datos son correctos
    console.log('📊 Tipo de datos:', Array.isArray(categories) ? 'Array' : typeof categories);
    console.log('🔗 Primer elemento:', categories[0] ? 'EXISTE' : 'NO EXISTE');
    
    if (categories.length > 0) {
      console.log('🎯 Enviando categorías al frontend...');
      res.json(categories);
    } else {
      console.log('⚠️  No hay categorías para enviar');
      res.json([]);
    }
    
  } catch (error) {
    console.error('💥 ERROR CRÍTICO en /api/categories:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;