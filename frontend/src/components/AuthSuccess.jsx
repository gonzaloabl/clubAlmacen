import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');

    if (token) {
      // Guardar token y cargar usuario
      localStorage.setItem('token', token);
      
      loadUser().then(() => {
        // Redirigir después de 2 segundos para mostrar mensaje de éxito
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }).catch(error => {
        console.error('Error loading user:', error);
        navigate('/login?error=auth_failed');
      });
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate, loadUser]);

  const userName = decodeURIComponent(searchParams.get('user') || '');

  return (
    <div style={styles.container}>
      <div style={styles.successCard}>
        <div style={styles.icon}>✅</div>
        <h2 style={styles.title}>¡Autenticación Exitosa!</h2>
        <p style={styles.message}>
          {userName ? `Bienvenido, ${userName}!` : '¡Bienvenido!'}
        </p>
        <p style={styles.redirecting}>
          Redirigiendo a la página principal...
        </p>
        <div style={styles.spinner}>⏳</div>
      </div>
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
  successCard: {
    background: 'white',
    padding: '40px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    maxWidth: '400px',
    width: '90%'
  },
  icon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  title: {
    color: '#333',
    marginBottom: '15px',
    fontSize: '28px'
  },
  message: {
    color: '#666',
    fontSize: '18px',
    marginBottom: '10px'
  },
  redirecting: {
    color: '#888',
    fontSize: '14px',
    marginBottom: '20px'
  },
  spinner: {
    fontSize: '2rem',
    animation: 'spin 1s linear infinite'
  }
};