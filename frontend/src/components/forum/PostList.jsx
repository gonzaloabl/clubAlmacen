import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { postAPI, categoryAPI } from '../../services/api';
import { REGIONES } from '../../utils/regions';
import { formatRelativeTime } from '../../utils/helpers';
import { UserAvatar } from '../common/UserAvatar';
import styles from './PostList.module.css';

export function PostList() {
  const [posts, setPosts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null); // Para guardar info de la categoría actual
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Estado para el filtro de región (Inicialmente 'Todas')
  const [selectedRegion, setSelectedRegion] = useState('Todas');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categoryId } = useParams(); // Capturamos el ID desde la URL
  
  const searchQuery = searchParams.get('search');

  // 1. EFECTO: Detectar región del usuario al cargar
  useEffect(() => {
    if (user?.region) {
      setSelectedRegion(user.region);
    }
  }, [user]);

  // 2. EFECTO: Cargar Datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // A. Si hay categoría en la URL, buscamos sus datos (Nombre, Descripción, Grupo)
        if (categoryId) {
            const allCats = await categoryAPI.getAll();
            const foundCat = allCats.find(c => c._id === categoryId);
            setCurrentCategory(foundCat);
        } else {
            setCurrentCategory(null);
        }

        // B. Configurar filtros para la API
        const filters = {};
        if (searchQuery) filters.search = searchQuery;
        
        // Prioridad al ID de la URL
        if (categoryId) filters.category = categoryId;
        
        // Filtro de Región
        if (selectedRegion !== 'Todas') {
            filters.region = selectedRegion;
        }

        // C. Cargar Posts
        const postsData = await postAPI.getAll(filters);
        
        // Filtrar visualmente posts tipo 'forum'
        const forumPosts = (postsData.posts || []).filter(p => p.type === 'forum' || !p.type);
        
        setPosts(forumPosts);
      } catch (err) {
        console.error("Error cargando foro:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchQuery, categoryId, selectedRegion]);

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

  // 3. LÓGICA DE SEGURIDAD VISUAL
  // Determina si el usuario puede ver el botón de "Crear Post" en esta categoría
  const canPostInCategory = () => {
    if (!user) return false; // Si no está logueado, mostramos botón de login
    if (user.role === 'admin') return true; // Admin puede todo
    
    // Si no estamos en una categoría específica (Hall), permitimos ir al form (allí se valida)
    if (!currentCategory) return true; 

    const group = currentCategory.group; // 'locatarios', 'proveedores', 'comunidad'
    
    // Reglas estrictas por rol
    if (group === 'locatarios' && user.role !== 'locatario') return false;
    if (group === 'proveedores' && user.role !== 'proveedor') return false;
    
    return true; // Comunidad está abierta a todos
  };

  return (
    <div className={styles.container}>
      
      {/* HEADER DINÁMICO */}
      <div className={styles.forumHeader}>
        <div style={{maxWidth: '1200px', margin: '0 auto', textAlign: 'left', marginBottom: '10px'}}>
            <Link to="/forum" style={{color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem'}}>
                ← Volver al Hall Principal
            </Link>
        </div>

        <h1 className={styles.headerTitle}>
            {currentCategory ? currentCategory.name : 'Resultados de Búsqueda'}
        </h1>
        <p className={styles.headerSubtitle}>
            {currentCategory ? currentCategory.description : 'Explorando temas de la comunidad'}
        </p>
      </div>

      <div className={styles.layoutGrid}>
        
        {/* COLUMNA PRINCIPAL */}
        <div className={styles.mainColumn}>
          
          <div className={styles.toolbar}>
            <div className={styles.tabs}>
              <div className={`${styles.tab} ${filter === 'all' ? styles.activeTab : ''}`} onClick={() => setFilter('all')}>Recientes</div>
              <div className={`${styles.tab} ${filter === 'popular' ? styles.activeTab : ''}`} onClick={() => setFilter('popular')}>Populares</div>
              <div className={`${styles.tab} ${filter === 'unanswered' ? styles.activeTab : ''}`} onClick={() => setFilter('unanswered')}>Sin Respuesta</div>
            </div>
          </div>

          <div className={styles.topicList}>
            {loading ? (
              <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>🔄 Cargando discusiones...</div>
            ) : displayedPosts.length === 0 ? (
              <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>
                No hay temas aquí. {selectedRegion !== 'Todas' ? `(Viendo solo ${selectedRegion})` : ''}
              </div>
            ) : (
              displayedPosts.map(post => (
                <div key={post._id} className={styles.topicRow} onClick={() => navigate(`/forum/post/${post._id}`)}>
                  <div className={styles.avatarContainer}>
                    <UserAvatar user={post.author} size="48px" fontSize="1.2rem" />
                  </div>

                  <div className={styles.topicContent}>
                    <div className={styles.topicTitle}>
                      {post.isPinned && <span className={styles.pinnedBadge}>Fijado</span>}
                      {post.title}
                    </div>
                    
                    <p className={styles.topicExcerpt}>
                      {post.content}
                    </p>

                    <div className={styles.topicMeta}>
                      Por <strong>{post.author?.name}</strong> • {formatRelativeTime(post.createdAt)}
                      {/* Mostrar región si no es nacional */}
                      {post.region && post.region !== 'Nacional' && (
                          <span style={{marginLeft:'10px', fontSize:'0.8rem', background:'var(--bg-body)', padding:'2px 6px', borderRadius:'4px'}}>
                             📍 {post.region}
                          </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.topicStats}>
                    <div className={styles.statItem}>
                      {/* CAMBIO: Mostramos Score en lugar de likes array length */}
                      <span className={styles.statValue} style={{color: post.score > 0 ? '#e67e22' : 'inherit'}}>
                        {post.score || 0}
                      </span>
                      <span className={styles.statLabel}>Puntos</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{post.comments?.length || 0}</span>
                      <span className={styles.statLabel}>Respuestas</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR DERECHO */}
        <aside className={styles.sidebar}>
          
          {/* 4. BOTÓN CREAR (Lógica Condicional) */}
          <div className={styles.widget}>
            {!user ? (
              <Link to="/login" className={styles.createBtn} style={{background:'transparent', border:'2px solid var(--accent)', color:'var(--text-main)', justifyContent:'center'}}>
                Ingresar para Publicar
              </Link>
            ) : canPostInCategory() ? (
              // ✅ Si tiene permiso, mostramos el botón
              <Link 
                to="/forum/create" 
                state={{ preSelectedCategory: categoryId }} 
                className={styles.createBtn}
              >
                <span>✏️</span> Publicar en {currentCategory ? currentCategory.name : 'este foro'}
              </Link>
            ) : (
              // ⛔ Si NO tiene permiso, mostramos el candado
              <div style={{
                  padding: '15px', 
                  background: 'rgba(0,0,0,0.05)', 
                  borderRadius: '6px', 
                  fontSize: '0.9rem', 
                  textAlign: 'center', 
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border)'
              }}>
                 🔒 Solo usuarios tipo <strong>{currentCategory?.group?.toUpperCase()}</strong> pueden iniciar temas aquí.
                 <br/><small>(Pero puedes comentar en los existentes)</small>
              </div>
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

          {/* Búsqueda */}
          <div className={styles.widget}>
             <h4 className={styles.widgetTitle}>Buscar</h4>
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