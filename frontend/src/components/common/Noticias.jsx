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
        const response = await getNews({
          limit: 12, 
          sort: '-publicationDate'
        });
        setNoticias(response.news || []);
      } catch (error) {
        console.error("Error al cargar noticias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateString));
  };

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>Actualidad Regional</h1>
        <p className={styles.subtitle}>
          Mantente informado con las últimas novedades, normativas y eventos del rubro almacenero.
        </p>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <p>⏳ Cargando noticias...</p>
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
                  className={styles.newsCardLink}
                >
                  <div className={styles.newsCard}>
                    
                    {/* IMAGEN (O Placeholder si no hay) */}
                    <div className={styles.imageWrapper}>
                        {/* Aquí podrías poner <img src={noticia.image} ... /> si tu RSS tuviera imágenes */}
                        <div className={styles.placeholder}>
                           📰
                        </div>
                    </div>

                    {/* CUERPO */}
                    <div className={styles.cardBody}>
                      <div className={styles.cardMeta}>
                        <span className={styles.sourceBadge}>{noticia.source || 'Noticia'}</span>
                        <span className={styles.date}>{formatDate(noticia.publicationDate)}</span>
                      </div>
                      
                      <h3 className={styles.newsTitle}>{noticia.title}</h3>
                      
                      <p className={styles.newsContent}>
                        {noticia.content 
                          ? noticia.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' // Limpiar HTML básico y cortar
                          : 'Haz clic para leer el artículo completo en la fuente original.'}
                      </p>

                      <div className={styles.cardFooter}>
                         <span className={styles.readMore}>Leer artículo completado →</span>
                      </div>
                    </div>

                  </div>
                </a>
              ))
            ) : (
              <div className={styles.comingSoon}>
                <h3>📭 Sin noticias recientes</h3>
                <p>Estamos recopilando información actualizada para ti.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}