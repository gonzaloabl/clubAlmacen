import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProfileSettings } from './ProfileSettings';
import { Link } from 'react-router-dom';

export function LocatarioDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const sidebarItems = [
    { label: 'Mi Resumen', icon: '🏠', onClick: () => setActiveTab('overview'), isActive: activeTab === 'overview' },
    { label: 'Mi Perfil', icon: '⚙️', onClick: () => setActiveTab('profile'), isActive: activeTab === 'profile' },
    // Enlaces externos directos
    { label: 'Ir al Foro', icon: '💬', path: '/forum' },
    { label: 'Buscar Proveedores', icon: '🚚', path: '/directorio' },
  ];

  return (
    <DashboardLayout 
      title="Panel de Locatario"
      subtitle={`Bienvenido, ${user?.name}.`}
      sidebarItems={sidebarItems}
    >
      
      {/* --- VISTA GENERAL (LIMPIA) --- */}
      {activeTab === 'overview' && (
        <div>
          <h2 style={{color: 'var(--text-main)'}}>Bienvenido a tu Panel</h2>
          
          <div style={styles.noticeBox}>
             <strong>👋 ¡Hola!</strong> Recuerda mantener tu <strong style={{textDecoration:'underline', cursor:'pointer'}} onClick={()=>setActiveTab('profile')}>Perfil de Negocio</strong> actualizado para que otros te encuentren.
          </div>

          <h3 style={{marginTop:'30px', color:'var(--text-main)'}}>Accesos Rápidos</h3>
          <div style={styles.shortcutsGrid}>
             <Link to="/directorio" style={styles.shortcutCard}>
                <span style={{fontSize:'2rem'}}>🚚</span>
                <h4>Buscar Proveedores</h4>
                <p>Encuentra abastecimiento en tu zona</p>
             </Link>
             <Link to="/forum" style={styles.shortcutCard}>
                <span style={{fontSize:'2rem'}}>💬</span>
                <h4>Foro Comunitario</h4>
                <p>Participa en discusiones</p>
             </Link>
             <Link to="/noticias" style={styles.shortcutCard}>
                <span style={{fontSize:'2rem'}}>📰</span>
                <h4>Noticias</h4>
                <p>Actualidad del rubro</p>
             </Link>
          </div>
        </div>
      )}

      {/* --- MI PERFIL --- */}
      {activeTab === 'profile' && (
        <ProfileSettings />
      )}

    </DashboardLayout>
  );
}

const styles = {
  noticeBox: { padding: '20px', background: 'rgba(52, 152, 219, 0.1)', borderLeft: '4px solid var(--accent)', color: 'var(--text-main)', borderRadius: '8px', lineHeight: '1.5' },
  shortcutsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '15px' },
  shortcutCard: { background: 'var(--bg-card)', padding: '25px', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center', textDecoration: 'none', color: 'var(--text-main)', transition: 'transform 0.2s, box-shadow 0.2s' },
};