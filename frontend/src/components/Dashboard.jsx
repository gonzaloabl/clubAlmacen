import { useRole } from '../hooks/useRole';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { ProveedorDashboard } from './dashboards/ProveedorDashboard';
import { LocatarioDashboard } from './dashboards/LocatarioDashboard';
import { GoogleCompleteRegistration } from './auth/GoogleCompleteRegistration';

export function Dashboard() {
  const { isAdmin, isProveedor, isLocatario, isPending, needsGoogleRegistration, currentRole } = useRole();

  if (needsGoogleRegistration) return <GoogleCompleteRegistration />;

  // 👇 AQUÍ ESTÁ LA CLAVE: Devolvemos el componente "pelado".
  // Él se encargará de poner su propio Sidebar y Layout.
  if (isAdmin) return <AdminDashboard />;
  if (isProveedor) return <ProveedorDashboard />;
  if (isLocatario) return <LocatarioDashboard />;
  
  // Pantallas de error o espera (simples y centradas)
  if (isPending) {
    return <div style={{padding: 50, textAlign: 'center'}}>⏳ Tu cuenta está en revisión.</div>;
  }

  return <div style={{padding: 50, textAlign: 'center'}}>⚠️ Rol no reconocido: {currentRole}</div>;
}