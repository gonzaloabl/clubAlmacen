import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ProfileSettings } from './ProfileSettings';
import { KarmaWidget } from '../common/KarmaWidget';
import { ReportList } from '../admin/ReportList';
import { UserManagement } from '../admin/UserManagement';
import { AdminManager } from '../admin/AdminManager';
// 🆕 1. IMPORTANTE: Importamos el componente nuevo
import { TechnicalDashboard } from '../admin/TechnicalDashboard'; 
import styles from './AdminDashboard.module.css';

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('overview');

  // 🆕 2. LÓGICA DE PERMISOS
  // Definimos quién tiene derecho a ver las herramientas técnicas.
  // Según el PDF es "admin técnico", pero agregamos al "superadmin" para que tú también puedas verlo.
  const showTechnicalPanel = user?.adminRole === 'superadmin' || user?.adminRole === 'technical';

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className={styles.dashboardHome}>
            <h2 className={styles.pageTitle}>Panel de Control ({user?.adminRole || 'General'})</h2>
            
            <KarmaWidget user={user} />

            <div className={styles.adminGrid}>
              <div className={styles.adminCard}>
                 <h3>🚨 Reportes</h3>
                 <p>Contenido marcado por la comunidad.</p>
                 <button onClick={() => setActiveView('reports')}>Ver Pendientes</button>
              </div>
              <div className={styles.adminCard}>
                 <h3>👥 Usuarios</h3>
                 <p>Gestión de locatarios y proveedores.</p>
                 <button onClick={() => setActiveView('users')}>Gestionar</button>
              </div>
              <div className={styles.adminCard}>
                 <h3>📢 Comunicados</h3>
                 <p>Publicar noticias oficiales.</p>
                 <button onClick={() => alert('Próximamente: Blog')}>Crear Noticia</button>
              </div>

              {/* 🆕 3. TARJETA DE ACCESO RÁPIDO (Solo si tiene permiso) */}
              {showTechnicalPanel && (
                <div className={styles.adminCard} style={{borderTop: '4px solid #f39c12'}}>
                    <h3>🛠️ Soporte Técnico</h3>
                    <p>Mantenimiento y estado del sistema.</p>
                    <button onClick={() => setActiveView('technical')}>Abrir Panel</button>
                </div>
              )}

              {user?.adminRole === 'superadmin' && (
                <div className={styles.adminCard} style={{borderTop: '4px solid #8e44ad'}}>
                    <h3>👮 Staff</h3>
                    <p>Crear y administrar admins.</p>
                    <button onClick={() => setActiveView('admins')}>Gestionar Equipo</button>
                </div>
              )}

            </div>
          </div>
        );

      case 'reports':
        return <ReportList />;
      
      case 'users':
        return (
            <div style={{padding:'20px'}}>
                <UserManagement />
            </div>
        );

      // 🆕 4. EL CASO DEL SWITCH PARA RENDERIZAR EL COMPONENTE
      case 'technical':
        return <TechnicalDashboard />;

      case 'profile':
        return <ProfileSettings />;

      case 'admins':
        // Filtro de seguridad extra por si acaso
        if (user?.adminRole !== 'superadmin') return <div>Acceso denegado</div>;
        return <AdminManager />;

      default:
        return <div>Vista no encontrada</div>;

    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.adminHeader}>
          🛡️ Admin Panel
        </div>
        
        <div className={styles.userInfo} style={{marginBottom:'20px'}}>
           <div className={styles.avatarPlaceholder} style={{backgroundColor: '#e74c3c', width:'40px', height:'40px', fontSize:'1rem'}}>
              {user?.name?.charAt(0)}
           </div>
           <p className={styles.userName} style={{color:'white'}}>{user?.name}</p>
        </div>

        <nav className={styles.nav}>
          <button onClick={() => setActiveView('overview')} className={activeView === 'overview' ? styles.active : ''}>📊 Dashboard</button>
          <button onClick={() => setActiveView('reports')} className={activeView === 'reports' ? styles.active : ''}>🚩 Reportes</button>
          <button onClick={() => setActiveView('users')} className={activeView === 'users' ? styles.active : ''}>👥 Usuarios</button>
          
          {/* 🆕 5. BOTÓN EN EL MENÚ LATERAL (Solo si tiene permiso) */}
          {showTechnicalPanel && (
            <button 
                onClick={() => setActiveView('technical')} 
                className={activeView === 'technical' ? styles.active : ''}
            >
                🛠️ Técnico
            </button>
          )}

          {user?.adminRole === 'superadmin' && (
            <button 
              onClick={() => setActiveView('admins')} 
              className={activeView === 'admins' ? styles.active : ''}
            >
              👮 Gestión de Admins
            </button>
          )}

          

          <div className={styles.divider}></div>
          <button onClick={() => setActiveView('profile')} className={activeView === 'profile' ? styles.active : ''}>⚙️ Mi Perfil</button>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
}