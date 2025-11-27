import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { AccessibilityControls } from './AccessibilityControls'; // 1. Importar controles

export function NavBar() {
  const { user, logout } = useAuth();
  const { currentRole } = useRole();
  
  // 🆕 Estado para el dropdown
  const [showDirectories, setShowDirectories] = useState(false);

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <Link to="/" style={styles.logoLink}>🏪 Club Almacén</Link>
      </div>
      
      <div style={styles.menu}>
        <Link to="/" style={styles.menuItem}>Inicio</Link>
        <Link to="/muro" style={styles.menuItem}>Muro Oficial</Link>
        <Link to="/noticias" style={styles.menuItem}>Noticias</Link>
        <Link to="/forum" style={styles.menuItem}>Foro</Link>
        
        {/* 🆕 MENÚ DESPLEGABLE (DROPDOWN) */}
        <div 
          style={styles.dropdownContainer}
          onMouseEnter={() => setShowDirectories(true)}
          onMouseLeave={() => setShowDirectories(false)}
        >
          <span style={{...styles.menuItem, cursor:'pointer'}}>
            Directorios ▾
          </span>
          
          {showDirectories && (
            <div style={styles.dropdownMenu}>
              <Link to="/directorio" style={styles.dropdownItem}>🚚 Proveedores</Link>
              <Link to="/comercios" style={styles.dropdownItem}>🏪 Locatarios</Link>
            </div>
          )}
        </div>

        <Link to="/herramientas" style={styles.menuItem}>Herramientas</Link>
        
        
        <AccessibilityControls />
        
        {/* ... (Menú de usuario igual que antes) ... */}
        {user ? (
          <div style={styles.userMenu}>
            <Link to="/dashboard" style={styles.profileLink}>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.name}</span>
                <span style={styles.userRole}>({currentRole})</span>
              </div>
            </Link>
            <button onClick={logout} style={styles.logoutButton}>Salir</button>
          </div>
        ) : (
          <Link to="/login" style={styles.loginButton}>Ingresar</Link>
        )}
      </div>
    </nav>
  );
}

// 3. ACTUALIZAR ESTILOS PARA USAR VARIABLES CSS (THEMING)
const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    background: 'var(--bg-sidebar)', // ✅ Usar variable del tema
    color: 'var(--text-inverse)',    // ✅ Usar variable del tema
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    borderBottom: '1px solid var(--border)'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold'
  },
  logoLink: {
    color: 'var(--text-inverse)', // ✅ Color dinámico
    textDecoration: 'none'
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px' // Reducido un poco para que quepa todo
  },
  menuItem: {
    color: 'var(--text-inverse)', // ✅ Color dinámico
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    transition: 'background 0.3s ease',
    fontSize: '0.95rem'
  },
  dropdownContainer:{position: 'relative'},
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    background: 'var(--bg-card)', // Usa color del tema
    border: '1px solid var(--border)',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    minWidth: '160px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1001
  },
  dropdownItem: {
    padding: '12px 15px',
    color: 'var(--text-main)', // Usa color del tema
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'background 0.2s',
    display: 'block'
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  profileLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '5px 15px',
    background: 'rgba(255,255,255,0.1)', // Transparente para adaptarse al tema
    borderRadius: '20px',
    transition: 'background 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  userName: {
    fontWeight: 'bold',
    fontSize: '13px'
  },
  userRole: {
    fontSize: '10px',
    opacity: '0.8',
    textTransform: 'uppercase'
  },
  logoutButton: {
    background: 'transparent',
    color: 'var(--danger)', // ✅ Rojo dinámico
    border: '1px solid var(--danger)',
    padding: '6px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  loginButton: {
    background: 'var(--accent)', // ✅ Azul dinámico
    color: 'white',
    padding: '8px 20px',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'transform 0.2s ease',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  }
};