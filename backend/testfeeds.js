import Parser from 'rss-parser';

const parser = new Parser({
    timeout: 8000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36' },
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['enclosure', 'enclosure'],
            ['content:encoded', 'contentEncoded'],
            ['content', 'content'],
            ['description', 'description']
        ]
    }
});

const feedsToInspect = [
    { url: 'https://chocale.cl/feed/', name: 'Chócale' },
    { url: 'https://www.eldesconcierto.cl/feed', name: 'El Desconcierto' },
    { url: 'https://www.america-retail.com/feed/', name: 'America Retail' },
    { url: 'https://www.cooperativa.cl/noticias/site/tax/port/all/rss____1.xml', name: 'Cooperativa' },
    { url: 'https://cnc.cl/feed/', name: 'CNC' },
    { url: 'https://revistaemprende.cl/feed/', name: 'Emprende' },
    { url: 'https://comerciante.lacuarta.com/feed', name: 'La cuarta' },
    { url: 'https://www.theclinic.cl/feed', name: '❓ The Clinic' },
    { url: 'https://www.elciudadano.com/feed', name: '❓ El Ciudadano' },
    { url: 'https://www.publimetro.cl/feed', name: '❓ Publimetro' },
    { url: 'https://www.adnradio.cl/feed', name: '❓ ADN Radio' },
    { url: 'https://www.fayerwayer.com/feed', name: '❓ FayerWayer (Tecnología)' },
    { url: 'https://puranoticia.pnt.cl/feed', name: '❓ Pura Noticia' },
    { url: 'https://feeds.feedburner.com/bcn/ulp?format=xml', name: 'BCN' },
    { url: 'https://www.sii.cl/pagina/actualizada/noticias/rss/siinot_rss.xml', name: 'SII' },
    { url: 'https://zeus.sii.cl/admin/rss/siicyr_rss.xml', name: 'SII' },
    { url: 'https://www.sii.cl/pagina/actualizada/noticias/rss/siiall_rss.xml', name: 'SII' },
    { url: 'https://zeus.sii.cl/admin/rss/sii_ind_rss.xml', name: 'SII' },
    { url: 'http://energiaabierta.cl/feed', name: 'energia abierta' },
    { url: 'https://www.anticorrupcion.cl/web_site/SyndicationProducer?feedName=CGR&syndicationStyleName=rss&searchMaxResults=10', name: 'Contraloria' },
    { url: 'https://www.anticorrupcion.cl/web_site/SyndicationProducer?feedName=MP&syndicationStyleName=rss&searchMaxResults=10', name: 'Ministerio Publico' },
    { url: 'https://www.anticorrupcion.cl/web_site/SyndicationProducer?feedName=CDE&syndicationStyleName=rss&searchMaxResults=10', name: 'Consejo de defensa del estado' },
    { url: 'https://www.diarioeldia.cl/rss/economia/', name: 'EldiaEco' },
    { url: 'https://www.diarioeldia.cl/rss/region/', name: 'REGION' },
    { url: 'https://www.diarioeldia.cl/rss/pais/', name: 'PAIS' },
    { url: 'https://www.diarioeldia.cl/rss/comercial/', name: 'COMERFCIAL' },
    { url: 'https://www.diarioeldia.cl/rss/fraudes/', name: 'FRAUDE' },
    { url: 'https://www.biobiochile.cl/static/feed-rss', name: 'BIOBIO' },
    { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada', name: 'economia' },
    { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/tecnologia/portada', name: 'tecnologia' },
    { url: 'https://feeds.elpais.com/mrss-s/list/ep/site/elpais.com/section/gastronomia', name: 'gastronomia' },
    { url: 'https://feeds.elpais.com/mrss-s/list/ep/site/elpais.com/section/economia/subsection/negocios', name: 'negocios' },
    { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/chile/portada', name: 'chile' },
    { url: 'https://www.df.cl/noticias/site/list/port/rss.xml', name: 'diariofinaciero' },
    { url: 'https://www.lanacion.cl/feed/', name: 'Lanacion' },
    


    // Google News suele venir sin foto en el RSS estándar, pero probemos:
    { url: 'https://news.google.com/rss/search?q=almacenes+de+barrio+chile&hl=es-419&gl=CL&ceid=CL:es-419', name: 'Google News' }
];

async function inspectFeeds() {
    console.log('🕵️‍♂️ INICIANDO INSPECCIÓN PROFUNDA DE IMÁGENES...\n');

    for (const feed of feedsToInspect) {
        console.log(`📡 Analizando: ${feed.name}...`);
        try {
            const res = await parser.parseURL(feed.url);
            
            if (res.items.length > 0) {
                const item = res.items[0];
                console.log(`   📝 Título: "${item.title}"`);
                
                // 1. Buscando en lugares estándar
                let foundImage = null;
                let method = '';

                if (item.enclosure && item.enclosure.url) {
                    foundImage = item.enclosure.url;
                    method = 'Tag <enclosure>';
                } else if (item.mediaContent && item.mediaContent['$'] && item.mediaContent['$'].url) {
                    foundImage = item.mediaContent['$'].url;
                    method = 'Tag <media:content>';
                } 
                
                // 2. Buscando dentro del HTML (El truco sucio)
                if (!foundImage) {
                    // Juntamos todo el texto posible
                    const htmlPayload = (item.contentEncoded || item.content || item.description || '');
                    
                    // Buscamos cualquier cosa que parezca una imagen jpg/png/webp
                    const imgMatch = htmlPayload.match(/src="([^"]+?\.(jpg|jpeg|png|webp))"/i);
                    
                    if (imgMatch) {
                        foundImage = imgMatch[1];
                        method = 'Oculta en el HTML (Regex)';
                    } else {
                        // Intento desesperado: buscar cualquier src="..."
                        const anySrc = htmlPayload.match(/src="([^"]+?)"/i);
                        if(anySrc) {
                             // A veces Google pone un pixel de rastreo, hay que tener ojo
                             console.log(`   ⚠️ Posible imagen en HTML (sin extensión clara): ${anySrc[1]}`);
                        }
                    }
                }

                if (foundImage) {
                    console.log(`   ✅ FOTO ENCONTRADA: ${foundImage}`);
                    console.log(`   🔍 Método: ${method}`);
                } else {
                    console.log(`   ❌ NO SE ENCONTRÓ FOTO CLARA.`);
                    // Imprimimos un poco del contenido para que tú veas si hay algo raro
                    const snippet = (item.contentEncoded || item.description || '').substring(0, 150);
                    console.log(`   👀 Vistazo al contenido: ${snippet}...`);
                }

            } else {
                console.log(`   ⚠️ Feed vacío.`);
            }
        } catch (error) {
            console.log(`   ❌ ERROR DE CONEXIÓN: ${error.message}`);
        }
        console.log('---------------------------------------------------');
    }
}

inspectFeeds();