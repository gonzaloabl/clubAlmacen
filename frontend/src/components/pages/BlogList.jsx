import { useState, useEffect } from 'react';
import { blogAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { formatRelativeTime } from '../../utils/helpers';

export function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useRole();
  
  // Formulario Admin
  const [formData, setFormData] = useState({ title: '', content: '', tag: 'Novedad' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const data = await blogAPI.getAll();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if(!formData.title || !formData.content) return;
    setIsSubmitting(true);
    try {
      await blogAPI.create(formData);
      setFormData({ title: '', content: '', tag: 'Novedad' });
      loadData();
      alert('✅ Publicado en el muro');
    } catch (err) {
      alert('Error al publicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(confirm('¿Eliminar este comunicado?')) {
        await blogAPI.delete(id);
        loadData();
    }
  };

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Muro Oficial</h1>
          <p style={styles.subtitle}>Comunicados y novedades de la administración.</p>
        </div>
      </div>

      <div style={styles.layoutGrid}>
        
        {/* COLUMNA PRINCIPAL: GRID DE NOTICIAS */}
        <div style={styles.mainColumn}>
          {loading ? (
            <p style={{textAlign:'center', color:'var(--text-muted)'}}>Cargando...</p>
          ) : posts.length === 0 ? (
            <div style={styles.empty}>No hay comunicados aún.</div>
          ) : (
            // AQUÍ ESTÁ EL CAMBIO A GRID
            <div style={styles.newsGrid}>
              {posts.map(post => (
                <div key={post._id} style={styles.newsCard}>
                  
                  {/* Cabecera de la Tarjeta: Tag y Fecha */}
                  <div style={styles.cardTop}>
                    <span style={{
                       ...styles.tag, 
                       background: post.tag === 'Importante' ? 'var(--danger)' : 'var(--accent)'
                    }}>
                      {post.tag}
                    </span>
                    <span style={styles.cardDate}>
                      {new Date(post.createdAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Cuerpo */}
                  <div style={styles.cardBody}>
                    <h3 style={styles.newsTitle}>{post.title}</h3>
                    <p style={styles.newsExcerpt}>{post.content}</p>
                  </div>
                  
                  {/* Pie: Autor y Botón Borrar */}
                  <div style={styles.cardFooter}>
                     <small style={{color:'var(--text-muted)'}}>
                       Por <strong>{post.author?.name || 'Admin'}</strong>
                     </small>
                     {isAdmin && (
                        <button onClick={() => handleDelete(post._id)} style={styles.btnDelete}>🗑️</button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR DERECHO (Se mantiene igual) */}
        <aside style={styles.sidebar}>
          
          {isAdmin && (
            <div style={styles.widgetForm}>
              <h3 style={styles.widgetTitle}>✍️ Publicar</h3>
              <form onSubmit={handlePublish} style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                
                <input 
                  type="text" 
                  placeholder="Título..." 
                  style={styles.input}
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
                
                <select 
                  style={styles.select}
                  value={formData.tag}
                  onChange={e => setFormData({...formData, tag: e.target.value})}
                >
                  <option value="Novedad">✨ Novedad</option>
                  <option value="Importante">🚨 Importante</option>
                  <option value="Evento">📅 Evento</option>
                </select>

                <textarea 
                  placeholder="Mensaje..." 
                  style={styles.textarea}
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                />

                <button type="submit" style={styles.btnPublish} disabled={isSubmitting}>
                  {isSubmitting ? '...' : 'Publicar'}
                </button>
              </form>
            </div>
          )}

          <div style={styles.widgetInfo}>
             <h4 style={{margin:'0 0 10px 0', color:'var(--text-main)'}}>Información</h4>
             <p style={{fontSize:'0.9rem', color:'var(--text-muted)', lineHeight:'1.5'}}>
               Espacio reservado para anuncios oficiales de Club Almacén.
             </p>
          </div>

        </aside>

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--bg-body)', paddingBottom: '60px' },
  
  header: { background: 'var(--bg-sidebar)', padding: '40px 20px', marginBottom: '30px' },
  headerContent: { maxWidth: '1100px', margin: '0 auto' },
  title: { color: 'white', margin: 0, fontSize: '2rem' },
  subtitle: { color: 'rgba(255,255,255,0.7)', margin: '5px 0 0 0' },

  layoutGrid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 300px', // 1fr para contenido, 300px para sidebar
    gap: '30px', 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '0 20px' 
  },

  mainColumn: { minWidth: 0 },

  // --- 🆕 GRID SYSTEM PARA NOTICIAS ---
  newsGrid: { 
    display: 'grid', 
    // Esto crea columnas automáticas de mínimo 220px (aprox 3 columnas en desktop)
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
    gap: '20px' 
  },
  
  // --- 🆕 ESTILO TARJETA VERTICAL ---
  newsCard: { 
    display: 'flex', 
    flexDirection: 'column',
    background: 'var(--bg-card)', 
    borderRadius: '12px', 
    border: '1px solid var(--border)',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    height: '100%' // Para que todas tengan la misma altura
  },
  
  // Hover effect
  /* Nota: En objetos de estilo inline no se puede poner :hover directo fácilmente, 
     pero el CSS global o librerías como styled-components lo manejarían. 
     Aquí confiamos en la sombra base. */

  cardTop: {
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-body)' // Un poco más oscuro que la tarjeta
  },

  tag: { 
    color: 'white', 
    padding: '3px 8px', 
    borderRadius: '4px', 
    fontSize: '0.7rem', 
    fontWeight: 'bold', 
    textTransform: 'uppercase' 
  },
  
  cardDate: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    textTransform: 'uppercase'
  },

  cardBody: {
    padding: '20px',
    flex: 1 // Esto empuja el footer hacia abajo
  },

  newsTitle: { 
    margin: '0 0 10px 0', 
    fontSize: '1.2rem', 
    color: 'var(--text-main)', 
    lineHeight: '1.3' 
  },
  
  newsExcerpt: { 
    color: 'var(--text-muted)', 
    lineHeight: '1.5', 
    fontSize: '0.95rem', 
    whiteSpace: 'pre-wrap' 
  },

  cardFooter: {
    padding: '15px 20px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  btnDelete: { 
    background: 'transparent', 
    border: 'none', 
    color: 'var(--danger)', // Rojo
    cursor: 'pointer', 
    fontWeight: 'bold',
    fontSize: '1rem',
    padding: '5px'
  },

  // Sidebar Styles (Igual que antes)
  sidebar: { display: 'flex', flexDirection: 'column', gap: '20px' },
  widgetForm: { background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  widgetTitle: { margin: '0 0 15px 0', color: 'var(--text-main)', fontSize: '1.1rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)' },
  select: { padding: '8px', borderRadius: '5px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)' },
  textarea: { padding: '10px', borderRadius: '5px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' },
  btnPublish: { padding: '10px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
  widgetInfo: { background: 'rgba(52, 152, 219, 0.1)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(52, 152, 219, 0.2)' },
  empty: { textAlign: 'center', padding: '40px', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: '8px' },

  // Media query simple para móviles
  '@media (max-width: 768px)': {
    layoutGrid: { gridTemplateColumns: '1fr' },
    newsGrid: { gridTemplateColumns: '1fr' }
  }
};