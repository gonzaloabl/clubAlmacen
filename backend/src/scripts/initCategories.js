import mongoose from 'mongoose';
import Category from '../models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

const categories = [
  {
    name: 'General',
    description: 'Temas generales y diversos',
    color: '#8d8d8d'
  },
  {
    name: 'Tecnología',
    description: 'Discusiones sobre tecnología, programación y software',
    color: '#3498db'
  },
  {
    name: 'Ayuda',
    description: 'Pide ayuda y comparte soluciones',
    color: '#e74c3c'
  },
  {
    name: 'Noticias',
    description: 'Últimas noticias y anuncios',
    color: '#2ecc71'
  },
  {
    name: 'Off-Topic',
    description: 'Conversaciones casuales y temas diversos',
    color: '#f39c12'
  }
];

async function initCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Eliminar categorías existentes (opcional)
    await Category.deleteMany({});
    console.log('🗑️ Categorías existentes eliminadas');

    // Crear nuevas categorías
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categorías creadas:`);
    
    createdCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.color})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initCategories();