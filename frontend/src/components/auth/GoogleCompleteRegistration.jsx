import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function GoogleCompleteRegistration() {
  const [role, setRole] = useState('locatario');
  const { user, completeGoogleRegistration, loading, error, loadUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessingToken, setIsProcessingToken] = useState(true);

  // 🆕 CAPTURAR TOKEN DE LA URL Y GUARDARLO
  useEffect(() => {
    const token = searchParams.get('token');
    console.log('🔍 Token en URL:', token);
    
    if (token) {
      console.log('✅ Guardando token en localStorage');
      localStorage.setItem('token', token);
      
      // 🆕 Cargar el usuario con el nuevo token
      loadUser().finally(() => {
        setIsProcessingToken(false);
      });
    } else {
      setIsProcessingToken(false);
      console.log('❌ No hay token en la URL');
    }
  }, [searchParams, loadUser]);

  // Redirigir si el usuario ya completó el registro
  useEffect(() => {
    if (user?.registrationComplete) {
      console.log('✅ Usuario ya completó registro, redirigiendo a dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log('🔄 Enviando datos de registro:', { role });
    const result = await completeGoogleRegistration(role);

    if (result.success) {
      console.log('✅ Registro completado, redirigiendo a dashboard');
      navigate('/dashboard');
    } else {
      console.log('❌ Error al completar registro:', result.error);
    }
  };

  // 🆕 MEJORAR ESTADOS DE CARGA
  if (isProcessingToken) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>🔄 Procesando autenticación...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>🔄 Cargando información del usuario...</div>
      </div>
    );
  }

  // 🆕 VERIFICAR SI EL USUARIO ES DE GOOGLE Y NO HA COMPLETADO REGISTRO
  if (user && (user.oauthProvider !== 'google' || user.registrationComplete)) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          {user.registrationComplete 
            ? '✅ Este usuario ya completó el registro' 
            : '❌ Esta ruta es solo para usuarios de Google que necesitan completar registro'
          }
          <button 
            onClick={() => navigate('/')} 
            style={{marginLeft: '10px', padding: '8px 16px'}}
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  // 🆕 MOSTRAR FORMULARIO SOLO SI ES USUARIO GOOGLE SIN REGISTRO COMPLETADO
  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          ❌ No se pudo cargar la información del usuario.
          <div style={{marginTop: '10px'}}>
            <button onClick={() => navigate('/login')} style={{marginRight: '10px', padding: '8px 16px'}}>
              Volver al login
            </button>
            <button onClick={() => window.location.reload()} style={{padding: '8px 16px'}}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🆕 RENDERIZAR FORMULARIO
  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.header}>
          <div style={styles.avatar}>
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" style={styles.avatarImage} />
            ) : (
              <div style={styles.avatarPlaceholder}>👤</div>
            )}
          </div>
          <h2 style={styles.title}>Completar Registro</h2>
          <p style={styles.subtitle}>
            Hola <strong>{user.name}</strong>! Solo falta un paso...
          </p>
          <p style={styles.description}>
            Elige el tipo de cuenta que mejor se adapte a tus necesidades
          </p>
        </div>

        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

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
          </select>

          <div style={styles.roleDescriptions}>
            {role === 'locatario' && (
              <div style={styles.roleDescription}>
                <h4>🏠 Perfecto para Locatarios</h4>
                <ul>
                  <li>Buscar y alquilar espacios</li>
                  <li>Gestionar tus reservas</li>
                  <li>Contactar con proveedores</li>
                  <li>Participar en el foro de la comunidad</li>
                </ul>
              </div>
            )}

            {role === 'proveedor' && (
              <div style={styles.roleDescription}>
                <h4>🚚 Ideal para Proveedores</h4>
                <ul>
                  <li>Ofrecer tus servicios y productos</li>
                  <li>Gestionar tu inventario</li>
                  <li>Recibir pedidos de locatarios</li>
                  <li>Promocionar tu negocio</li>
                </ul>
              </div>
            )}

          </div>
        </div>

        <button 
          type="submit" 
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }} 
          disabled={loading}
        >
          {loading ? '⏳ Completando Registro...' : '✅ Completar Registro'}
        </button>

        <div style={styles.note}>
          <p>
            <strong>Nota:</strong> Esta información define tus permisos en la plataforma. 
            Podrás cambiar algunas configuraciones más tarde en tu perfil.
          </p>
        </div>
      </form>
    </div>
  );
}

// Tus estilos permanecen igual
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'var(--bg-body)',
    padding: '20px'
  },
  form: {
    background: 'var(--bg-card)',
    padding: '40px',
    borderRadius: '15px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    border: '1px solid var(--border)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  avatar: {
    marginBottom: '15px',
    display: 'inline-block'
  },
  avatarImage: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '3px solid var(--border)'
  },
  avatarPlaceholder: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'var(--bg-body)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    margin: '0 auto',
    border: '3px solid var(--border)',
    color: 'var(--text-muted)'
  },
  title: {
    color: 'var(--text-main)',
    marginBottom: '10px',
    fontSize: '28px'
  },
  subtitle: {
    color: 'var(--text-muted)',
    marginBottom: '5px',
    fontSize: '16px'
  },
  description: {
    color: 'var(--text-muted)',
    fontSize: '14px'
  },
  roleSection: {
    marginBottom: '25px'
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: 'bold',
    color: 'var(--text-main)',
    fontSize: '16px'
  },
  select: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-body)',
    color: 'var(--text-main)',
    fontSize: '16px',
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-body)',
    color: 'var(--text-main)',
    fontSize: '16px',
    marginBottom: '5px'
  },
  noteText: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    fontStyle: 'italic'
  },
  roleDescriptions: {
    background: 'var(--bg-body)',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid var(--border)'
  },
  roleDescription: {
    color: 'var(--text-muted)'
  },
  button: {
    width: '100%',
    padding: '15px',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '15px',
    cursor: 'pointer'
  },
  note: {
    background: 'rgba(52, 152, 219, 0.1)',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid rgba(52, 152, 219, 0.3)',
    fontSize: '14px',
    color: 'var(--text-main)'
  },
  error: {
    background: 'rgba(231, 76, 60, 0.1)',
    color: 'var(--danger)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid var(--danger)',
    textAlign: 'center'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    color: 'var(--text-main)',
    fontSize: '18px'
  }
};