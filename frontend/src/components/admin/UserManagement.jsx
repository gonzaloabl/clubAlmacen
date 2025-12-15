import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar usuarios del servidor
  const loadUsers = async () => {
    try {
      // Nota: No ponemos setLoading(true) aquí para evitar parpadeos al recargar
      const data = await userAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => { 
    setLoading(true);
    loadUsers(); 
  }, []);

  // Filtro de búsqueda (Se actualiza cuando cambia 'users' o 'searchTerm')
  useEffect(() => {
    const results = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  // 👇 LA MAGIA: Actualización Optimista
  const toggleBan = async (targetUser) => {
    // 1. Calculamos el nuevo estado lógico
    const isCurrentlyActive = targetUser.isActive !== false; 
    const newStatus = !isCurrentlyActive; // Invertimos

    console.log(`🔄 Cambiando visualmente a: ${newStatus ? 'ACTIVO' : 'BANEADO'}`);

    // 2. ⚡ ACTUALIZACIÓN VISUAL INMEDIATA (Sin esperar al servidor)
    // Modificamos el estado local 'users' manualmente para que el botón cambie YA.
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u._id === targetUser._id ? { ...u, isActive: newStatus } : u
      )
    );

    try {
      // 3. Enviamos la petición al servidor en segundo plano
      await userAPI.updateUserStatus(targetUser._id, { isActive: newStatus });
      console.log("✅ Servidor confirmó el cambio");
      
      // Opcional: Recargamos del servidor para asegurar sincronización total
      // loadUsers(); 
    } catch (error) {
      // 4. Si falla, revertimos el cambio visual (Rollback)
      console.error("❌ Falló el servidor, revirtiendo cambios...", error);
      alert("Error al cambiar estado: " + error.message);
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === targetUser._id ? { ...u, isActive: isCurrentlyActive } : u
        )
      );
    }
  };

  const makeProvider = async (targetUser) => {
    if(!window.confirm("¿Convertir en Proveedor?")) return;
    try {
        await userAPI.updateUserStatus(targetUser._id, { role: 'proveedor' });
        loadUsers(); // Aquí sí recargamos normal
    } catch (e) { console.error("Error", e); }
  };

  if (loading) return <div style={{padding:'20px'}}>Cargando censo...</div>;

  return (
    <div style={{padding: '20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2>👥 Gestión de Usuarios ({users.length})</h2>
        <input 
          type="text" 
          placeholder="🔍 Buscar..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{padding:'10px', borderRadius:'5px', border:'1px solid #ccc', width:'300px'}}
        />
      </div>

      <div style={{overflowX:'auto', background:'white', borderRadius:'8px', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead style={{background:'#f4f4f4', borderBottom:'2px solid #ddd'}}>
            <tr>
              <th style={thStyle}>Usuario</th>
              <th style={thStyle}>Rol</th>
              <th style={thStyle}>Región</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => {
              // Lógica visual: Si es undefined o true -> Activo
              const isUserActive = u.isActive !== false;
              
              return (
              <tr key={u._id} style={{borderBottom:'1px solid #eee'}}>
                <td style={tdStyle}>
                  <strong>{u.name}</strong><br/>
                  <span style={{fontSize:'0.85rem', color:'#666'}}>{u.email}</span>
                </td>
                <td style={tdStyle}>
                   <span style={{
                      padding:'4px 8px', borderRadius:'4px', fontSize:'0.8rem', fontWeight:'bold',
                      background: u.role === 'admin' ? '#e74c3c' : u.role === 'proveedor' ? '#2ecc71' : '#3498db',
                      color:'white'
                   }}>
                      {u.role.toUpperCase()}
                      {u.adminRole && ` (${u.adminRole})`}
                   </span>
                </td>
                <td style={tdStyle}>{u.region || 'Nacional'}</td>
                
                {/* ESTADO */}
                <td style={tdStyle}>
                   {isUserActive ? (
                     <span style={{color:'green', fontWeight:'bold', background:'#e8f5e9', padding:'4px 8px', borderRadius:'4px'}}>Activo</span>
                   ) : (
                     <span style={{color:'red', fontWeight:'bold', background:'#ffebee', padding:'4px 8px', borderRadius:'4px'}}>⛔ BANEADO</span>
                   )}
                </td>

                <td style={tdStyle}>
                  {u._id !== currentUser._id && (
                     <div style={{display:'flex', gap:'10px'}}>
                        <button 
                           onClick={() => toggleBan(u)}
                           style={{
                              padding:'6px 12px', 
                              background: isUserActive ? '#e74c3c' : '#2ecc71', // Rojo si está activo, Verde si está baneado
                              color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'
                           }}
                        >
                           {isUserActive ? 'Banear' : 'Activar'}
                        </button>
                        
                        {currentUser.adminRole === 'superadmin' && u.role === 'user' && (
                            <button onClick={() => makeProvider(u)} style={{padding:'5px 10px', cursor:'pointer', background:'#3498db', color:'white', border:'none', borderRadius:'4px'}}>🔼 Hacer Prov</button>
                        )}
                     </div>
                  )}
                </td>
              </tr>
            )})} 
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = { padding: '15px', textAlign: 'left' };
const tdStyle = { padding: '15px' };