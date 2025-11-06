// backend/testCategories.js
import mongoose from 'mongoose';
import Category from './src/models/Category.js';

async function testCategories() {
  try {
    await mongoose.connect('mongodb://localhost:27017/clubAlmacen');
    console.log('✅ Conectado a MongoDB');
    
    // Test 1: Contar categorías
    const count = await Category.countDocuments();
    console.log(`📊 Total categorías en BD: ${count}`);
    
    // Test 2: Buscar categorías
    const categories = await Category.find({});
    console.log(`🔍 Categorías encontradas: ${categories.length}`);
    
    // Test 3: Mostrar detalles
    categories.forEach(cat => {
      console.log(`   - ${cat._id}: ${cat.name} (${cat.color})`);
    });
    
    // Test 4: Buscar en la colección directamente
    const directCategories = await mongoose.connection.db.collection('categories').find({}).toArray();
    console.log(`🎯 Categorías directas de la colección: ${directCategories.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testCategories();