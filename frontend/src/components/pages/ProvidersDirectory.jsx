import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import { REGIONES } from '../../utils/regions'; // 1️⃣ Importar Regiones

export function ProvidersDirectory() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('Todas'); // 2️⃣ Estado para el filtro

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

  // 3️⃣ Lógica de Filtrado (Texto AND Región)
  const filteredProviders = providers.filter(prov => {
    // Filtro por Texto
    const matchesSearch = (prov.businessName || prov.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (prov.businessDescription || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por Región (Muestra la región seleccionada O los Nacionales)
    const matchesRegion = regionFilter === 'Todas' || 
                          prov.region === regionFilter 

    return matchesSearch && matchesRegion;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Directorio de Proveedores</h1>
        <p style={styles.subtitle}>Encuentra los mejores distribuidores para tu almacén.</p>
        
        {/* BARRA DE BÚSQUEDA Y FILTRO */}
        <div style={styles.searchContainer}>
            <input 
              type="text" 
              placeholder="🔍 Buscar por nombre o rubro..." 
              style={styles.searchBar}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* 4️⃣ Selector de Región */}
            <select 
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                style={styles.regionSelect}
            >
                <option value="Todas">🇨🇱 Todo Chile</option>
                {REGIONES.filter(r => r !== 'Nacional').map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
            </select>
        </div>
      </div>

      <div style={styles.gridContainer}>
        {loading ? (
          <p style={{textAlign:'center', color:'var(--text-muted)'}}>Cargando directorio...</p>
        ) : filteredProviders.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No se encontraron proveedores</h3>
            <p>Intenta cambiar la región o los términos de búsqueda.</p>
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
                  {prov.businessDescription ? `"${prov.businessDescription}"` : "Proveedor verificado."}
                </p>
                
                <div style={styles.contactInfo}>
                  {prov.phone && (
                    <div style={styles.infoRow}>
                       <span style={styles.icon}>📞</span> {prov.phone}
                    </div>
                  )}
                  {prov.email && (
                    <div style={styles.infoRow}>
                       <span style={styles.icon}>📧</span> {prov.email}
                    </div>
                  )}
                  {prov.website && (
                    <div style={styles.infoRow}>
                       <span style={styles.icon}>🌐</span> 
                       <a href={prov.website.startsWith('http') ? prov.website : `https://${prov.website}`} target="_blank" rel="noreferrer" style={styles.link}>Sitio Web</a>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.cardFooter}>
                <Link to={`/proveedor/${prov._id}`} style={styles.catalogBtn}>
                    📦 Ver Catálogo
                </Link>

                {prov.whatsapp ? (
                  <a 
                    href={`https://wa.me/${prov.whatsapp.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={styles.whatsappBtn}
                  >
                    💬 WhatsApp
                  </a>
                ) : (
                  <span style={styles.disabledText}>Sin WhatsApp</span>
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
  
  // Estilos nuevos para la barra de búsqueda compuesta
  searchContainer: { display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '700px', margin: '0 auto' },
  searchBar: { padding: '15px 25px', flex: 2, minWidth: '200px', borderRadius: '30px', border: 'none', fontSize: '1rem', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  regionSelect: { padding: '15px 25px', flex: 1, minWidth: '150px', borderRadius: '30px', border: 'none', fontSize: '1rem', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', cursor: 'pointer' },

  gridContainer: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '0 20px', 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
    gap: '25px' 
  },
  
  // ESTILO FICHERO (Se mantiene igual que antes)
  card: { background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', borderTop: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'transform 0.2s', height: '100%' },
  cardHeader: { padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px dashed var(--border)' },
  avatar: { width: '50px', height: '50px', borderRadius: '8px', background: 'var(--bg-body)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', border: '1px solid var(--border)', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  businessName: { margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '700' },
  regionBadge: { fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-body)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' },
  cardBody: { padding: '20px', flex: 1 },
  desc: { color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '20px', fontStyle: 'italic' },
  contactInfo: { display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' },
  icon: { width: '20px', textAlign: 'center' },
  link: { color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' },
  cardFooter: { padding: '15px 20px', background: 'var(--bg-body)', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center' },
  whatsappBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px', background: '#25D366', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center' },
  catalogBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)', textDecoration: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center', transition: 'background 0.2s' },
  disabledText: { fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }
};