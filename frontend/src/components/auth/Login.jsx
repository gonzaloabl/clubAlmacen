import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { GoogleAuthButton } from './GoogleAuthButton.jsx';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('locatario');
  const [adminCreationCode, setAdminCreationCode] = useState('');
  const { login, register, error, loading, user } = useAuth();

  // Si ya está autenticado, no mostrar el login
  if (user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isRegistering) {
      // Validación básica frontend
      if (password.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      
      if (role === 'admin' && !adminCreationCode) {
        alert('Para registrarse como administrador, debe proporcionar el código correspondiente.');
        return;
      }

      const result = await register(name, email, password, role, adminCreationCode);
      if (result?.success) {
        console.log('¡Registro exitoso!');
        resetForm();
      }
    } else {
      const result = await login(email, password);
      if (result?.success) {
        console.log('¡Inicio de sesión exitoso!');
      }
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('locatario');
    setAdminCreationCode('');
  };

  const handleToggle = () => {
    resetForm();
    setIsRegistering(!isRegistering);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>
          {isRegistering ? '📝 Registro' : '🔐 Iniciar Sesión'}
        </h2>
        
        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}
        
        {isRegistering && (
          <>
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
              disabled={loading}
            />
            
            <div style={styles.roleSection}>
              <label style={styles.label}>Tipo de cuenta:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={styles.select}
                disabled={loading}
              >
                <option value="locatario">🏠 Locatario</option>
                <option value="proveedor">🚚 Proveedor</option>
                <option value="admin">👑 Administrador</option>
              </select>
              
              {role === 'admin' && (
                <div style={styles.adminNote}>
                  <input
                    type="password"
                    placeholder="Código de administrador"
                    value={adminCreationCode}
                    onChange={(e) => setAdminCreationCode(e.target.value)}
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                  <small style={styles.noteText}>
                    Solo para usuarios autorizados
                  </small>
                </div>
              )}
              
              {role === 'locatario' && (
                <small style={styles.noteText}>
                  Para alquilar espacios y servicios
                </small>
              )}
              
              {role === 'proveedor' && (
                <small style={styles.noteText}>
                  Para ofrecer servicios y productos
                </small>
              )}
            </div>
          </>
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
          disabled={loading}
        />
        
        <input
          type="password"
          placeholder={
            isRegistering 
              ? "Contraseña segura (mín. 8 caracteres)" 
              : "Contraseña"
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
          disabled={loading}
        />
        
        <button 
          type="submit" 
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }} 
          disabled={loading}
        >
          {loading ? '⏳ Procesando...' : isRegistering ? '✅ Registrarse' : '🚀 Iniciar Sesión'}
        </button>
        
        <div style={styles.divider}>
          <span style={styles.dividerText}>o</span>
        </div>

        <GoogleAuthButton type={isRegistering ? 'register' : 'login'} />
        
        <button
          type="button"
          onClick={handleToggle}
          style={styles.toggleButton}
          disabled={loading}
        >
          {isRegistering 
            ? '¿Ya tienes cuenta? Inicia sesión' 
            : '¿No tienes cuenta? Regístrate'}
        </button>
      </form>
    </div>
  );
}

// Mantén tus estilos actuales
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #292929 0%, #1a1a1a 100%)',
  },
  form: {
    background: 'white',
    padding: '40px',
    borderRadius: '15px',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px',
    fontSize: '28px',
  },
  input: {
    padding: '14px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    outline: 'none',
  },
  select: {
    padding: '14px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    fontSize: '16px',
    backgroundColor: 'white',
    width: '100%',
    cursor: 'pointer'
  },
  button: {
    padding: '14px',
    background: '#8d8d8d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'background 0.3s',
  },
  toggleButton: {
    background: 'transparent',
    border: 'none',
    color: '#8d8d8d',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '10px',
    fontSize: '14px',
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    border: '1px solid #ef5350',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
  },
  dividerText: {
    padding: '0 15px',
    color: '#888',
    fontSize: '14px',
  },
  roleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px'
  },
  adminNote: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  noteText: {
    color: '#666',
    fontSize: '12px',
    fontStyle: 'italic'
  }
};