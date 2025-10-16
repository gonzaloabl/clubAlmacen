// frontend/src/App.jsx
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { Login } from './components/Login.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { useEffect } from 'react'
import { PostList } from './components/forum/PostList.jsx';
import { PostForm } from './components/forum/PostForm.jsx';

// Componente para las rutas protegidas
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#292929',
        color: 'white',
        fontSize: '24px'
      }}>
        ⏳ Cargando...
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

// Componente para redirigir si ya está autenticado
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#292929',
        color: 'white',
        fontSize: '24px'
      }}>
        ⏳ Cargando...
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/" replace />;
}

// Página principal
function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ 
      background: '#1a1a1a', 
      minHeight: '100vh', 
      color: 'white',
      padding: '20px'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        background: '#292929',
        borderRadius: '10px',
        marginBottom: '30px'
      }}>
        <h1>🏪 El Bazar</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>👋 Hola, {user.name}</span>
          <button 
            onClick={logout}
            style={{
              padding: '8px 20px',
              background: '#8d8d8d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      <main>
        <div style={{ 
          background: '#292929', 
          padding: '30px', 
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h2>¡Bienvenido a la aplicación!</h2>
          <p>Usuario: {user.email} | Rol: {user.role}</p>
        </div>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={cardStyle}>
            <h3>🏪 Foro Comunitario</h3>
            <p>Participa en discusiones, comparte ideas y conecta con la comunidad</p>
            <Link to="/forum" style={buttonStyle}>
              📚 Ver Foro
            </Link>
          </div>
          
          <div style={cardStyle}>
            <h3>📝 Crear Publicación</h3>
            <p>Comparte tus ideas, preguntas o noticias con la comunidad</p>
            <Link to="/forum/create" style={buttonStyle}>
              ✏️ Nueva Publicación
            </Link>
          </div>
          
          <div style={cardStyle}>
            <h3>⚙️ Otras Opciones</h3>
            <p>Próximamente más funcionalidades...</p>
            <button style={{...buttonStyle, background: '#555', cursor: 'not-allowed'}}>
              🔜 Próximamente
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const cardStyle = {
  background: '#292929',
  padding: '25px',
  borderRadius: '12px',
  textAlign: 'center',
  border: '1px solid #333',
};

const buttonStyle = {
  display: 'inline-block',
  padding: '10px 20px',
  background: '#8d8d8d',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '6px',
  marginTop: '15px',
  fontWeight: 'bold',
};

// Componente principal de la app con navegación automática
function AppContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Efecto para redirigir automáticamente cuando cambia el estado de autenticación
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Si hay usuario y estamos en login, redirigir a home
        if (window.location.pathname === '/login') {
          navigate('/', { replace: true });
        }
      } else {
        // Si no hay usuario y no estamos en login, redirigir a login
        if (window.location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#292929',
        color: 'white',
        fontSize: '24px'
      }}>
        ⏳ Cargando...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/forum" element={
        <ProtectedRoute>
          <PostList />
      </ProtectedRoute>
      } />
      <Route path="/forum/create" element={
        <ProtectedRoute>
          <PostForm />
        </ProtectedRoute>
      } />
      {/* Redirigir cualquier ruta no definida */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


export function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App