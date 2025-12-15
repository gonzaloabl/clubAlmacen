import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { categoryAPI } from '../../services/api';
import { UserAvatar } from '../common/UserAvatar';
import styles from './ForumHome.module.css';

export function ForumHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await categoryAPI.getAll();
        setCategories(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
              {/* 1. ZONA LOCATARIOS */}
              <GroupSection 
                title="Espacio Locatarios" 
                icon="🏪" 
                groupName="locatarios" 
                color="#3498db" // Azul
              />

              {/* 2. ZONA PROVEEDORES */}
              <GroupSection 
                title="Espacio Proveedores" 
                icon="🚚" 
                groupName="proveedores" 
                color="#2ecc71" // Verde
              />

              {/* 3. ZONA COMUNIDAD */}
              <GroupSection 
                title="Plaza Pública" 
                icon="🌳" 
                groupName="comunidad" 
                color="#f1c40f" // Amarillo
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
                   <span className={styles.statNumber}>0</span>
                   <span className={styles.statLabel}>Karma</span>
                </div>
                <div className={styles.statItem}>
                   <span className={styles.statNumber}>0</span>
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
        </aside>
      </div>
    </div>
  );
}