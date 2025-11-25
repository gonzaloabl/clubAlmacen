import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { Link } from 'react-router-dom';

export function ProvidersDirectory() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await userAPI.getProviders();
        setProviders(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProviders();
  }, []);

  // Filtrado simple por nombre o rubro
  const filteredProviders = providers.filter(p => 
    (p.businessName || p.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.businessDescription || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Directorio de Proveedores</h1>
        <p style={styles.subtitle}>Encuentra los mejores distribuidores para tu almacén.</p>
        
        <input 
          type="text" 
          placeholder="🔍 Buscar por nombre o rubro..." 
          style={styles.searchBar}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={styles.gridContainer}>
        {loading ? (
          <p style={{textAlign:'center', color:'var(--text-muted)'}}>Cargando directorio...</p>
        ) : filteredProviders.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No se encontraron proveedores</h3>
            <p>Intenta con otra búsqueda o vuelve más tarde.</p>
          </div>
        ) : (
          filteredProviders.map(prov => (
            <div key={prov._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>
                  {prov.avatar ? (
                    <img src={prov.avatar} alt="Logo" style={styles.avatarImg} />
                  ) : (
                    (prov.businessName || prov.name).charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 style={styles.businessName}>{prov.businessName || prov.name}</h3>
                  <span style={styles.regionBadge}>📍 {prov.region || 'Nacional'}</span>
                </div>
              </div>

              <div style={styles.cardBody}>
                <p style={styles.desc}>
                  {prov.businessDescription || "Sin descripción disponible."}
                </p>
                
                <div style={styles.contactInfo}>
                  {prov.phone && <div>📞 {prov.phone}</div>}
                  {prov.email && <div>📧 {prov.email}</div>}
                  {prov.website && (
                    <a href={prov.website.startsWith('http') ? prov.website : `https://${prov.website}`} target="_blank" rel="noreferrer" style={styles.link}>
                      🌐 Visitar Web
                    </a>
                  )}
                </div>
              </div>

              <div style={styles.cardFooter}>
                {prov.whatsapp ? (
                  <a 
                    href={`https://wa.me/${prov.whatsapp.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={styles.whatsappBtn}
                  >
                    💬 Contactar por WhatsApp
                  </a>
                ) : (
                  <button disabled style={styles.disabledBtn}>Sin WhatsApp</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--bg-body)', paddingBottom: '60px' },
  header: { background: 'var(--bg-sidebar)', color: 'white', padding: '60px 20px', textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '2.5rem', margin: '0 0 10px 0' },
  subtitle: { opacity: 0.9, marginBottom: '30px' },
  searchBar: { padding: '15px 25px', width: '100%', maxWidth: '500px', borderRadius: '30px', border: 'none', fontSize: '1rem', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  
  gridContainer: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
  
  card: { background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' },
  cardHeader: { padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--border)', background: 'var(--bg-body)' },
  avatar: { width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  businessName: { margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--text-main)' },
  regionBadge: { fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '10px' },
  
  cardBody: { padding: '20px', flex: 1 },
  desc: { color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' },
  contactInfo: { fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' },
  link: { color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' },
  
  cardFooter: { padding: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' },
  whatsappBtn: { display: 'block', width: '100%', padding: '10px', background: '#25D366', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', textAlign: 'center' },
  disabledBtn: { display: 'block', width: '100%', padding: '10px', background: '#ccc', color: '#666', border: 'none', borderRadius: '6px', cursor: 'not-allowed' },
  
  emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }
};