import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { DashboardLayout } from '../layouts/DashboardLayout';
import styles from './AdminDashboard.module.css';

// Componentes
import { StatsOverview } from '../admin/StatsOverview'; // Fila 1: Métricas
import { SystemStatus } from '../admin/SystemStatus';   // Fila 2: Servidor
import { ProfileSettings } from './ProfileSettings';
import { ReportList } from '../admin/ReportList';
import { UserManagement } from '../admin/UserManagement';
import { AdminManager } from '../admin/AdminManager';
import { TechnicalDashboard } from '../admin/TechnicalDashboard';

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('overview');

  const isSuperAdmin = user?.adminRole === 'superadmin';
  const isRegional = user?.adminRole === 'regional';
  const isTechnical = user?.adminRole === 'technical';

  // 1. MENU LATERAL LIMPIO (Sin botón técnico)
  // 1. MENU LATERAL DINÁMICO (Según Roles)
  const sidebarItems = [
    { 
      label: 'Resumen', 
      icon: '📊', 
      isActive: activeView === 'overview', 
      onClick: () => setActiveView('overview') 
    }
  ];

  // GESTIÓN DE COMUNIDAD (Todos los admins moderan)
  if (isSuperAdmin || isRegional || isTechnical) {
    sidebarItems.push(
      { 
        label: 'Usuarios', 
        icon: '👥', 
        isActive: activeView === 'users', 
        onClick: () => setActiveView('users') 
      },
      { 
        label: 'Reportes', 
        icon: '🚩', 
        isActive: activeView === 'reports', 
        onClick: () => setActiveView('reports') 
      }
    );
  }

  // SOPORTE TÉCNICO (Solo Técnico)
  if (isTechnical) {
    sidebarItems.push({ 
      label: 'Soporte', 
      icon: '🛠️', 
      isActive: activeView === 'technical', 
      onClick: () => setActiveView('technical') 
    });
  }

  // Solo SuperAdmin ve la gestión de Staff
  if (isSuperAdmin) {
    sidebarItems.push({ 
      label: 'Staff', 
      icon: '👮', 
      isActive: activeView === 'admins', 
      onClick: () => setActiveView('admins') 
    });
  }

  sidebarItems.push({ type: 'divider' });
  sidebarItems.push({ 
    label: 'Configuración', 
    icon: '⚙️', 
    isActive: activeView === 'profile', 
    onClick: () => setActiveView('profile') 
  });

  // 2. RENDERIZADO DE VISTAS
  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className={styles.overviewContainer}>
             {/* Header del Resumen */}
             <div style={{marginBottom: '20px'}}>
                <h2 className={styles.welcomeTitle}>👋 Hola, {user?.name}</h2>
                <p className={styles.welcomeSubtitle}>Estado del sistema y actividad reciente.</p>
             </div>

             {/* FILA 1: KPIs (Usuarios, Posts, Reportes) */}
             <StatsOverview />

             {/* FILA 2: Panel Técnico (Servidor, Emergencia) */}
             {(isSuperAdmin || isTechnical) && <SystemStatus />}
             
          </div>
        );
      case 'users': return <UserManagement />;
      case 'reports': return <ReportList />;
      case 'profile': return <ProfileSettings />;
      case 'technical': return <TechnicalDashboard />;
      case 'admins': return isSuperAdmin ? <AdminManager /> : <div>Acceso denegado</div>;
      default: return <div>Vista no encontrada</div>;
    }
  };

  const titles = {
    overview: 'Panel de Control',
    users: 'Gestión de Usuarios',
    reports: 'Moderación',
    admins: 'Equipo Administrativo',
    profile: 'Mi Perfil',
    technical: 'Soporte Técnico'
  };

  return (
    <DashboardLayout 
      title={titles[activeView]} 
      subtitle={`Rol: ${user?.adminRole || 'Administrador'}`}
      sidebarItems={sidebarItems}
    >
      {renderContent()}
    </DashboardLayout>
  );
}