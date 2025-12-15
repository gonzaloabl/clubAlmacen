import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { GoogleAuthButton } from './GoogleAuthButton.jsx';
// Importamos Link si quieres poner un botón de "Volver al inicio"
import { Link } from 'react-router-dom'; 

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('locatario');
  const [adminCreationCode, setAdminCreationCode] = useState('');
  const location = useLocation();
  const [urlError, setUrlError] = useState('');
  const { login, register, error, loading, user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorType = params.get('error');

    if (errorType) {
      const messages = {
        'account_suspended': '⛔ Tu cuenta ha sido suspendida. Contacta a administración.',
        'suspended': '⛔ Sesión cerrada por suspensión de cuenta.',
        'google_auth_failed': '❌ Error al autenticar con Google.',
        'auth_failed': '❌ Falló la autenticación.',
        'google_not_configured': '⚠️ Google Auth no está configurado en el servidor.'
      };
      
      // Si el error existe en nuestro diccionario, lo mostramos. Si no, mensaje genérico.
      setUrlError(messages[errorType] || 'Ocurrió un error desconocido.');
      
      // Limpiamos la URL para que no se vea fea (Opcional, pero se ve pro)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  if (user) return null; // Si ya está logueado, no mostrar

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) {
      if (password.length < 8) return alert('La contraseña debe tener al menos 8 caracteres');
      await register(name, email, password, role, adminCreationCode);
    } else {
      await login(email, password);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Fondo decorativo opcional */}
      <div style={styles.backgroundShape}></div>

      <div style={styles.authCard}>
        <div style={styles.header}>
          <Link to="/" style={styles.logoLink}>🏪 Club Almacén</Link>
          <h2 style={styles.title}>
            {isRegistering ? 'Únete a la comunidad' : 'Bienvenido de vuelta'}
          </h2>
          <p style={styles.subtitle}>
            {isRegistering 
              ? 'Crea tu cuenta para conectar con proveedores y locatarios.' 
              : 'Ingresa tus credenciales para acceder a tu panel.'}
          </p>
        </div>

        {urlError && (
            <div style={{
            backgroundColor: '#fee2e2', 
            border: '1px solid #ef4444', 
            color: '#b91c1c', 
            padding: '10px', 
            borderRadius: '6px', 
            marginBottom: '15px',
            textAlign: 'center',
            fontSize: '0.9rem'
            }}>
            {urlError}
            </div>
        )}

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          
          {isRegistering && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Quiero registrarme como:</label>
                <div style={styles.roleSelector}>
                  <button 
                    type="button"
                    style={role === 'locatario' ? styles.roleBtnActive : styles.roleBtn}
                    onClick={() => setRole('locatario')}
                  >
                    🏪 Locatario
                  </button>
                  <button 
                    type="button"
                    style={role === 'proveedor' ? styles.roleBtnActive : styles.roleBtn}
                    onClick={() => setRole('proveedor')}
                  >
                    🚚 Proveedor
                  </button>
                </div>
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Procesando...' : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>
        </form>

        <div style={styles.divider}>
          <span>o continúa con</span>
        </div>

        <div style={styles.googleWrapper}>
           <GoogleAuthButton type={isRegistering ? 'register' : 'login'} />
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(null); }} 
              style={styles.toggleBtn}
            >
              {isRegistering ? 'Inicia Sesión' : 'Regístrate gratis'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-body)', // Usa el tema
    position: 'relative',
    overflow: 'hidden',
    padding: '20px'
  },
  backgroundShape: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: '50%',
    height: '50%',
    background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, rgba(0,0,0,0) 70%)',
    zIndex: 0
  },
  authCard: {
    width: '100%',
    maxWidth: '450px',
    background: 'var(--bg-card)', // Usa el tema
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    border: '1px solid var(--border)',
    zIndex: 1,
    position: 'relative'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  logoLink: {
    textDecoration: 'none',
    color: 'var(--accent)',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    display: 'block',
    marginBottom: '15px'
  },
  title: {
    margin: '0 0 10px 0',
    color: 'var(--text-main)',
    fontSize: '1.8rem'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-main)'
  },
  input: {
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-body)',
    color: 'var(--text-main)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  roleSelector: {
    display: 'flex',
    gap: '10px'
  },
  roleBtn: {
    flex: 1,
    padding: '10px',
    border: '1px solid var(--border)',
    background: 'var(--bg-body)',
    color: 'var(--text-muted)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  roleBtnActive: {
    flex: 1,
    padding: '10px',
    border: '1px solid var(--accent)',
    background: 'rgba(79, 70, 229, 0.1)',
    color: 'var(--accent)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  submitBtn: {
    padding: '14px',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.1s',
    marginTop: '10px'
  },
  errorAlert: {
    background: 'rgba(231, 76, 60, 0.1)',
    color: '#e74c3c',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    textAlign: 'center',
    marginBottom: '20px'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '25px 0',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    justifyContent: 'center'
  },
  googleWrapper: {
    marginBottom: '25px'
  },
  footer: {
    textAlign: 'center',
    borderTop: '1px solid var(--border)',
    paddingTop: '20px'
  },
  footerText: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem'
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--accent)',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginLeft: '5px',
    fontSize: '0.95rem'
  }
};