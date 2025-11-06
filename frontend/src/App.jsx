// frontend/src/App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Login } from './components/auth/Login.jsx';
import { useAuth } from './hooks/useAuth.js';
import { PostList } from './components/forum/PostList.jsx';
import { PostForm } from './components/forum/PostForm.jsx';
import { AuthSuccess } from './components/auth/AuthSuccess.jsx';
import { PostDetail } from './components/forum/PostDetail';
import { LandingPage } from './components/pages/LandingPage.jsx';
import { NavBar } from './components/common/NavBar.jsx';
import {Noticias} from './components/common/Noticias.jsx';

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

// Layout principal con navbar
function MainLayout({ children }) {
  return (
    <div style={{ paddingTop: '80px' }}>  {/* ✅ Espacio para el navbar fijo */}
      <NavBar />  {/* ✅ Navbar en todas las páginas */}
      {children}
    </div>
  );
}

// Componente principal de la app
function AppContent() {
  const { loading } = useAuth();

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
      
      {/* ✅ TODAS estas rutas usarán MainLayout (con NavBar) */}
      <Route path="/" element={
        <MainLayout>
          <LandingPage />
        </MainLayout>
      } />

      <Route path="/noticias" element={
        <MainLayout>
          <Noticias />
        </MainLayout>
      } />
      
      <Route path="/forum" element={
        <ProtectedRoute>
          <MainLayout>
            <PostList />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/forum/create" element={
        <ProtectedRoute>
          <MainLayout>
            <PostForm />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/forum/post/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <PostDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/auth-success" element={
        <MainLayout>
          <AuthSuccess />
        </MainLayout>
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