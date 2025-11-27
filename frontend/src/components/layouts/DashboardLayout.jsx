import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

export function DashboardLayout({ title, subtitle, sidebarItems, children }) {
  const { user } = useAuth();
  const { theme, toggleTheme, fontSize, setFontSize } = useTheme();
  const location = useLocation();

  return (
    <div style={styles.container}>
      {/* SIDEBAR IZQUIERDO */}
      <aside style={styles.sidebar}>
        {/* Perfil Miniatura */}
        <div style={styles.profileBox}>
          <div style={styles.avatar}>
            {/* 👇 AQUÍ ESTÁ EL CAMBIO: Si tiene avatar, muestra la foto */}
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Perfil" 
                style={{
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  borderRadius: '50%'
                }} 
              />
            ) : (
              // Si no tiene, muestra la inicial
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div style={styles.userInfo}>
            <h3 style={styles.userName}>{user?.name}</h3>
            <span style={styles.userRole}>
              {user?.adminRole ? `Admin ${user.adminRole}` : user?.role}
            </span>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav style={styles.nav}>
          {sidebarItems.map((item, index) => {
             // Si el item tiene onClick, es una acción (como logout o SPA), si tiene path es link
             const isLink = !!item.path;
             const isActive = isLink && location.pathname === item.path;
             
             if (isLink) {
                return (
                  <Link key={index} to={item.path} style={{...styles.navItem, ...(isActive ? styles.navItemActive : {})}}>
                    <span style={styles.icon}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
             } 
             
             // Si es botón (para SPA tabs)
             return (
               <button key={index} onClick={item.onClick} style={{...styles.navItem, ...(item.isActive ? styles.navItemActive : {})}}>
                  <span style={styles.icon}>{item.icon}</span>
                  {item.label}
               </button>
             );
          })}
        </nav>

        {/* Controles de Accesibilidad (En el sidebar) */}
        <div style={styles.accessibility}>
           <p style={styles.accTitle}>Apariencia</p>
           <button onClick={toggleTheme} style={styles.themeBtn}>
             {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
           </button>
           <div style={styles.fontControls}>
             <button onClick={() => setFontSize('normal')} style={{...styles.fontBtn, fontWeight: fontSize==='normal'?'bold':'normal'}}>A</button>
             <button onClick={() => setFontSize('large')} style={{...styles.fontBtn, fontSize:'1.1rem', fontWeight: fontSize==='large'?'bold':'normal'}}>A</button>
             <button onClick={() => setFontSize('xl')} style={{...styles.fontBtn, fontSize:'1.2rem', fontWeight: fontSize==='xl'?'bold':'normal'}}>A</button>
           </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.title}>{title}</h1>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </header>
        
        <div style={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}

// Estilos usando variables CSS
const styles = {
  container: { display: 'flex', minHeight: 'calc(100vh - 80px)', background: 'var(--bg-body)' },
  sidebar: {
    width: '280px',
    background: 'var(--bg-sidebar)',
    color: 'var(--text-inverse)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    flexShrink: 0
  },
  profileBox: { display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' },
  avatar: { width: '50px', height: '50px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'white' },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { margin: 0, fontSize: '1rem', color: 'white' },
  userRole: { fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' },
  
  nav: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 15px',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    border: 'none', background: 'transparent',
    borderRadius: '8px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
    width: '100%'
  },
  navItemActive: { background: 'var(--accent)', color: 'white', fontWeight: '500' },
  icon: { fontSize: '1.2rem' },

  accessibility: { marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  accTitle: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' },
  themeBtn: { width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', marginBottom: '10px' },
  fontControls: { display: 'flex', gap: '5px' },
  fontBtn: { flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px', padding: '5px' },

  main: { flex: 1, padding: '30px', overflowY: 'auto' },
  header: { marginBottom: '30px' },
  title: { margin: '0 0 5px 0', fontSize: '1.8rem', color: 'var(--text-main)' },
  subtitle: { margin: 0, color: 'var(--text-muted)' },
  content: { background: 'var(--bg-card)', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }
};