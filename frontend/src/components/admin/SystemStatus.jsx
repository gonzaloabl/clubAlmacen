import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import styles from './SystemStatus.module.css';

export function SystemStatus() {
  const token = localStorage.getItem('token');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3000/api/system/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchStatus();
    const inv = setInterval(fetchStatus, 30000);
    return () => clearInterval(inv);
  }, []);

  const executeToggle = async () => {
    try {
      await toast.promise(
        fetch('http://localhost:3000/api/system/maintenance', {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(async (res) => {
          if (!res.ok) throw new Error('Error en servidor');
          await fetchStatus();
        }),
        {
          loading: 'Procesando cambio...',
          success: '✅ Estado del sistema actualizado',
          error: '❌ No se pudo cambiar el estado'
        }
      );
    } catch (e) { console.error(e); }
  };

  const toggleMaintenance = () => {
    if (!stats) return;
    const action = stats.maintenanceMode ? 'ACTIVAR' : 'DESACTIVAR';
    
    toast((t) => (
      <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
        <span style={{fontSize:'0.9rem'}}>⚠️ ¿Confirmas <b>{action}</b> el sistema?</span>
        <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
          <button onClick={() => { toast.dismiss(t.id); executeToggle(); }} style={{background:'#e74c3c', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px', cursor:'pointer', fontSize:'0.8rem'}}>Confirmar</button>
          <button onClick={() => toast.dismiss(t.id)} style={{background:'#ecf0f1', color:'#333', border:'none', padding:'4px 8px', borderRadius:'4px', cursor:'pointer', fontSize:'0.8rem'}}>Cancelar</button>
        </div>
      </div>
    ), { duration: 5000, icon: '🛑' });
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>🖥️ Servidor</h3>
        <div className={styles.row}><span>BD:</span><span className={styles.statusOk}>{stats?.database} 🟢</span></div>
        <div className={styles.divider}></div>
        <div className={styles.row}><span>Uptime:</span><span className={styles.data}>{stats?.uptime}</span></div>
        <div className={styles.divider}></div>
        <div className={styles.row}><span>Hora:</span><span className={styles.data}>{new Date(stats?.serverTime).toLocaleTimeString()}</span></div>
      </div>
      <div className={styles.card}>
        <h3 className={`${styles.cardTitle} ${styles.dangerTitle}`}>⚠️ Emergencia</h3>
        <div className={styles.centerBox}>
          <div className={stats?.maintenanceMode ? styles.systemDown : styles.systemOk}>
            {stats?.maintenanceMode ? '⛔ MANTENIMIENTO' : '✅ ONLINE'}
          </div>
          <button 
            className={stats?.maintenanceMode ? styles.openBtn : styles.shutdownBtn}
            onClick={toggleMaintenance}
          >
            {stats?.maintenanceMode ? '🔓 ABRIR' : '🔒 CERRAR'}
          </button>
        </div>
      </div>
    </div>
  );
}