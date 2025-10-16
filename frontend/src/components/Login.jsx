import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const { login, register, error, loading, user } = useAuth();

  // Si ya está autenticado, no mostrar el login
  if (user) {
    return null; // El efecto en App se encargará de redirigir
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isRegistering) {
      if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      const result = await register(name, email, password);
      if (result.success) {
        console.log('¡Registro exitoso!');
        // La redirección se maneja automáticamente en App.jsx
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        console.log('¡Inicio de sesión exitoso!');
        // La redirección se maneja automáticamente en App.jsx
      }
    }
  };

  const handleToggle = () => {
    // Limpiar los campos y el error al cambiar entre login y registro
    setEmail('');
    setPassword('');
    setName('');
    // No podemos acceder a setError directamente, pero el contexto ya maneja el error
    // El error se limpiará cuando se intente una nueva acción
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
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
            disabled={loading}
          />
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
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
          disabled={loading}
          minLength={6}
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
};