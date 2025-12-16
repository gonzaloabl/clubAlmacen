import mongoose from 'mongoose';
import Category from '../models/Category.js'; 
import 'dotenv/config'; 

const categoriesToCreate = [
    // Estas son las categorías EXACTAS que usará el sistema de noticias
    { name: 'Comercio', description: 'Noticias del rubro comercial y retail.' },
    { name: 'Financiero', description: 'Economía, finanzas e indicadores.' },
    { name: 'Tecnología', description: 'Novedades tecnológicas y digitales.' },
    { name: 'Legislación', description: 'Leyes, normativas y SII.' },
    { name: 'Regional', description: 'Noticias de regiones.' },
    { name: 'Actualidad', description: 'Noticias generales y contingencia.' }
];

async function initNewsCategories() {
    if (!process.env.MONGODB_URI) {
        console.error("❌ Error: MONGODB_URI no está definida.");
        return;
    }

    let connection;
    try {
        connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔌 Conectado a MongoDB...');

        for (const cat of categoriesToCreate) {
            // Buscamos si existe, si no, la crea (upsert)
            await Category.findOneAndUpdate(
                { name: cat.name },
                cat,
                { upsert: true, new: true }
            );
            console.log(`✅ Categoría asegurada: ${cat.name}`);
        }

        console.log('🏁 Categorías listas. Puedes cerrar este script.');

    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        if (connection) {
             await mongoose.disconnect();
             console.log('MongoDB desconectado.');
             process.exit();
        }
    }
}

initNewsCategories();