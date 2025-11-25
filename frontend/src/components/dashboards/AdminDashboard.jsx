import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { postAPI } from '../../services/api'; // 1️⃣ Importar API de posts
import { DashboardLayout } from '../layouts/DashboardLayout';

export function AdminDashboard() {
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const { isSuperAdmin } = useRole();
  
  const [activeTab, setActiveTab] = useState('overview');

  // ESTADOS - GESTIÓN STAFF
  const [staffData, setStaffData] = useState({
    name: '', email: '', password: '', adminRole: 'regional', region: 'Valparaíso'
  });
  const [staffMessage, setStaffMessage] = useState('');

  // ESTADOS - MODERACIÓN
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // --- EFECTO: CARGAR REPORTES AL ENTRAR A LA PESTAÑA ---
  useEffect(() => {
    if (activeTab === 'moderation') {
      fetchReports();
    }
  }, [activeTab]);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const token = localStorage.getItem('token');
      // Usamos fetch directo porque es una ruta administrativa especial
      const response = await fetch('/api/posts/admin/reported', {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReportedPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando reportes:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  // --- ACCIÓN: BORRAR POST REPORTADO ---
  const handleDeletePost = async (id) => {
      if(!window.confirm('¿Confirmas eliminar esta publicación y resolver los reportes?')) return;
      try {
          await postAPI.delete(id);
          // Actualizar lista localmente
          setReportedPosts(prev => prev.filter(p => p._id !== id));
          alert('✅ Publicación eliminada.');
      } catch (err) {
          alert('❌ Error al borrar. Verifica tus permisos.');
      }
  };

  // --- ACCIÓN: CREAR STAFF ---
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(staffData)
      });
      const data = await response.json();
      if (response.ok) {
        setStaffMessage('✅ ' + data.message);
        setStaffData({ name: '', email: '', password: '', adminRole: 'regional', region: '' });
      } else {
        setStaffMessage('❌ ' + (data.message || 'Error'));
      }
    } catch (error) {
      setStaffMessage('❌ Error de conexión');
    }
  };

  if (!isAdmin) return null;

  const sidebarItems = [
    { label: 'Vista General', icon: '📊', onClick: () => setActiveTab('overview'), isActive: activeTab === 'overview' },
    // 2️⃣ NUEVA PESTAÑA MODERACIÓN (Visible para todos los admins)
    { label: 'Centro Moderación', icon: '🚩', onClick: () => setActiveTab('moderation'), isActive: activeTab === 'moderation' },
    
    ...(isSuperAdmin ? [{ 
      label: 'Gestión Staff', icon: '🛡️', onClick: () => setActiveTab('staff'), isActive: activeTab === 'staff' 
    }] : []),
    
    { label: 'Usuarios Globales', icon: '👥', onClick: () => setActiveTab('users'), isActive: activeTab === 'users' },
  ];

  return (
    <DashboardLayout 
      title="Panel de Administración" 
      subtitle={`Bienvenido, ${user?.name}. ${isSuperAdmin ? 'Superadmin' : `Admin ${user?.region || ''}`}`}
      sidebarItems={sidebarItems}
    >
      {/* --- VISTA GENERAL --- */}
      {activeTab === 'overview' && (
        <div>
          <h2 style={{color: 'var(--text-main)'}}>Estado del Sistema</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px'}}>
             <div style={styles.card}>
                <span style={{fontSize: '2rem'}}>👥</span>
                <h3>User Base</h3>
                <p>Gestión de Usuarios</p>
             </div>
             <div style={styles.card}>
                <span style={{fontSize: '2rem'}}>🚩</span>
                <h3>Moderación</h3>
                <p>Revisar Reportes</p>
             </div>
          </div>
        </div>
      )}

      {/* --- 3️⃣ PESTAÑA MODERACIÓN --- */}
      {activeTab === 'moderation' && (
        <div>
          <h2 style={{color: 'var(--text-main)'}}>Centro de Moderación</h2>
          <p style={{color: 'var(--text-muted)', marginBottom:'20px'}}>
            Publicaciones reportadas {isSuperAdmin ? 'en todo el sistema' : `en tu región (${user?.region})`}.
          </p>

          {loadingReports ? (
             <p>Cargando reportes...</p>
          ) : reportedPosts.length === 0 ? (
              <div style={styles.emptyBox}>
                  ✅ Todo limpio. No hay reportes pendientes.
              </div>
          ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                  {reportedPosts.map(post => (
                      <div key={post._id} style={styles.reportCard}>
                          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                              <strong style={{color:'var(--text-main)', fontSize:'1.1rem'}}>{post.title}</strong>
                              <span style={styles.badgeDanger}>
                                  {post.reportCount} Reportes
                              </span>
                          </div>
                          
                          <p style={{fontSize:'0.9rem', color:'var(--text-muted)', margin:'0 0 10px 0'}}>
                              <strong>Autor:</strong> {post.author?.name} | <strong>Región:</strong> {post.author?.region || 'Global'}
                          </p>
                          
                          {/* Lista de razones */}
                          <div style={styles.reportList}>
                              {post.reports.map((rep, i) => (
                                  <div key={i} style={{fontSize:'0.85rem', marginBottom:'5px'}}>
                                      ⚠️ <strong>{rep.reason}:</strong> {rep.description}
                                  </div>
                              ))}
                          </div>

                          <div style={{marginTop:'15px', display:'flex', gap:'10px'}}>
                              <button 
                                  onClick={() => handleDeletePost(post._id)}
                                  style={styles.btnDelete}
                              >
                                  🗑️ Eliminar Publicación
                              </button>
                              <button style={styles.btnSecondary}>
                                  👁️ Ver Contexto
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
        </div>
      )}

      {/* --- GESTIÓN STAFF --- */}
      {activeTab === 'staff' && isSuperAdmin && (
        <div>
          <h2 style={{color: 'var(--text-main)'}}>Gestión de Jerarquía</h2>
          <div style={styles.formCard}>
            <h3>👤 Nuevo Miembro del Staff</h3>
            {staffMessage && <div style={styles.alert}>{staffMessage}</div>}
            <form onSubmit={handleCreateStaff} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <input type="text" placeholder="Nombre" value={staffData.name} onChange={e => setStaffData({...staffData, name: e.target.value})} style={styles.input} required />
              <input type="email" placeholder="Email" value={staffData.email} onChange={e => setStaffData({...staffData, email: e.target.value})} style={styles.input} required />
              <input type="password" placeholder="Password" value={staffData.password} onChange={e => setStaffData({...staffData, password: e.target.value})} style={styles.input} required />
              <div style={{display: 'flex', gap: '10px'}}>
                <select style={styles.input} value={staffData.adminRole} onChange={e => setStaffData({...staffData, adminRole: e.target.value})}>
                  <option value="regional">🌍 Regional</option>
                  <option value="technical">🛠️ Técnico</option>
                </select>
                {staffData.adminRole === 'regional' && (
                  <select style={styles.input} value={staffData.region} onChange={e => setStaffData({...staffData, region: e.target.value})}>
                    <option value="Valparaíso">Valparaíso</option>
                    <option value="Santiago">Santiago</option>
                    <option value="BioBio">BioBio</option>
                  </select>
                )}
              </div>
              <button type="submit" style={styles.btnPrimary}>➕ Crear</button>
            </form>
          </div>
        </div>
      )}

      {/* --- USUARIOS --- */}
      {activeTab === 'users' && (
        <div>
          <h2 style={{color: 'var(--text-main)'}}>Usuarios</h2>
          <p>Tabla de usuarios...</p>
        </div>
      )}

    </DashboardLayout>
  );
}

const styles = {
  card: { padding: '20px', border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center', background: 'var(--bg-card)', color: 'var(--text-main)' },
  formCard: { background: 'var(--bg-card)', padding: '25px', borderRadius: '10px', border: '1px solid var(--border)', maxWidth: '500px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)', width: '100%' },
  btnPrimary: { padding: '10px 20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  alert: { padding: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '5px', marginBottom: '10px', fontSize:'0.9rem' },
  
  // Estilos Moderación
  emptyBox: { padding:'40px', textAlign:'center', background:'var(--bg-card)', borderRadius:'10px', border:'1px solid var(--border)', color:'var(--text-muted)' },
  reportCard: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'20px' },
  badgeDanger: { background:'var(--danger)', color:'white', padding:'4px 10px', borderRadius:'12px', fontSize:'0.8rem', fontWeight:'bold' },
  reportList: { background:'var(--bg-body)', padding:'15px', borderRadius:'6px', border:'1px solid var(--border)' },
  btnDelete: { padding:'8px 15px', background:'var(--danger)', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' },
  btnSecondary: { padding:'8px 15px', background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', borderRadius:'5px', cursor:'pointer' }
};