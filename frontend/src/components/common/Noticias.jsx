import React, { useState, useEffect, useMemo } from 'react';
import { getNews } from '../../services/api'; 
import styles from './Noticias.module.css';

const LOGOS_FUENTES = {
  'Camara Nac. Comercio': 'https://cnc.cl/wp-content/themes/cnc/img/logo.png',
  'Cooperativa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Cooperativa_cl_2017.svg/1200px-Cooperativa_cl_2017.svg.png',
  'La Cuarta': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/La_Cuarta_logo.svg/2560px-La_Cuarta_logo.svg.png',
  'FayerWayer': 'https://upload.wikimedia.org/wikipedia/commons/0/05/FayerWayer_logo.jpg',
  'Diario El Día': 'https://www.diarioeldia.cl/u/plantillas/p/diarioeldia/img/logo.png',
  'SII Oficial': 'https://www.sii.cl/imagenes/logo_sii.png',
  'Chócale': 'https://chocale.cl/wp-content/uploads/2020/03/logo-chocale-amp.png',
  'El País': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/El_Pa%C3%ADs_Logotipo.svg/1200px-El_Pa%C3%ADs_Logotipo.svg.png'
};

export function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [paginaActual, setPaginaActual] = useState(1);
  const NOTICIAS_POR_PAGINA = 6; 

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        setLoading(true);
        const response = await getNews({ limit: 60, sort: '-publicationDate' });
        setNoticias(response.news || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNoticias();
  }, []);

  // Formato simple: "16 dic"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' }).format(new Date(dateString));
  };

  // Filtros
  const filtrosDisponibles = useMemo(() => {
    const cats = new Set(['Todas']);
    noticias.forEach(n => {
      if (n.categories && n.categories.length > 0) {
        n.categories.forEach(c => c.name && cats.add(c.name));
      }
    });
    return Array.from(cats).sort();
  }, [noticias]);

  // Filtrado Lógico
  const noticiasFiltradas = useMemo(() => {
    if (categoriaSeleccionada === 'Todas') return noticias;
    return noticias.filter(n => n.categories?.some(c => c.name === categoriaSeleccionada));
  }, [noticias, categoriaSeleccionada]);

  // Paginación
  const totalPaginas = Math.ceil(noticiasFiltradas.length / NOTICIAS_POR_PAGINA);
  const noticiasParaMostrar = noticiasFiltradas.slice(
    (paginaActual - 1) * NOTICIAS_POR_PAGINA,
    paginaActual * NOTICIAS_POR_PAGINA
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Novedades del Sector</h1>
      </div>

      <div className={styles.content}>
        {!loading && (
          <div className={styles.filterBar}>
            {filtrosDisponibles.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategoriaSeleccionada(cat); setPaginaActual(1); }}
                className={`${styles.filterBtn} ${categoriaSeleccionada === cat ? styles.activeFilter : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className={styles.loadingContainer}><p>⏳ Cargando noticias...</p></div>
        ) : (
          <>
            <div className={styles.newsGrid}>
              {noticiasParaMostrar.map((noticia) => {
                const nombreCategoria = noticia.categories?.[0]?.name || 'General';
                
                return (
                  <a key={noticia._id} href={noticia.link} target="_blank" rel="noopener noreferrer" className={styles.newsCardLink}>
                    <div className={styles.newsCard}>
                      <div className={styles.imageWrapper}>
                        <img 
                          src={noticia.image || LOGOS_FUENTES[noticia.source]} 
                          alt="noticia"
                          className={styles.newsImage} 
                          style={{ 
                              objectFit: noticia.image ? 'cover' : 'contain', 
                              padding: noticia.image ? '0' : '20px',
                              background: noticia.image ? 'transparent' : '#f8f9fa'
                          }}
                          onError={(e) => { 
                              e.target.style.display = 'none'; 
                              e.target.parentElement.classList.add(styles.fallback); 
                          }} 
                        />
                        {/* Etiqueta flotante de categoría */}
                        <span className={styles.floatingCategory}>{nombreCategoria}</span>
                      </div>

                      <div className={styles.cardBody}>
                        {/* Cabecera con Fuente y Fecha (Sin hora) */}
                        <div className={styles.cardMetaHeader}>
                            <span className={styles.sourceName}>📰 {noticia.source}</span>
                            <span className={styles.timeAgo}>📅 {formatDate(noticia.publicationDate)}</span>
                        </div>
                        
                        <h3 className={styles.newsTitle}>{noticia.title}</h3>
                        
                        <div className={styles.cardFooter}>
                           <span className={styles.readMore}>Leer más →</span>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {totalPaginas > 1 && (
               <div className={styles.pagination}>
                 <button disabled={paginaActual===1} onClick={()=>setPaginaActual(p=>p-1)} className={styles.pageBtn}>←</button>
                 <span className={styles.pageInfo}>{paginaActual} / {totalPaginas}</span>
                 <button disabled={paginaActual===totalPaginas} onClick={()=>setPaginaActual(p=>p+1)} className={styles.pageBtn}>→</button>
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}