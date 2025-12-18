import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { categoryAPI, postAPI } from '../../services/api';
import { formatRelativeTime } from '../../utils/helpers';
import { UserAvatar } from '../common/UserAvatar';
import styles from './ForumHome.module.css';

export function ForumHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ karma: 0, postCount: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, postsData] = await Promise.all([
          categoryAPI.getAll(),
          postAPI.getAll({ limit: 5 })
        ]);
        setCategories(cats);
        setRecentActivity(postsData.posts || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 🔄 EFECTO: Actualizar stats del usuario en tiempo real (al montar)
  useEffect(() => {
    if (user) {
      // 1. Inicializar con lo que tenemos en el contexto (para que no parpadee)
      setUserStats({ karma: user.karma || 0, postCount: user.postCount || 0 });

      // 2. Buscar datos frescos al servidor (para ver cambios sin F5)
      const fetchFreshStats = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const res = await fetch('http://localhost:3000/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUserStats({ karma: data.karma, postCount: data.postCount });
          }
        } catch (e) { console.error("Error sync stats:", e); }
      };
      fetchFreshStats();
    }
  }, [user]);

  // Función auxiliar para filtrar por grupo
  const getGroup = (groupName) => categories.filter(c => c.group === groupName);

  // Componente interno para renderizar una sección
  const GroupSection = ({ title, icon, groupName, color }) => {
    const groupCats = getGroup(groupName);
    if (groupCats.length === 0) return null;

    return (
      <div className={styles.groupSection} style={{ borderTop: `4px solid ${color}` }}>
        <div className={styles.groupHeader}>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          <h3 className={styles.groupTitle}>{title}</h3>
        </div>
        <div className={styles.categoryList}>
          {groupCats.map(cat => (
            <Link key={cat._id} to={`/forum/category/${cat._id}`} className={styles.categoryCard}>
              <div className={styles.iconWrapper}>
                {cat.icon || '📁'}
              </div>
              <div className={styles.cardContent}>
                <h4 className={styles.catName}>{cat.name}</h4>
                <p className={styles.catDesc}>{cat.description}</p>
              </div>
              <div style={{color: 'var(--text-muted)'}}>➝</div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Foro de la Comunidad</h1>
        <p className={styles.heroSubtitle}>
          El espacio donde locatarios y proveedores conectan.
        </p>
      </div>

      <div className={styles.layout}>
        {/* COLUMNA PRINCIPAL */}
        <div className={styles.mainColumn}>
          {loading ? <p>Cargando foro...</p> : (
            <>
              {/* 1. ZONA COMUNIDAD (Ahora primero) */}
              <GroupSection 
                title="Plaza Pública" 
                icon="🌳" 
                groupName="comunidad" 
                color="#f1c40f" // Amarillo
              />

              {/* 2. ZONA LOCATARIOS */}
              <GroupSection 
                title="Espacio Locatarios" 
                icon="🏪" 
                groupName="locatarios" 
                color="#3498db" // Azul
              />

              {/* 3. ZONA PROVEEDORES */}
              <GroupSection 
                title="Espacio Proveedores" 
                icon="🚚" 
                groupName="proveedores" 
                color="#2ecc71" // Verde
              />
            </>
          )}
        </div>

        {/* SIDEBAR (Gamificación) */}
        <aside className={styles.sidebar}>
          {user ? (
            <div className={styles.profileCard}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}>
                <UserAvatar user={user} size="60px" fontSize="1.5rem" />
              </div>
              <h3>{user.name}</h3>
              <p style={{ color:'var(--text-muted)', margin:0 }}>{user.role}</p>
              
              <div className={styles.karmaRow}>
                <div className={styles.statItem}>
                   <span className={styles.statNumber}>{userStats.karma}</span>
                   <span className={styles.statLabel}>Karma</span>
                </div>
                <div className={styles.statItem}>
                   <span className={styles.statNumber}>{userStats.postCount}</span>
                   <span className={styles.statLabel}>Posts</span>
                </div>
              </div>

              <Link to="/forum/create" className={styles.createBtn}>
                ✏️ Nuevo Tema
              </Link>
            </div>
          ) : (
            <div className={styles.profileCard}>
              <p>Únete a la comunidad para participar.</p>
              <Link to="/login" className={styles.createBtn}>Iniciar Sesión</Link>
            </div>
          )}

          {/* WIDGET ACTIVIDAD RECIENTE */}
          <div style={{marginTop: '20px', background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
            <h4 style={{margin: '0 0 15px 0', fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px', color: 'var(--text-main)'}}>🔥 Actividad Reciente</h4>
            {recentActivity.length === 0 ? (
                <p style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>No hay actividad aún.</p>
            ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                    {recentActivity.slice(0, 5).map(post => (
                        <Link 
                            key={post._id} 
                            to={`/forum/post/${post._id}`}
                            style={{textDecoration:'none', color:'var(--text-main)', display:'block', transition: 'opacity 0.2s'}}
                        >
                            <div style={{fontWeight:'600', fontSize:'0.9rem', marginBottom:'4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{post.title}</div>
                            <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>
                                {formatRelativeTime(post.createdAt)} • {post.author?.name || 'Anónimo'}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}