import { linksData } from '../../data/usefulLinks';

export function UsefulLinks() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Caja de Herramientas</h1>
        <p style={styles.subtitle}>Accesos directos a los sitios que usas día a día en tu negocio.</p>
      </div>

      <div style={styles.content}>
        <div style={styles.grid}>
          {linksData.map((category, index) => (
            <div key={index} style={styles.categoryCard}>
              <div style={styles.catHeader}>
                <span style={styles.catIcon}>{category.icon}</span>
                <h2 style={styles.catTitle}>{category.category}</h2>
              </div>
              
              <div style={styles.linksList}>
                {category.links.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={styles.linkItem}
                  >
                    <div style={styles.linkInfo}>
                      <span style={styles.linkName}>{link.name}</span>
                      <span style={styles.linkDesc}>{link.desc}</span>
                    </div>
                    <span style={styles.arrow}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--bg-body)', paddingBottom: '60px' },
  header: { background: 'var(--bg-sidebar)', color: 'white', padding: '60px 20px', textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '2.5rem', margin: '0 0 10px 0' },
  subtitle: { opacity: 0.9, fontSize: '1.1rem' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' },
  
  categoryCard: { background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  catHeader: { padding: '20px', background: 'var(--bg-body)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '15px' },
  catIcon: { fontSize: '1.5rem' },
  catTitle: { margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' },
  
  linksList: { display: 'flex', flexDirection: 'column' },
  linkItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', textDecoration: 'none', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' },
  linkInfo: { display: 'flex', flexDirection: 'column' },
  linkName: { fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' },
  linkDesc: { fontSize: '0.85rem', color: 'var(--text-muted)' },
  arrow: { color: 'var(--text-muted)', fontSize: '1.2rem' }
};