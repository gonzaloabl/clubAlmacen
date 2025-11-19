import React, { useState, useEffect } from 'react';
import { getNews } from '../../services/api'; 
import styles from './Noticias.module.css';

export function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        setLoading(true);
        // Llamamos al nuevo endpoint de noticias. 
        // Solicitamos 12 artículos ordenados por fecha de publicación (la del RSS)
        const response = await getNews({
          limit: 12, 
          sort: '-publicationDate'
        });
        
        // Asumimos que la respuesta trae el array en 'response.data.news'
        const newsData = response.news || [];
        setNoticias(newsData);
      } catch (error) {
        console.error("Error al cargar noticias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  // Función auxiliar para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Reciente';
    const date = new Date(dateString);
    // Formato: 18 Nov
    return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' }).format(date);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>📰 Últimas Noticias</h1>
        <p className={styles.subtitle}>
          Mantente informado con la actualidad regional y nacional
        </p>
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <p>Cargando noticias...</p>
          </div>
        ) : (
          <div className={styles.newsGrid}>
            {noticias.length > 0 ? (
              noticias.map((noticia) => (
                <a 
                  key={noticia._id} 
                  href={noticia.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.newsCardLink} // Clase para que la card sea el link
                >
                  <div className={styles.newsCard}>
                    
                    <div className={styles.cardHeader}>
                      <span className={styles.newsDate}>
                        {formatDate(noticia.publicationDate)}
                      </span>
                      {/* Fuente de la noticia (ej: BioBioChile) */}
                      {noticia.source && (
                        <span className={styles.newsSource}>{noticia.source}</span>
                      )}
                    </div>
                    
                    <h3 className={styles.newsTitle}>{noticia.title}</h3>
                    
                    <p className={styles.newsContent}>
                      {noticia.content 
                        ? noticia.content.substring(0, 120) + '...' // Snippet corto
                        : 'Ver sitio original para más detalles.'}
                    </p>
                  </div>
                </a>
              ))
            ) : (
              // Si no hay noticias, muestra el mensaje de "coming soon"
              <div className={styles.comingSoon}>
                <h3>🚧 Sin noticias por ahora</h3>
                <p>Estamos recopilando la información más reciente de los medios regionales.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}