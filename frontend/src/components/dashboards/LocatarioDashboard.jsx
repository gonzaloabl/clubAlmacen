import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ProfileSettings } from './ProfileSettings';
import { KarmaWidget } from '../common/KarmaWidget'; // ✅ Widget Importado
import styles from './LocatarioDashboard.module.css';
import { useNavigate } from 'react-router-dom';
import { SupportPanel } from '../common/SupportPanel';

export function LocatarioDashboard() {
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inicio'); // Tabs: inicio, perfil, favoritos

  // 🔄 Refrescar datos del usuario (Karma) al montar
  useEffect(() => {
    if (loadUser) loadUser();
  }, []);

  // Renderizador de contenido según la Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <div className={styles.dashboardHome}>
            {/* 1. ✅ KARMA WIDGET (Solo aquí) */}
            <KarmaWidget user={user} />

            {/* 2. Sección de Bienvenida y Accesos */}
            <div className={styles.welcomeCard}>
              <h3>👋 ¡Bienvenido a tu espacio, {user?.name.split(' ')[0]}!</h3>
              <p>Desde aquí puedes gestionar tu cuenta y conectar con el barrio.</p>
            </div>

            {/* 3. Grid de Accesos Rápidos */}
            <h4 className={styles.sectionTitle}>Accesos Rápidos</h4>
            <div className={styles.quickActionsGrid}>
              <div className={styles.actionCard} onClick={() => navigate('/forum')}>
                <span className={styles.actionIcon}>💬</span>
                <span>Ir al Foro</span>
              </div>
              <div className={styles.actionCard} onClick={() => navigate('/mercado')}>
                <span className={styles.actionIcon}>🛒</span>
                <span>Mercado</span>
              </div>
              <div className={styles.actionCard} onClick={() => navigate('/directorio')}>
                <span className={styles.actionIcon}>🚚</span>
                <span>Buscar Proveedores</span>
              </div>
              <div className={styles.actionCard} onClick={() => navigate('/noticias')}>
                <span className={styles.actionIcon}>📰</span>
                <span>Ver Noticias</span>
              </div>
              <div className={styles.actionCard} onClick={() => navigate('/herramientas')}>
                <span className={styles.actionIcon}>🧰</span>
                <span>Herramientas</span>
              </div>
            </div>
          </div>
        );

      case 'perfil':
        return <ProfileSettings />;

      case 'soporte':
        return <SupportPanel />;

      default:
        return <div>Sección en construcción</div>;
    }
  };

  return (
    <div className={styles.container}>
      {/* SIDEBAR SIMPLE */}
      <aside className={styles.sidebar}>
        <div className={styles.userInfo}>
           <div className={styles.avatarPlaceholder}>{user?.name?.charAt(0)}</div>
           <p className={styles.userName}>{user?.name}</p>
           <span className={styles.userRole}>Locatario</span>
        </div>
        
        <nav className={styles.nav}>
          <button 
            className={activeTab === 'inicio' ? styles.active : ''} 
            onClick={() => setActiveTab('inicio')}
          >
            🏠 Resumen
          </button>
          <button 
            className={activeTab === 'soporte' ? styles.active : ''} 
            onClick={() => setActiveTab('soporte')}
          >
            🛟 Soporte
          </button>
          <button 
            className={activeTab === 'perfil' ? styles.active : ''} 
            onClick={() => setActiveTab('perfil')}
          >
            ⚙️ Mi Perfil
          </button>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
}