import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function NavBar() {
  const { user, logout } = useAuth();

  console.log('🔍 NavBar renderizado. Usuario:', user);

  return (
    <nav style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      padding: '0',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          color: '#4f46e5',
          fontWeight: '700',
          fontSize: '1.5rem',
        }}>
          <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>🏪</span>
          Club Almacen
        </Link>

        {/* Menú de navegación */}
        <div style={{
          display: 'flex',
          gap: '30px',
          alignItems: 'center',
        }}>
          <Link to="/" style={{
            color: '#374151',
            textDecoration: 'none',
            fontWeight: '500',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
          }}>
            Inicio
          </Link>
          <Link to="/noticias" style={{
            color: '#374151',
            textDecoration: 'none',
            fontWeight: '500',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
          }}>
            Noticias
          </Link>
          <Link to="/forum" style={{
            color: '#374151',
            textDecoration: 'none',
            fontWeight: '500',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
          }}>
            Foro
          </Link>
        </div>

        {/* Sección de usuario */}
        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#374151', fontWeight: '500' }}>
                👋 Hola, {user.name}
              </span>
              <button 
                onClick={logout}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  color: '#ef4444',
                  border: '2px solid #ef4444',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/login" style={{
                padding: '10px 20px',
                color: '#4f46e5',
                textDecoration: 'none',
                border: '2px solid #4f46e5',
                borderRadius: '25px',
                fontWeight: '500',
              }}>
                Iniciar Sesión
              </Link>
              <Link to="/login?mode=register" style={{
                padding: '10px 20px',
                background: '#4f46e5',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '25px',
                fontWeight: '500',
              }}>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}