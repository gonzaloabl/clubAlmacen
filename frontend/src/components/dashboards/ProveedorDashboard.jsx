import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { productAPI } from '../../services/api'; // Importar API
import { ProfileSettings } from './ProfileSettings';
import { KarmaWidget } from '../common/KarmaWidget';
import { ProductManager } from '../products/ProductManager';
import styles from './ProveedorDashboard.module.css';

export function ProveedorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');
  
  // Estado para estadísticas
  const [stats, setStats] = useState({ productCount: 0 });

  // Cargar estadísticas reales
  useEffect(() => {
    const loadStats = async () => {
        try {
            const products = await productAPI.getMyProducts();
            setStats({ productCount: products.length });
        } catch (error) {
            console.error("Error cargando estadísticas", error);
        }
    };
    loadStats();
  }, [activeTab]); // Recargar al cambiar de tab por si agregan productos

  const renderContent = () => {
    switch (activeTab) {
      case 'resumen':
        return (
          <div className={styles.dashboardHome}>
            <KarmaWidget user={user} />

            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                {/* Muestra el contador real */}
                <span className={styles.statNumber}>{stats.productCount}</span>
                <span className={styles.statLabel}>Productos Activos</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>--</span>
                <span className={styles.statLabel}>Vistas de Perfil</span>
              </div>
            </div>

            <h4 className={styles.sectionTitle}>Gestión Rápida</h4>
            <div className={styles.quickActionsGrid}>
               <div className={styles.actionCard} onClick={() => setActiveTab('productos')}>
                <span className={styles.actionIcon}>📦</span>
                <span>Subir Producto</span>
              </div>
              <div className={styles.actionCard} onClick={() => navigate('/forum')}>
                <span className={styles.actionIcon}>📢</span>
                <span>Ir al Foro</span>
              </div>
            </div>

            <div className={styles.infoBox} style={{marginTop: '30px'}}>
              <h4>💡 Consejo</h4>
              <p>Los proveedores con fotos reales en sus productos reciben 3 veces más contactos.</p>
            </div>
          </div>
        );

      case 'productos':
        return (
          <div className={styles.dashboardHome}>
             {/* Componente de Gestión Completo */}
             <ProductManager /> 
          </div>
        );

      case 'perfil':
        return <ProfileSettings />;

      default:
        return <div>En construcción</div>;
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.userInfo}>
           <div className={styles.avatarPlaceholder} style={{backgroundColor: '#2ecc71'}}>
              {user?.name?.charAt(0)}
           </div>
           <p className={styles.userName}>{user?.name}</p>
           <span className={styles.userRole}>Proveedor</span>
        </div>
        
        <nav className={styles.nav}>
          <button onClick={() => setActiveTab('resumen')} className={activeTab === 'resumen' ? styles.active : ''}>📊 Resumen</button>
          <button onClick={() => setActiveTab('productos')} className={activeTab === 'productos' ? styles.active : ''}>📦 Mis Productos</button>
          <button onClick={() => setActiveTab('perfil')} className={activeTab === 'perfil' ? styles.active : ''}>⚙️ Perfil Empresa</button>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
}