// frontend/src/App.jsx
import './App.css'
import { NavBar } from './components/NavBar.jsx'
import { Banner } from './components/Banner.jsx'
import { Noticias } from './components/Noticias.jsx'
import { Login } from './components/Login.jsx'
import { useAuth } from './context/AuthContext.jsx'

export function App() {
  const { user, logout, loading } = useAuth();

  // Mostrar loader mientras verifica autenticación
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

  // Si no está autenticado, mostrar pantalla de login
  if (!user) {
    return <Login />;
  }

  // Si está autenticado, mostrar la aplicación completa
  return (
    <div className='App'>
      <header className='nb-contenedor'>
        <NavBar link='' name='Inicio'/>
        <NavBar link='' name='Productos'/>
        <NavBar link='' name='Contacto' />
        <div style={{ 
          marginLeft: 'auto', 
          marginRight: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <span style={{ color: 'white', fontSize: '16px' }}>
            👋 Hola, {user.name}
          </span>
          <button 
            onClick={logout}
            style={{
              padding: '8px 20px',
              background: '#8d8d8d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = '#575656'}
            onMouseOut={(e) => e.target.style.background = '#8d8d8d'}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      <section className='cd-contenedor'>
        <Banner 
          texto='El bazar' 
          subtitulo='Explora y mantente informado de las ultimas noticias de tu alrededor '
          fondo='https://cdn.connectamericas.com/sites/default/files/ThinkstockPhotos-508454788.jpg' 
        />
      </section>
      
      <section className='n-contenedor'>
        <Noticias />
        <Noticias />
        <Noticias />
        <Noticias />
      </section>
      
      <section className='n-contenedor2'>
        <Noticias />
        <Noticias />
        <Noticias />
        <Noticias />
      </section>
    </div>
  )
}

export default App