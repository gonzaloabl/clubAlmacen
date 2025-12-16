import Parser from 'rss-parser';
import News from '../models/News.js';
import Category from '../models/Category.js';

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['enclosure', 'enclosure'],
            ['content:encoded', 'contentEncoded']
        ]
    },
    timeout: 5000 
});

// MAPEO FIJO: Si viene de X diario -> Va a Y categoría
const rssFeeds = [
  { url: 'https://cnc.cl/feed/', name: 'Camara Nac. Comercio', categoryName: 'Comercio' },
  { url: 'https://comerciante.lacuarta.com/feed/', name: 'La Cuarta', categoryName: 'Comercio' },
  { url: 'https://chocale.cl/feed/', name: 'Chócale', categoryName: 'Financiero' },
  { url: 'https://www.fayerwayer.com/feed', name: 'FayerWayer', categoryName: 'Tecnología' },
  { url: 'https://www.diarioeldia.cl/rss/REGION.xml', name: 'Diario El Día', categoryName: 'Regional' },
  { url: 'https://cooperativa.cl/noticias/site/tax/port/all/rss____1.xml', name: 'Cooperativa', categoryName: 'Actualidad' }
];

export async function fetchAndSaveNews() {
  console.log('🚀 Iniciando recolección de noticias...');
  
  try {
    // 🔥 Descomenta esto SOLO UNA VEZ si quieres borrar las noticias viejas y empezar limpio 

    // Cargamos las categorías para obtener sus IDs reales
    const categoriesFromDB = await Category.find({});
    const categoryMap = {}; 
    categoriesFromDB.forEach(cat => { categoryMap[cat.name] = cat._id; });

    for (const feedInfo of rssFeeds) {
      try {
        const targetId = categoryMap[feedInfo.categoryName];

        if (!targetId) {
            console.warn(`⚠️ Falta la categoría "${feedInfo.categoryName}". Ejecuta initNewsCategories.js primero.`);
            continue; 
        }

        const feed = await parser.parseURL(feedInfo.url);

        for (const item of feed.items) {
          const existingNews = await News.findOne({ link: item.link });
          if (existingNews) continue;

          // Rescate de imagen
          let imageUrl = item.enclosure?.url || item.mediaContent?.['$']?.url;
          if (!imageUrl && item.contentEncoded) {
             const imgMatch = item.contentEncoded.match(/src="([^"]+?\.(?:jpg|jpeg|png|webp))"/i);
             if (imgMatch) imageUrl = imgMatch[1];
          }

          const newNews = new News({
            title: item.title,
            content: item.contentSnippet?.substring(0, 200) + '...' || 'Leer más...',
            link: item.link,
            categories: [targetId], // ID real de la categoría
            publicationDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            source: feedInfo.name, 
            image: imageUrl
          });

          await newNews.save();
        }
        console.log(`✅ ${feedInfo.name} procesado.`);

      } catch (err) {
        console.error(`❌ Error en ${feedInfo.name}: ${err.message}`);
      }
    }
    console.log('🏁 Noticias actualizadas.');
  } catch (error) {
    console.error('🔥 Error crítico:', error);
  }
}