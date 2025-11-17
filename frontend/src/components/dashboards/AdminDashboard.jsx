import { useAdmin } from '../../hooks/useAdmin';
import { useEffect } from 'react';

export function AdminDashboard() {
  const { isAdmin, adminData, loading, refreshAdminData } = useAdmin();

  useEffect(() => {
    refreshAdminData();
  }, []);

  if (!isAdmin) {
    return (
      <div style={styles.error}>
        <h2>⛔ Acceso Denegado</h2>
        <p>No tienes permisos de administrador para ver este panel.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={styles.loading}>Cargando panel de administración...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>👑 Panel de Administración</h1>
        <button onClick={refreshAdminData} style={styles.refreshButton}>
          🔄 Actualizar
        </button>
      </div>

      {adminData && (
        <div style={styles.welcome}>
          <h2>Bienvenido, {adminData.user?.name}</h2>
          <p>{adminData.message}</p>
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>📊 Estadísticas</h3>
          <p>Usuarios totales: 150</p>
          <p>Ingresos mensuales: $15,000</p>
          <p>Espacios activos: 25</p>
        </div>

        <div style={styles.card}>
          <h3>👥 Gestión de Usuarios</h3>
          <button style={styles.actionButton}>Ver Todos los Usuarios</button>
          <button style={styles.actionButton}>Crear Nuevo Usuario</button>
          <button style={styles.actionButton}>Reportes de Actividad</button>
        </div>

        <div style={styles.card}>
          <h3>⚙️ Configuración</h3>
          <button style={styles.actionButton}>Configurar Sistema</button>
          <button style={styles.actionButton}>Gestionar Roles</button>
          <button style={styles.actionButton}>Backup de Datos</button>
        </div>
      </div>

      <div style={styles.recentActivity}>
        <h3>📈 Actividad Reciente</h3>
        <ul>
          <li>Usuario "Juan" se registró - Hace 2 horas</li>
          <li>Reserva en "Oficina A" - Hace 4 horas</li>
          <li>Pago procesado - $500 - Hace 6 horas</li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  welcome: {
    background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '30px',
    border: '2px solid #ffc107'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  card: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  },
  actionButton: {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '5px 0',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  refreshButton: {
    padding: '10px 15px',
    background: '#0d6efd',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  recentActivity: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  error: {
    textAlign: 'center',
    padding: '50px',
    color: '#dc3545'
  },
  loading: {
    textAlign: 'center',
    padding: '50px'
  }
};