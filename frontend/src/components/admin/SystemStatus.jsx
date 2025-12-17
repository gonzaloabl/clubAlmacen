import { useState, useEffect } from 'react';
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
          <button className={stats?.maintenanceMode ? styles.openBtn : styles.shutdownBtn}>
            {stats?.maintenanceMode ? '🔓 ABRIR' : '🔒 CERRAR'}
          </button>
        </div>
      </div>
    </div>
  );
}