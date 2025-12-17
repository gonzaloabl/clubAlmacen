// frontend/src/App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
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
import { ProvidersDirectory } from './components/pages/ProvidersDirectory.jsx';
import { ProviderProfile } from './components/pages/ProviderProfile.jsx';
import { UsefulLinks } from './components/pages/UsefulLinks';
import { LocatariosDirectory } from './components/pages/LocatariosDirectory.jsx';
import { BlogList } from './components/pages/BlogList.jsx';
import { Footer } from './components/common/Footer.jsx';
import { ForumHome } from './components/forum/ForumHome.jsx';
import { Marketplace } from './components/pages/Marketplace.jsx';


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
    <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      <Footer /> {/* 🆕 AQUÍ VA EL FOOTER */}
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
      {/* 👇 2. AGREGA ESTA RUTA NUEVA (Puede ir debajo de noticias) */}
      <Route path="/directorio" element={
        <MainLayout>
          <ProvidersDirectory />
        </MainLayout>
      } />
      <Route path="/mercado" element={
        <MainLayout>
          <Marketplace />
        </MainLayout>
      } />
      <Route path="/forum" element={
          <MainLayout>
            <ForumHome />
          </MainLayout>
      } />
      
      {/* 2. LISTA DE TEMAS (Filtrada por categoría específica al hacer clic en una tarjeta) */}
      <Route path="/forum/category/:categoryId" element={
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

      <Route path="/proveedor/:id" element={<MainLayout><ProviderProfile /></MainLayout>} />

      <Route path="/herramientas" element={<MainLayout><UsefulLinks /></MainLayout>} />

      <Route path="/comercios" element={<MainLayout><LocatariosDirectory /></MainLayout>} />

      <Route path="/muro" element={<MainLayout><BlogList /></MainLayout>} />
      
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
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // 1. PREGUNTAR AL SERVIDOR
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/system/public-status');
        const data = await res.json();
        setIsMaintenance(data.maintenance);
      } catch (error) {
        console.error("Error status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  // 2. VERIFICAR SI SOY ADMIN (Llave Maestra)
  const userStr = localStorage.getItem('user'); // Obtenemos el usuario guardado
  let isAdmin = false;
  if (userStr) {
    try {
        const userObj = JSON.parse(userStr);
        // Ajusta esto si tu objeto usuario tiene otra estructura
        if (userObj.role === 'admin') isAdmin = true;
    } catch (e) { isAdmin = false; }
  }

  // 3. PANTALLA DE CARGA (Rápida)
  if (checkingStatus) {
    return <div style={{height:'100vh', background:'#f0f2f5'}}></div>;
  }

  // 4. BLOQUEO POR MANTENIMIENTO
  // Si hay mantenimiento Y NO soy admin -> Muestro el cartel
  if (isMaintenance && !isAdmin) {
    return (
      <div style={{
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        background: '#f8f9fa', 
        color: '#333',
        textAlign: 'center',
        padding: '20px',
        fontFamily: 'sans-serif'
      }}>
        <div style={{fontSize: '4rem', marginBottom: '20px'}}>🚧</div>
        <h1 style={{color: '#2c3e50', marginBottom: '10px'}}>Sitio en Mantenimiento</h1>
        <p style={{fontSize: '1.2rem', color: '#7f8c8d'}}>
            Estamos realizando mejoras en Club Almacén.
        </p>
        <p style={{fontWeight: 'bold', color: '#e67e22'}}>
            Volveremos en unos minutos.
        </p>
        <button 
            onClick={() => window.location.reload()} 
            style={{marginTop: '30px', padding: '10px 20px', cursor: 'pointer', fontSize: '1rem'}}
        >
            🔄 Recargar
        </button>
        <div style={{marginTop: '50px'}}>
            <a href="/login" style={{color: '#ddd', textDecoration: 'none', fontSize: '0.8rem'}}>Admin</a>
        </div>
      </div>
    );
  }

  // 5. SI TODO ESTÁ BIEN, CARGAMOS LA APP
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <AppContent />
    </Router>
  );
}

export default App;