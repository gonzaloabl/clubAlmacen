import { useState } from 'react';
import { REGIONES } from '../../utils/regions';

export function DirectoryLayout({ 
  title, 
  subtitle, 
  items, 
  loading, 
  renderItem, 
  searchPlaceholder = "🔍 Buscar...",
  emptyMessage = "No se encontraron resultados."
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('Todas');

  // Lógica de Filtrado Unificada
  const filteredItems = items.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (item.businessName || item.name).toLowerCase().includes(term) ||
                          (item.businessDescription || '').toLowerCase().includes(term) ||
                          (item.address || '').toLowerCase().includes(term);
    
    const matchesRegion = regionFilter === 'Todas' || item.region === regionFilter;

    return matchesSearch && matchesRegion;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setRegionFilter('Todas');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>{subtitle}</p>
        
        <div style={styles.searchContainer}>
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              value={searchTerm}
              style={styles.searchBar}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
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

            {(searchTerm || regionFilter !== 'Todas') && (
                <button onClick={clearFilters} style={styles.clearBtn}>
                    ✖ Limpiar
                </button>
            )}
        </div>
      </div>

      <div style={styles.gridContainer}>
        {loading ? (
          <p style={{textAlign:'center', color:'var(--text-muted)'}}>Cargando directorio...</p>
        ) : filteredItems.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>{emptyMessage}</h3>
            <p>Intenta cambiar los filtros de búsqueda.</p>
          </div>
        ) : (
          // Renderizamos cada item usando la función que nos pasa el padre
          filteredItems.map(item => renderItem(item))
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
  
  searchContainer: { display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '700px', margin: '0 auto' },
  searchBar: { padding: '15px 25px', flex: 2, minWidth: '200px', borderRadius: '30px', border: 'none', fontSize: '1rem', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  regionSelect: { padding: '15px 25px', flex: 1, minWidth: '150px', borderRadius: '30px', border: 'none', fontSize: '1rem', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', cursor: 'pointer' },
  clearBtn: { padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },

  gridContainer: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '0 20px', 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
    gap: '25px' 
  },
  
  emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }
};