import { useState, useEffect } from 'react'; // 1. Importar Hooks
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { postAPI } from '../../services/api'; // 2. Importar API
import { formatRelativeTime } from '../../utils/helpers'; // 3. Importar helper de tiempo
import styles from './LandingPage.module.css';

export function LandingPage() {
  const { user } = useAuth();
  
  // Estado para guardar los posts reales
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar posts al montar el componente
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        // Pedimos solo 3 posts recientes
        const data = await postAPI.getAll({ limit: 3 });
        setRecentPosts(data.posts || []);
      } catch (error) {
        console.error("Error cargando actividad reciente:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  const features = [
    { title: "Foro Comunitario", icon: "💬", desc: "Resuelve dudas y debate con colegas.", link: "/forum" },
    { title: "Noticias del Rubro", icon: "📰", desc: "Mantente al día con normativas y precios.", link: "/noticias" },
    { title: "Proveedores", icon: "🚚", desc: "Encuentra distribuidores confiables.", link: "/directorio" },
    { title: "Alquiler de Espacios", icon: "🏠", desc: "Busca u ofrece locales y bodegas.", link: "/login" },
  ];

  return (
    <div className={styles.container}>
      
      {/* 1. HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>El punto de encuentro para almaceneros</h1>
            <p className={styles.heroSubtitle}>
              Únete a Club Almacén para conectar, aprender y hacer crecer tu negocio. 
              Una comunidad hecha por y para locatarios.
            </p>
            <div className={styles.heroButtons}>
              {user ? (
                <Link to="/dashboard" className={styles.btnPrimary}>Ir a mi Panel ➝</Link>
              ) : (
                <>
                  <Link to="/login" className={styles.btnPrimary}>Unirse Ahora</Link>
                  <Link to="/noticias" className={styles.btnSecondary}>Ver Noticias</Link>
                </>
              )}
            </div>
          </div>
          
          <div className={styles.heroVisual}>
            <div className={styles.heroImagePlaceholder}>
              Imagen Comunidad
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACCESOS DIRECTOS */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          {features.map((item, index) => (
            <Link key={index} to={item.link} className={styles.featureCard}>
              <span className={styles.featureIcon}>{item.icon}</span>
              <h3 className={styles.featureTitle}>{item.title}</h3>
              <p className={styles.featureDesc}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. ACTIVIDAD RECIENTE (REAL) */}
      <section className={styles.activitySection}>
        <div className={styles.activityContainer}>
          <h2 className={styles.sectionTitle}>Conversaciones Activas</h2>
          
          <div className={styles.discussionList}>
             {loading ? (
               <p style={{textAlign:'center', color:'var(--text-muted)'}}>Cargando discusiones...</p>
             ) : recentPosts.length === 0 ? (
               <p style={{textAlign:'center', color:'var(--text-muted)'}}>No hay conversaciones activas aún.</p>
             ) : (
               recentPosts.map(post => (
                 <Link 
                    key={post._id} 
                    to={`/forum/post/${post._id}`} 
                    className={styles.discussionRow}
                    style={{textDecoration: 'none', color: 'inherit'}} // Asegurar que el link no se vea azul
                 >
                    <div className={styles.avatar}>
                      {post.author?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className={styles.topicInfo}>
                       <h4 className={styles.topicTitle}>{post.title}</h4>
                       <div className={styles.topicMeta}>
                         {post.author?.name || 'Usuario'} • {formatRelativeTime(post.createdAt)} • en {post.category?.name || 'General'}
                       </div>
                    </div>
                 </Link>
               ))
             )}
          </div>
          
          <div style={{textAlign: 'center', marginTop: '30px'}}>
             <Link to="/forum" style={{color: 'var(--accent)', fontWeight: 'bold'}}>Ver todas las discusiones ➝</Link>
          </div>
        </div>
      </section>

    </div>
  );
}