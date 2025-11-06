import mongoose from 'mongoose';
import Category from '../models/Category.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📁 Directorio actual del script:', __dirname);

// Intentar cargar .env desde diferentes ubicaciones
const possiblePaths = [
  join(__dirname, '../../.env'),           // backend/.env
  join(__dirname, '../../../.env'),        // clubAlmacen/.env  
  join(__dirname, '../../.env.example'),   // Si existe un ejemplo
];

console.log('🔍 Buscando archivo .env en:');
possiblePaths.forEach(path => {
  console.log(`   - ${path} (existe: ${fs.existsSync(path) ? 'SÍ' : 'NO'})`);
});

// Cargar el primer .env que exista
let envLoaded = false;
for (const path of possiblePaths) {
  if (fs.existsSync(path)) {
    console.log(`✅ Cargando .env desde: ${path}`);
    dotenv.config({ path });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.log('❌ No se encontró ningún archivo .env');
}

console.log('🔑 MONGODB_URI:', process.env.MONGODB_URI ? 'DEFINIDA' : 'UNDEFINED');

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
    // Si MONGODB_URI no está definida, usar una por defecto
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clubAlmacen';
    
    console.log('🔗 Conectando a MongoDB:', mongoURI);
    
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB');

    // Eliminar categorías existentes
    await Category.deleteMany({});
    console.log('🗑️ Categorías existentes eliminadas');

    // Crear nuevas categorías
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categorías creadas:`);
    
    createdCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.color})`);
    });

    await mongoose.connection.close();
    console.log('🎉 ¡Categorías inicializadas exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Soluciones:');
    console.log('   1. Asegúrate de que MongoDB esté ejecutándose');
    console.log('   2. Verifica que el archivo .env esté en la carpeta backend/');
    console.log('   3. El contenido de .env debe ser: MONGODB_URI=mongodb://localhost:27017/clubAlmacen');
    process.exit(1);
  }
}

initCategories();