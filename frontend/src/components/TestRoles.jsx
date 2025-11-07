import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function TestRoles() {
  const [testResult, setTestResult] = useState('');
  const { user, login, register } = useAuth();

  const testBackendRoutes = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Probar ruta de perfil (debería funcionar para todos)
      const profileResponse = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const profileData = await profileResponse.json();
      
      // Probar ruta de admin (solo debería funcionar para admins)
      const adminResponse = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      let adminData;
      if (adminResponse.ok) {
        adminData = await adminResponse.json();
      }

      setTestResult(`
✅ PERFIL: ${profileResponse.status} - ${profileResponse.ok ? 'ÉXITO' : 'ERROR'}
${profileResponse.ok ? `Rol: ${profileData.role}, Nombre: ${profileData.name}` : ''}

👑 ADMIN: ${adminResponse.status} - ${adminResponse.ok ? 'ÉXITO' : 'ERROR'}
${adminResponse.ok ? `Mensaje: ${adminData.message}` : 'Esperado - No eres admin'}
      `);

    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <h3>🔐 Primero inicia sesión para probar los roles</h3>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3>🧪 Prueba de Roles y Permisos</h3>
      
      <div style={styles.userInfo}>
        <p><strong>Usuario actual:</strong> {user.name}</p>
        <p><strong>Rol:</strong> {user.role}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <button onClick={testBackendRoutes} style={styles.testButton}>
        Probar Rutas del Backend
      </button>

      {testResult && (
        <div style={styles.result}>
          <h4>Resultados:</h4>
          <pre>{testResult}</pre>
        </div>
      )}

      <div style={styles.explanation}>
        <h4>¿Qué debería pasar?</h4>
        <ul>
          <li>✅ <strong>Locatario/Proveedor:</strong> Solo puede acceder a /api/users/me</li>
          <li>✅ <strong>Admin:</strong> Puede acceder a /api/users/me Y /api/admin/dashboard</li>
          <li>❌ <strong>No-admin en ruta admin:</strong> Recibe error 403</li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    border: '2px solid #ddd',
    borderRadius: '10px',
    margin: '20px',
    background: '#f9f9f9'
  },
  userInfo: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px'
  },
  testButton: {
    background: '#007bff',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  result: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px',
    border: '1px solid #ccc'
  },
  explanation: {
    background: '#e7f3ff',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px'
  }
};