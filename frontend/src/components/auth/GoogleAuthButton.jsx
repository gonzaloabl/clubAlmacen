import { useAuth } from "../../hooks/useAuth";

export function GoogleAuthButton({ type = "login" }) {
  const { loading } = useAuth();

  const handleGoogleAuth = () => {
    // Redirigir al backend para iniciar el flujo OAuth
    window.location.href = '/api/auth/google';
  };

  return (
    <button 
      type="button"
      onClick={handleGoogleAuth}
      disabled={loading}
      style={{
        width: '100%',
        padding: '12px',
        background: 'white',
        color: '#333',
        border: '2px solid #ddd',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '15px',
        transition: 'all 0.3s ease',
        opacity: loading ? 0.6 : 1
      }}
      onMouseOver={(e) => !loading && (e.target.style.background = '#f8f9fa')}
      onMouseOut={(e) => !loading && (e.target.style.background = 'white')}
    >
      <img 
        src="https://developers.google.com/identity/images/g-logo.png" 
        alt="Google" 
        style={{ width: '20px', height: '20px' }}
      />
      {loading ? '⏳ Cargando...' : (type === 'login' ? 'Continuar con Google' : 'Registrarse con Google')}
    </button>
  );
}