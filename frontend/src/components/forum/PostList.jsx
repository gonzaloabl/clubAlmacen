import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { postAPI, categoryAPI } from '../../services/api';
import { REGIONES } from '../../utils/regions';
import { formatRelativeTime } from '../../utils/helpers';
import { UserAvatar } from '../common/UserAvatar';
import styles from './PostList.module.css';

export function PostList() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Estado para el filtro de región
  const [selectedRegion, setSelectedRegion] = useState('Todas');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const searchQuery = searchParams.get('search');
  const categoryQuery = searchParams.get('cat');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar Categorías
        const catsData = await categoryAPI.getAll();
        setCategories(catsData);

        // Configurar filtros para la API
        const filters = {};
        if (searchQuery) filters.search = searchQuery;
        if (categoryQuery) filters.category = categoryQuery;
        
        if (selectedRegion !== 'Todas') {
            filters.region = selectedRegion;
        }

        const postsData = await postAPI.getAll(filters);
        
        // Filtrar visualmente los posts tipo 'forum' (excluir 'blog')
        const forumPosts = (postsData.posts || []).filter(p => p.type === 'forum' || !p.type);
        
        setPosts(forumPosts);
      } catch (err) {
        console.error("Error cargando foro:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchQuery, categoryQuery, selectedRegion]);

  // Lógica de filtrado local (Tabs)
  const getFilteredPosts = () => {
    let filtered = [...posts];
    
    if (filter === 'unanswered') {
      filtered = filtered.filter(p => p.comments.length === 0);
    } else if (filter === 'popular') {
      filtered.sort((a, b) => (b.viewCount + b.likes.length) - (a.viewCount + a.likes.length));
    }
    
    return filtered;
  };

  const displayedPosts = getFilteredPosts();

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.forumHeader}>
        <h1 className={styles.headerTitle}>Foro de la Comunidad</h1>
        <p className={styles.headerSubtitle}>
          Bienvenido al punto de encuentro. Busca respuestas, comparte experiencias y conecta con colegas.
        </p>
      </div>

      <div className={styles.layoutGrid}>
        
        {/* COLUMNA PRINCIPAL */}
        <div className={styles.mainColumn}>
          
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.tabs}>
              <div 
                className={`${styles.tab} ${filter === 'all' ? styles.activeTab : ''}`}
                onClick={() => setFilter('all')}
              >
                Recientes
              </div>
              <div 
                className={`${styles.tab} ${filter === 'popular' ? styles.activeTab : ''}`}
                onClick={() => setFilter('popular')}
              >
                Populares
              </div>
              <div 
                className={`${styles.tab} ${filter === 'unanswered' ? styles.activeTab : ''}`}
                onClick={() => setFilter('unanswered')}
              >
                Sin Respuesta
              </div>
            </div>
          </div>

          {/* Lista de Temas */}
          <div className={styles.topicList}>
            {loading ? (
              <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>
                🔄 Cargando discusiones...
              </div>
            ) : displayedPosts.length === 0 ? (
              <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>
                No se encontraron temas con estos filtros.
              </div>
            ) : (
              displayedPosts.map(post => (
                <div key={post._id} className={styles.topicRow} onClick={() => navigate(`/forum/post/${post._id}`)}>
                  <div className={styles.avatarContainer}>
                    <UserAvatar user={post.author} size="48px" fontSize="1.2rem" />
                  </div>

                  {/* Info Principal */}
                  <div className={styles.topicContent}>
                    <div className={styles.topicTitle}>
                      {post.isPinned && <span className={styles.pinnedBadge}>Fijado</span>}
                      {post.title}
                    </div>
                    
                    {/* Resumen del contenido */}
                    <p className={styles.topicExcerpt}>
                      {post.content}
                    </p>

                    <div className={styles.topicMeta}>
                      Por <strong>{post.author?.name}</strong> • {formatRelativeTime(post.createdAt)} • en <span style={{color:'var(--accent)'}}>{post.category?.name || 'General'}</span>
                      {/* Mostrar región si no es nacional */}
                      {post.region && post.region !== 'Nacional' && (
                          <span style={{marginLeft:'10px', fontSize:'0.8rem', background:'var(--bg-body)', padding:'2px 6px', borderRadius:'4px'}}>
                             📍 {post.region}
                          </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className={styles.topicStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{post.comments?.length || 0}</span>
                      <span className={styles.statLabel}>Respuestas</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{post.viewCount || 0}</span>
                      <span className={styles.statLabel}>Vistas</span>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR DERECHO */}
        <aside className={styles.sidebar}>
          
          {/* Botón Crear */}
          <div className={styles.widget}>
            {user ? (
              <Link to="/forum/create" className={styles.createBtn}>
                <span>✏️</span> Iniciar Nueva Discusión
              </Link>
            ) : (
              <Link to="/login" className={styles.createBtn} style={{background:'transparent', border:'2px solid var(--accent)', color:'var(--text-main)', justifyContent:'center'}}>
                Ingresar para Publicar
              </Link>
            )}
          </div>

          {/* Filtro por Región */}
          <div className={styles.widget}>
            <h4 className={styles.widgetTitle}>Filtrar por Región</h4>
            <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className={styles.searchInput}
                style={{cursor:'pointer'}}
            >
                <option value="Todas">🌐 Ver Todo Chile</option>
                <option value="Nacional">🇨🇱 Temas Nacionales</option>
                {REGIONES.filter(r => r !== 'Nacional').map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>
          </div>

          {/* Categorías */}
          <div className={styles.widget}>
            <h4 className={styles.widgetTitle}>Categorías</h4>
            <ul className={styles.categoryList}>
                <li className={styles.categoryItem} onClick={() => navigate('/forum')}>
                   Ver Todo
                </li>
                {categories.map(cat => (
                  <li 
                      key={cat._id} 
                      className={styles.categoryItem}
                      onClick={() => navigate(`/forum?cat=${cat._id}`)}
                  >
                    {cat.name}
                  </li>
                ))}
            </ul>
          </div>

          {/* Búsqueda */}
          <div className={styles.widget}>
             <h4 className={styles.widgetTitle}>Buscar en Foro</h4>
             <input 
                type="text" 
                placeholder="Palabra clave..." 
                className={styles.searchInput}
                onKeyDown={(e) => {
                    if(e.key === 'Enter') navigate(`/forum?search=${e.target.value}`);
                }}
             />
          </div>

        </aside>

      </div>
    </div>
  );
}