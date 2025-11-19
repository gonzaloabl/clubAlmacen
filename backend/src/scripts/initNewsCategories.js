// backend/src/scripts/initNewsCategories.js
import mongoose from 'mongoose';
import Category from '../models/Category.js'; // Asegúrate de que esta ruta es correcta
import 'dotenv/config'; // Necesario para cargar MONGO_URI

const categoriesToCreate = [
    // Categorías de Temas (Usadas en el Keyword Matching)
    { name: 'Financiero', description: 'Noticias sobre economía, impuestos y comercio.' },
    { name: 'Agricultura', description: 'Noticias sobre el campo, cosechas y exportación.' },
    { name: 'Leyes', description: 'Noticias sobre tribunales, fiscalía y procesos legales.' },

    // Categorías de Regiones (Usadas para segmentar las fuentes RSS)
    { name: 'Valparaíso', description: 'Noticias de la Región de Valparaíso (SoyChile).' },
    { name: 'Temuco', description: 'Noticias de la Región de La Araucanía (SoyChile).' },
    { name: 'BioBio', description: 'Noticias nacionales de BioBioChile.' },
    // Puedes agregar más regiones si usas más feeds de SoyChile aquí
];

async function initNewsCategories() {
    if (!process.env.MONGODB_URI) {
        console.error("❌ Error: MONGODB_URI no está definida. La conexión fallará.");
        return;
    }

    let connection;
    try {
        // Conexión a la base de datos
        connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB para inicialización.');

        const promises = categoriesToCreate.map(async (categoryData) => {
            const existing = await Category.findOne({ name: categoryData.name });
            
            if (!existing) {
                await Category.create(categoryData);
                console.log(`[INIT] Creada categoría: ${categoryData.name}`);
            } else {
                console.log(`[INIT] Categoría ya existe: ${categoryData.name}`);
            }
        });

        await Promise.all(promises);
        console.log('--- Inicialización de categorías de noticias completada. ---');

    } catch (error) {
        console.error('💥 Error fatal al inicializar categorías:', error);
    } finally {
        if (connection) {
             await mongoose.disconnect();
             console.log('MongoDB desconectado.');
        }
    }
}

// Ejecución del script
initNewsCategories();