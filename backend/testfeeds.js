// backend/testFeeds.js
import Parser from 'rss-parser';

// Configuración básica para evitar bloqueos (User-Agent)
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
});

const feedsToTest = [
    // --- Nacionales ---
    'https://www.biobiochile.cl/lista/rss/servicios.xml',
    'https://chocale.cl/feed/',
    'https://www.america-retail.com/feed/',
    
    // --- Regionales (SoyChile) ---
    'https://www.soychile.cl/rss/Valparaiso.xml',
    'https://www.soychile.cl/rss/Concepcion.xml',
    
    // --- El Truco de Google News ---
    'https://news.google.com/rss/search?q=almacenes+de+barrio+chile&hl=es-419&gl=CL&ceid=CL:es-419'
];

async function test() {
    console.log("🧪 Iniciando prueba de Feeds RSS...\n");

    for (const url of feedsToTest) {
        try {
            console.log(`Trying: ${url}...`);
            const feed = await parser.parseURL(url);
            console.log(`✅ ÉXITO: ${feed.title}`);
            console.log(`   📝 Última noticia: "${feed.items[0]?.title}"`);
            console.log("---------------------------------------------------");
        } catch (error) {
            console.log(`❌ ERROR en ${url}`);
            console.log(`   Razón: ${error.message}`);
            console.log("---------------------------------------------------");
        }
    }
}

test();