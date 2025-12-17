import { useState, useEffect } from 'react';
import styles from './StatsOverview.module.css';

export function StatsOverview() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalPosts: 0,
    pendingReports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/system/stats', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        
        const data = await res.json();
        // Nos aseguramos de que data tenga lo que necesitamos
        setMetrics({
          totalUsers: data.totalUsers || 0,
          totalPosts: data.totalPosts || 0,
          pendingReports: data.pendingReports || 0
        });
      } catch (error) {
        console.error("Error cargando métricas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const stats = [
    { 
      id: 1, 
      title: 'Usuarios Totales', 
      // 👇 El "?" y el "?? '0'" evitan el error de undefined
      value: metrics.totalUsers?.toLocaleString() ?? '0', 
      icon: '👥', 
      color: 'blue' 
    },
    { 
      id: 2, 
      title: 'Publicaciones', 
      value: metrics.totalPosts?.toLocaleString() ?? '0', 
      icon: '📝', 
      color: 'purple' 
    },
    { 
      id: 3, 
      title: 'Reportes Pendientes', 
      value: metrics.pendingReports ?? '0', 
      icon: '🚩', 
      color: 'red' 
    },
  ];

  if (loading) return <div style={{padding: '20px', color: 'var(--text-muted)'}}>Calculando métricas...</div>;

  return (
    <div className={styles.grid}>
      {stats.map((s) => (
        <div key={s.id} className={`${styles.card} ${styles[s.color]}`}>
          <div className={styles.header}>
            <span className={styles.icon}>{s.icon}</span>
            <span className={styles.title}>{s.title}</span>
          </div>
          <h3 className={styles.value}>{s.value}</h3>
        </div>
      ))}
    </div>
  );
}