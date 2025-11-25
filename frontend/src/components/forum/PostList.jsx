import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { postAPI, categoryAPI } from '../../services/api'; // Asegúrate de tener categoryAPI
import { formatRelativeTime } from '../../utils/helpers';
import styles from './PostList.module.css'; // Importamos el nuevo CSS

export function PostList() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unanswered', 'popular'
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Recuperar parámetros de URL (búsqueda o categoría)
  const searchQuery = searchParams.get('search');
  const categoryQuery = searchParams.get('cat');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Cargar Categorías para el Sidebar
        const catsData = await categoryAPI.getAll();
        setCategories(catsData);

        // 2. Cargar Posts con filtros del Backend
        const filters = {};
        if (searchQuery) filters.search = searchQuery;
        if (categoryQuery) {
            // Buscar el ID de la categoría si viene por nombre o usar directo si es ID
            // Por simplicidad asumimos que el backend maneja IDs o implementamos lógica aquí
            filters.category = categoryQuery; 
        }

        const postsData = await postAPI.getAll(filters);
        setPosts(postsData.posts || []);
      } catch (err) {
        console.error("Error cargando foro:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchQuery, categoryQuery]);

  // Lógica de filtrado en cliente (Tabs)
  const getFilteredPosts = () => {
    let filtered = [...posts];
    
    if (filter === 'unanswered') {
      filtered = filtered.filter(p => p.comments.length === 0);
    } else if (filter === 'popular') {
      // Ordenar por likes + vistas
      filtered.sort((a, b) => (b.viewCount + b.likes.length) - (a.viewCount + a.likes.length));
    }
    // 'all' usa el orden por defecto del backend (fecha)
    
    return filtered;
  };

  const displayedPosts = getFilteredPosts();

  return (
    <div className={styles.container}>
      
      {/* HEADER TIPO DISPUTO */}
      <div className={styles.forumHeader}>
        <h1 className={styles.headerTitle}>Foro de la Comunidad</h1>
        <p className={styles.headerSubtitle}>
          Bienvenido al punto de encuentro. Busca respuestas, comparte experiencias y conecta con colegas.
        </p>
      </div>

      <div className={styles.layoutGrid}>
        
        {/* --- COLUMNA PRINCIPAL --- */}
        <div className={styles.mainColumn}>
          
          {/* Toolbar: Tabs de filtro */}
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
            {/* Aquí podrías poner un buscador local pequeño si quisieras */}
          </div>

          {/* Lista de Temas */}
          <div className={styles.topicList}>
            {loading ? (
              <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>Cargando discusiones...</div>
            ) : displayedPosts.length === 0 ? (
              <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>
                No se encontraron temas. ¡Sé el primero en publicar!
              </div>
            ) : (
              displayedPosts.map(post => (
                <div key={post._id} className={styles.topicRow} onClick={() => navigate(`/forum/post/${post._id}`)}>
                  
                  {/* Avatar Autor */}
                  <div className={styles.avatarContainer}>
                    <div className={styles.avatar}>
                      {post.author?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>

                  {/* Info Principal */}
                  <div className={styles.topicContent}>
                    <div className={styles.topicTitle}>
                      {post.isPinned && <span className={styles.pinnedBadge}>Fijado</span>}
                      {post.title}
                    </div>
                    <div className={styles.topicMeta}>
                      Por <strong>{post.author?.name}</strong> • {formatRelativeTime(post.createdAt)} • en <span style={{color:'var(--accent)'}}>{post.category?.name || 'General'}</span>
                    </div>
                  </div>

                  {/* Estadísticas */}
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

        {/* --- SIDEBAR DERECHO --- */ }
        <aside className={styles.sidebar}>
          
          {/* Botón Crear */}
          <div className={styles.widget}>
            {user ? (
              <Link to="/forum/create" className={styles.createBtn}>
                ✏️ Iniciar Nueva Discusión
              </Link>
            ) : (
              <Link to="/login" className={styles.createBtn} style={{background:'transparent', border:'2px solid var(--accent)', color:'var(--text-main)'}}>
                Ingresar para Publicar
              </Link>
            )}
          </div>

          {/* Categorías */}
          <div className={styles.widget}>
            <h4 className={styles.widgetTitle}>Categorías</h4>
            <ul className={styles.categoryList}>
              <li className={styles.categoryItem} onClick={() => navigate('/forum')}>
                 <span>📂 Ver Todo</span>
              </li>
              {categories.map(cat => (
                <li 
                    key={cat._id} 
                    className={styles.categoryItem}
                    onClick={() => navigate(`/forum?cat=${cat._id}`)}
                >
                  <span>{cat.name}</span>
                  {/* Si tuvieras conteo de posts por categoría, iría aquí */}
                  {/* <span className={styles.categoryCount}>12</span> */}
                </li>
              ))}
            </ul>
          </div>

          {/* Búsqueda Rápida (Widget) */}
          <div className={styles.widget}>
             <h4 className={styles.widgetTitle}>Buscar en Foro</h4>
             <input 
                type="text" 
                placeholder="Palabra clave..." 
                style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid var(--border)', background:'var(--bg-body)', color:'var(--text-main)'}}
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