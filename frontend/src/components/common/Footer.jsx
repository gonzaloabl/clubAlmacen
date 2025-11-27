import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        
        {/* Columna 1: Marca */}
        <div style={styles.column}>
          <h3 style={styles.logo}>🏪 Club Almacén</h3>
          <p style={styles.text}>
            La comunidad digital más grande de comerciantes de barrio en Chile. Conectamos, educamos y fortalecemos el canal tradicional.
          </p>
        </div>

        {/* Columna 2: Navegación */}
        <div style={styles.column}>
          <h4 style={styles.title}>Explorar</h4>
          <ul style={styles.list}>
            <li><Link to="/noticias" style={styles.link}>Noticias</Link></li>
            <li><Link to="/forum" style={styles.link}>Foro Comunitario</Link></li>
            <li><Link to="/directorio" style={styles.link}>Directorio Proveedores</Link></li>
            <li><Link to="/comercios" style={styles.link}>Directorio Locatarios</Link></li>
          </ul>
        </div>

        {/* Columna 3: Legal / Contacto */}
        <div style={styles.column}>
          <h4 style={styles.title}>Soporte</h4>
          <ul style={styles.list}>
            <li><a href="#" style={styles.link}>Centro de Ayuda</a></li>
            <li><a href="#" style={styles.link}>Términos y Condiciones</a></li>
            <li><a href="#" style={styles.link}>Política de Privacidad</a></li>
            <li style={styles.contact}>📧 contacto@clubalmacen.cl</li>
          </ul>
        </div>

      </div>
      
      <div style={styles.copyright}>
        © {new Date().getFullYear()} Club Almacén - Proyecto de Título INACAP.
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: 'var(--bg-sidebar)', // Usamos el color oscuro del tema
    color: 'rgba(255,255,255,0.8)',
    padding: '60px 20px 20px',
    marginTop: 'auto' // Empuja el footer al fondo si hay poco contenido
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '40px',
    marginBottom: '40px'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  logo: {
    color: 'white',
    margin: 0,
    fontSize: '1.5rem'
  },
  text: {
    lineHeight: '1.6',
    fontSize: '0.9rem'
  },
  title: {
    color: 'white',
    margin: 0,
    fontSize: '1.1rem'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  link: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    transition: 'color 0.2s'
  },
  contact: {
    marginTop: '10px',
    color: 'white',
    fontWeight: 'bold'
  },
  copyright: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center',
    paddingTop: '20px',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)'
  }
};