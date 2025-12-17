import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import styles from './DashboardLayout.module.css';

export function DashboardLayout({ title, subtitle, sidebarItems, children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className={styles.container}>
      
      {/* 🛑 AQUÍ ESTÁ EL FIX: Estilos forzados inyectados directamente */}
      <style>{`
        #sidebar-no-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        #sidebar-no-scroll {
          -ms-overflow-style: none !important;  /* IE y Edge */
          scrollbar-width: none !important;  /* Firefox */
        }
      `}</style>

      {/* Botón Móvil */}
      <button 
        className={styles.menuBtn} 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        ☰
      </button>

      {/* Overlay para móvil */}
      <div 
        className={`${styles.overlay} ${isMobileOpen ? styles.open : ''}`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      {/* SIDEBAR IZQUIERDO */}
      {/* 👇 Le asignamos el ID "sidebar-no-scroll" para que el estilo de arriba lo encuentre */}
      <aside 
        id="sidebar-no-scroll"
        className={`${styles.sidebar} ${isMobileOpen ? styles.open : ''}`}
      >
        
        {/* Perfil */}
        <div className={styles.profileBox}>
          <div className={styles.avatar}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Perfil" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}} />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user?.name}</p>
            <span className={styles.userRole}>
              {user?.adminRole ? `Admin ${user.adminRole}` : user?.role}
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav className={styles.nav}>
          {sidebarItems.map((item, index) => {
            if (item.type === 'divider') return <div key={index} className={styles.divider}></div>;
            
            const isActive = item.isActive;
            const itemClass = `${styles.navItem} ${isActive ? styles.navItemActive : ''}`;
            
            return (
              <button 
                key={index} 
                onClick={() => {
                   if(item.onClick) item.onClick();
                   setIsMobileOpen(false); // Cierra menú en móvil al clickear
                }}
                className={itemClass}
              >
                <span style={{marginRight:'12px', fontSize:'1.2rem', display:'flex'}}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
        
        <div className={styles.contentBox}>
          {children}
        </div>
      </main>

    </div>
  );
}