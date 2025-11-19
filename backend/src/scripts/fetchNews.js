// backend/src/scripts/fetchNews.js
import mongoose from 'mongoose';
import Parser from 'rss-parser';
import News from '../models/News.js';       // Importamos el NUEVO modelo
import Category from '../models/Category.js'; // Importamos el modelo de Categoría
import dotenv from 'dotenv'; 

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
});



// --- Configuración de Categorización por Temas ---
const categoryKeywords = {
  Financiero: ['economia', 'banco', 'bolsa', 'comercio', 'tributario', 'impuestos', 'cmf', 'uf'],
  Agricultura: ['agro', 'campo', 'cosecha', 'sequía', 'fruta', 'exportación', 'sag'],
  Leyes: ['ley', 'tribunal', 'justicia', 'fiscalía', 'corte', 'legal'],
  // Nota: Agrega aquí las categorías que ya creaste en tu BBDD para Temas
};

const rssFeeds = [
    { region: 'Nacional', url: 'https://www.eldesconcierto.cl/feed/' },
];

/**
 * Función principal para buscar, categorizar y guardar noticias
 * (Esta función se llama desde el Cron Job)
 */
export async function fetchAndSaveNews() {
  
  // 1. Obtener todas las categorías de la BBDD
  const categoriesFromDB = await Category.find({});
  const categoryMap = {}; 
  categoriesFromDB.forEach(cat => {
    categoryMap[cat.name] = cat._id;
  });

  // 2. Procesar cada feed RSS
  for (const feedInfo of rssFeeds) {
    try {
      const feed = await parser.parseURL(feedInfo.url);
      
      for (const item of feed.items) {
        
        // 3. Evitar duplicados usando el link (único)
        const existingNews = await News.findOne({ link: item.link });
        if (existingNews) continue; 

        // 4. Categorización y Curación
        const foundCategoryIds = new Set();
        const content = `${item.title.toLowerCase()} ${item.contentSnippet?.toLowerCase() || ''}`;

        // Asignar Categoría de Región
        if (categoryMap[feedInfo.region]) {
          foundCategoryIds.add(categoryMap[feedInfo.region]);
        }

        // Asignar Categorías por Tema (Keyword Matching)
        for (const categoryName in categoryKeywords) {
          if (categoryKeywords[categoryName].some(keyword => content.includes(keyword))) {
            if (categoryMap[categoryName]) {
              foundCategoryIds.add(categoryMap[categoryName]);
            }
          }
        }

        // 5. Crear y guardar el nuevo documento News
        const newNews = new News({
          title: item.title,
          content: item.contentSnippet || 'Ver sitio original para detalles.',
          link: item.link, 
          categories: Array.from(foundCategoryIds),
          publicationDate: new Date(item.pubDate), 
          source: feed.title,
        });

        await newNews.save();
        console.log(`[NEWS SCRAPER] Noticia guardada: ${item.title} (Fuente: ${feedInfo.region})`);
      }
    } catch (error) {
      console.error(`[NEWS SCRAPER] Error al procesar el feed ${feedInfo.url}:`, error.message);
    }
  }
}

