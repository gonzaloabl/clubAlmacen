// frontend/src/components/common/NavBar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole'; // 🆕 Importar el hook de roles

export function NavBar() {
  const { user, logout } = useAuth();
  const { currentRole } = useRole(); // 🆕 Obtener el rol actual

  const handleLogout = () => {
    logout();
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <Link to="/" style={styles.logoLink}>Club Almacén</Link>
      </div>
      
      <div style={styles.menu}>
        {/* Enlaces públicos */}
        <Link to="/" style={styles.menuItem}>Inicio</Link>
        <Link to="/noticias" style={styles.menuItem}>Noticias</Link>
        
        {/* Enlaces protegidos */}
        {user && (
          <Link to="/forum" style={styles.menuItem}>Foro</Link>
        )}
        
        {/* 🆕 MENÚ DE USUARIO */}
        {user ? (
          <div style={styles.userMenu}>
            {/* 🆕 ENLACE AL DASHBOARD DESDE EL PERFIL */}
            <Link to="/dashboard" style={styles.profileLink}>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.name}</span>
                <span style={styles.userRole}>({currentRole})</span>
              </div>
            </Link>
            
            <button onClick={handleLogout} style={styles.logoutButton}>
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <Link to="/login" style={styles.loginButton}>
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
}

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
    background: '#333',
    color: 'white',
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold'
  },
  logoLink: {
    color: 'white',
    textDecoration: 'none'
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '25px'
  },
  menuItem: {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    transition: 'background 0.3s ease'
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  profileLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 15px',
    background: '#8d8d8d',
    borderRadius: '20px',
    transition: 'background 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  userName: {
    fontWeight: 'bold',
    fontSize: '14px'
  },
  userRole: {
    fontSize: '11px',
    opacity: '0.8',
    fontStyle: 'italic'
  },
  logoutButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background 0.3s ease'
  },
  loginButton: {
    background: '#8d8d8d',
    color: 'white',
    padding: '8px 15px',
    borderRadius: '5px',
    textDecoration: 'none',
    transition: 'background 0.3s ease'
  }
};