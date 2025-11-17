import { useRole } from '../hooks/useRole';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { ProveedorDashboard } from './dashboards/ProveedorDashboard';
import { LocatarioDashboard } from './dashboards/LocatarioDashboard';
import { GoogleCompleteRegistration } from './auth/GoogleCompleteRegistration';

export function Dashboard() {
  const { isAdmin, isProveedor, isLocatario, isPending, needsGoogleRegistration, currentRole } = useRole();

  // 🆕 Si el usuario necesita completar registro Google, mostrar ese componente
  if (needsGoogleRegistration) {
    return <GoogleCompleteRegistration />;
  }

  return (
    <div style={styles.container}>
      {/* Dashboard según el rol */}
      {isAdmin && <AdminDashboard />}
      {isProveedor && <ProveedorDashboard />}
      {isLocatario && <LocatarioDashboard />}
      
      {/* Mensaje si el rol está pendiente */}
      {isPending && (
        <div style={styles.pending}>
          <h2>⏳ Registro en Proceso</h2>
          <p>Tu registro está siendo procesado. Por favor completa el formulario de registro.</p>
          <p>Si no ves el formulario, recarga la página.</p>
        </div>
      )}
      
      {/* Mensaje si el rol no está reconocido */}
      {!isAdmin && !isProveedor && !isLocatario && !isPending && (
        <div style={styles.error}>
          <h2>⚠️ Rol no reconocido</h2>
          <p>Tu rol "{currentRole}" no tiene un dashboard asignado.</p>
          <p>Contacta al administrador del sistema.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    background: '#f8f9fa'
  },
  pending: {
    textAlign: 'center',
    padding: '50px',
    color: '#ff9800',
    maxWidth: '500px',
    margin: '0 auto'
  },
  error: {
    textAlign: 'center',
    padding: '50px',
    color: '#dc3545',
    maxWidth: '500px',
    margin: '0 auto'
  }
};