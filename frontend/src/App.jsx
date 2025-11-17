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
import { Noticias } from './components/common/Noticias.jsx';
import { TestRoles } from './components/TestRoles';

// 🆕 IMPORTAR DASHBOARDS
import { Dashboard } from './components/Dashboard.jsx';
import { AdminDashboard } from './components/dashboards/AdminDashboard.jsx';
import { ProveedorDashboard } from './components/dashboards/ProveedorDashboard.jsx';
import { LocatarioDashboard } from './components/dashboards/LocatarioDashboard.jsx';
import { GoogleCompleteRegistration } from './components/auth/GoogleCompleteRegistration.jsx';

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

// 🆕 COMPONENTE PARA RUTAS ESPECÍFICAS POR ROL
function RoleProtectedRoute({ children, allowedRoles }) {
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
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        background: '#292929',
        color: 'white'
      }}>
        <h2>⛔ Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
        <p>Tu rol: <strong>{user.role}</strong> | Roles permitidos: <strong>{allowedRoles.join(', ')}</strong></p>
        <Link to="/" style={{ color: '#8d8d8d', marginTop: '20px' }}>
          Volver al Inicio
        </Link>
      </div>
    );
  }
  
  return children;
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
  
  // ❗ MODIFICADO: Redirigir a la Landing Page en lugar del Dashboard
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
      {/* 🆕 RUTAS PÚBLICAS SIN LAYOUT (Login no necesita NavBar) */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      {/* ✅ RUTA PRINCIPAL CON LANDING PAGE (SIEMPRE ACCESIBLE) */}
      <Route path="/" element={
        <MainLayout>
          <LandingPage />
        </MainLayout>
      } />

      {/* 🆕 DASHBOARD PRINCIPAL (accesible desde el perfil en NavBar) */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* 🆕 DASHBOARDS ESPECÍFICOS POR ROL (para futuro uso si lo necesitas) */}
      <Route path="/admin/dashboard" element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <MainLayout>
            <AdminDashboard />
          </MainLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/proveedor/dashboard" element={
        <RoleProtectedRoute allowedRoles={['proveedor']}>
          <MainLayout>
            <ProveedorDashboard />
          </MainLayout>
        </RoleProtectedRoute>
      } />

      <Route path="/locatario/dashboard" element={
        <RoleProtectedRoute allowedRoles={['locatario']}>
          <MainLayout>
            <LocatarioDashboard />
          </MainLayout>
        </RoleProtectedRoute>
      } />

      {/* ✅ RUTAS EXISTENTES DE TU APP */}
      <Route path="/noticias" element={
        <MainLayout>
          <Noticias />
        </MainLayout>
      } />
      
      <Route path="/forum" element={
          <MainLayout>
            <PostList />
          </MainLayout>
      } />
      
      <Route path="/forum/create" element={
        <ProtectedRoute>
          <MainLayout>
            <PostForm />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/forum/post/:id" element={
          <MainLayout>
            <PostDetail />
          </MainLayout>
      } />
      
      <Route path="/auth-success" element={
        <MainLayout>
          <AuthSuccess />
        </MainLayout>
      } />

      <Route path="/complete-google-registration" element={<GoogleCompleteRegistration />} />
      
      {/* 🆕 RUTA DE TEST (puedes quitarla en producción) */}
      <Route path="/test-roles" element={
        <ProtectedRoute>
          <MainLayout>
            <TestRoles />
          </MainLayout>
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

export default App;