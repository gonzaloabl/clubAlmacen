import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast'; // 👈 ¡Feedback bonito!
import styles from './UserManagement.module.css'; // 👈 Asegúrate de crear el archivo CSS arriba

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación Simple
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Error cargando usuarios");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setLoading(true); loadUsers(); }, []);

  // Filtro
  useEffect(() => {
    if (!users) return;

    const results = users.filter(u => {
      // 1. Seguridad: Ocultarte a ti mismo (comparamos ID y Email por si acaso)
      const isMe = (currentUser?._id && u._id === currentUser._id) || (currentUser?.email && u.email === currentUser.email);
      if (isMe) return false;

      // 2. Búsqueda normal
      return u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             u.email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setFilteredUsers(results);
    setCurrentPage(1); // Reset a pág 1 al buscar
  }, [searchTerm, users, currentUser]);

  // Lógica de Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const executeToggleBan = async (targetUser) => {
    const isCurrentlyActive = targetUser.isActive !== false; 
    const newStatus = !isCurrentlyActive; 
    const actionText = newStatus ? "ACTIVADO" : "BANEADO";

    // Optimistic UI Update
    setUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, isActive: newStatus } : u));

    try {
      await userAPI.updateUserStatus(targetUser._id, { isActive: newStatus });
      toast.success(`Usuario ${actionText} exitosamente`);
    } catch (error) {
      toast.error("Error en servidor. Revertiendo...");
      setUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, isActive: isCurrentlyActive } : u));
    }
  };

  const confirmToggleBan = (targetUser) => {
    const isActive = targetUser.isActive !== false;
    const action = isActive ? 'BANEAR' : 'ACTIVAR';

    toast((t) => (
      <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
        <span style={{fontSize:'0.9rem'}}>⚠️ ¿Confirmas <b>{action}</b> a {targetUser.name}?</span>
        <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
          <button onClick={() => { toast.dismiss(t.id); executeToggleBan(targetUser); }} style={{background:'#e74c3c', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem'}}>Sí, {action.toLowerCase()}</button>
          <button onClick={() => toast.dismiss(t.id)} style={{background:'#ecf0f1', color:'#333', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem'}}>Cancelar</button>
        </div>
      </div>
    ), { duration: 5000, icon: '🚫' });
  };

  const makeProvider = async (targetUser) => {
    // Usamos toast.promise para acciones que demoran
    toast.promise(
      userAPI.updateUserStatus(targetUser._id, { role: 'proveedor' }),
      {
         loading: 'Procesando...',
         success: () => {
             loadUsers();
             return '¡Usuario ascendido a Proveedor!';
         },
         error: 'Error al cambiar rol'
      }
    );
  };

  if (loading) return <div style={{padding:'40px', textAlign:'center', color:'#666'}}>Cargando directorio...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 style={{margin:0}}>👥 Gestión de Usuarios ({users.length})</h2>
        <input 
          type="text" 
          placeholder="🔍 Buscar por nombre o email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchBox}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Región</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(u => {
              const isUserActive = u.isActive !== false;
              let roleBadgeClass = styles.roleUser;
              if(u.role === 'admin') roleBadgeClass = styles.roleAdmin;
              if(u.role === 'proveedor') roleBadgeClass = styles.roleProv;

              return (
              <tr key={u._id}>
                <td>
                  <strong>{u.name}</strong>
                  <div style={{fontSize:'0.85rem', color:'#95a5a6'}}>{u.email}</div>
                </td>
                <td>
                   <span className={`${styles.badge} ${roleBadgeClass}`}>
                      {u.adminRole ? `Admin ${u.adminRole}` : u.role}
                   </span>
                </td>
                <td>{u.region || <span style={{color:'#bdc3c7', fontStyle:'italic'}}>N/A</span>}</td>
                
                <td>
                   {isUserActive ? (
                     <div className={styles.statusActive}>● Activo</div>
                   ) : (
                     <span className={styles.statusBanned}>⛔ SUSPENDIDO</span>
                   )}
                </td>

                <td>
                  <button 
                      onClick={() => confirmToggleBan(u)}
                      className={`${styles.btnAction} ${isUserActive ? styles.btnBan : styles.btnUnban}`}
                  >
                      {isUserActive ? 'Banear' : 'Activar'}
                  </button>
                </td>
              </tr>
            )})} 
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {filteredUsers.length > itemsPerPage && (
          <div className={styles.pagination}>
              <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className={styles.pageBtn}
              >
                  Anterior
              </button>
              <span style={{fontSize:'0.9rem', color:'#666'}}>Pág {currentPage} de {totalPages}</span>
              <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className={styles.pageBtn}
              >
                  Siguiente
              </button>
          </div>
      )}
    </div>
  );
}