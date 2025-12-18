import { useState, useEffect } from 'react';
import { blogAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // 🔒 Solo SuperAdmin ve los controles
  const isSuperAdmin = user?.adminRole === 'superadmin';
  
  // Formulario Admin
  const [formData, setFormData] = useState({ title: '', content: '', tag: 'Novedad' });
  const [image, setImage] = useState(null); // 📸 Estado imagen
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
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('tag', formData.tag);
      if (image) data.append('image', image);

      await blogAPI.create(data); // La API ya maneja FormData si se lo pasamos
      
      setFormData({ title: '', content: '', tag: 'Novedad' });
      setImage(null);
      loadData();
      toast.success('✅ Publicado en el muro');
    } catch (err) {
      toast.error('Error al publicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('¿Eliminar este comunicado?')) {
      try {
        await blogAPI.delete(id);
        toast.success('Eliminado');
        loadData();
      } catch (e) { toast.error('Error al eliminar'); }
    }
  };

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

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
            <>
              {/* 🌟 1. NOTICIA DESTACADA (HERO) */}
              {featuredPost && (
                <div style={styles.featuredCard}>
                  <div style={styles.featuredImageContainer}>
                    {featuredPost.image ? (
                      <img src={featuredPost.image} alt="Destacado" style={styles.featuredImage} />
                    ) : (
                      <div style={styles.featuredPlaceholder}>📢</div>
                    )}
                    <div style={styles.featuredOverlay}>
                      <span style={{
                         ...styles.tag, 
                         background: featuredPost.tag === 'Importante' ? 'var(--danger)' : 'var(--accent)',
                         marginBottom: '10px',
                         display: 'inline-block'
                      }}>
                        {featuredPost.tag}
                      </span>
                      <h2 style={styles.featuredTitle}>{featuredPost.title}</h2>
                      <p style={styles.featuredExcerpt}>{featuredPost.content.substring(0, 150)}...</p>
                      
                      <div style={styles.featuredMeta}>
                        <span>📅 {new Date(featuredPost.createdAt).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        {isSuperAdmin && (
                          <button onClick={() => handleDelete(featuredPost._id)} style={styles.btnDeleteHero}>
                            🗑️ Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 📰 2. RESTO DE NOTICIAS (GRID) */}
              {otherPosts.length > 0 && <h3 style={styles.sectionTitle}>Anuncios Anteriores</h3>}
              
              <div style={styles.newsGrid}>
                {otherPosts.map(post => (
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

                  {/* 📸 Imagen del Comunicado */}
                  {post.image && (
                    <img src={post.image} alt="Adjunto" style={styles.cardImage} />
                  )}

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
                     {isSuperAdmin && (
                        <button onClick={() => handleDelete(post._id)} style={styles.btnDelete}>🗑️</button>
                     )}
                  </div>
                </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* SIDEBAR DERECHO (Se mantiene igual) */}
        <aside style={styles.sidebar}>
          
          {isSuperAdmin && (
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

                {/* Input de Imagen Simple */}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  style={{fontSize:'0.8rem'}}
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

  // --- 🌟 ESTILOS DESTACADOS (HERO) ---
  featuredCard: {
    marginBottom: '40px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    position: 'relative',
    background: 'var(--bg-card)'
  },
  featuredImageContainer: { position: 'relative', height: '400px', background: '#2c3e50' },
  featuredImage: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }, // Oscurecemos imagen para leer texto
  featuredPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', background: 'linear-gradient(45deg, #3498db, #2c3e50)' },
  
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '40px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
    color: 'white'
  },
  featuredTitle: { fontSize: '2.5rem', margin: '0 0 15px 0', lineHeight: 1.1, textShadow: '0 2px 4px rgba(0,0,0,0.3)' },
  featuredExcerpt: { fontSize: '1.1rem', opacity: 0.9, maxWidth: '800px', marginBottom: '20px', lineHeight: 1.5 },
  featuredMeta: { display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.9rem', opacity: 0.8 },

  // --- 🆕 GRID SYSTEM PARA NOTICIAS ---
  newsGrid: { 
    display: 'grid', 
    // Esto crea columnas automáticas de mínimo 220px (aprox 3 columnas en desktop)
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
    gap: '20px' 
  },

  sectionTitle: { color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '20px', marginTop: '0' },
  
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

  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
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
  btnDeleteHero: { background: 'rgba(231, 76, 60, 0.2)', color: '#ff6b6b', border: '1px solid #e74c3c', padding: '5px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },

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