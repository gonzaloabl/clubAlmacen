// frontend/src/App.jsx
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Login } from './components/Login.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { useEffect } from 'react'

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
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // No es necesario navegar aquí, el efecto en App se encargará
  };

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
            onClick={handleLogout}
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
        <h2>¡Bienvenido a la aplicación!</h2>
        <p>El login funciona correctamente. Usuario: {user.email}</p>
        <p>Rol: {user.role}</p>
        
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: '#292929', 
          borderRadius: '10px' 
        }}>
          <h3>Estado de la autenticación:</h3>
          <ul>
            <li>✅ Registro funcionando</li>
            <li>✅ Login funcionando</li>
            <li>✅ Logout funcionando</li>
            <li>✅ Protección de rutas activa</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

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