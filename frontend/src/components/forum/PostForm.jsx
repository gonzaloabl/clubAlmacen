import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { postAPI, categoryAPI } from '../../services/api';
import { REGIONES } from '../../utils/regions'; // Asegúrate de tener este archivo

export function PostForm() {
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [type, setType] = useState('forum'); // 'forum' o 'blog'
  const [region, setRegion] = useState('Nacional'); // Nueva Región
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar categorías al montar
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryAPI.getAll();
        setCategories(data);
        if (data.length > 0) setCategory(data[0]._id);
      } catch (err) {
        setError('Error al cargar categorías');
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('El título y contenido son obligatorios');
      setLoading(false);
      return;
    }

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      await postAPI.create({
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tagsArray,
        type,
        region // Enviamos la región
      });
      navigate('/forum');
    } catch (err) {
      setError('Error al crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{padding:'50px', textAlign:'center'}}>Acceso denegado.</div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.editorCard}>
        
        <div style={styles.header}>
          <h2 style={styles.title}>📝 Iniciar Nueva Discusión</h2>
          <p style={styles.subtitle}>Comparte tus dudas, ideas o noticias con la comunidad.</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* OPCIÓN DE TIPO (SOLO ADMIN) */}
          {isAdmin && (
            <div style={styles.adminSection}>
              <label style={styles.label}>Tipo de Publicación (Admin)</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" name="postType" value="forum" 
                    checked={type === 'forum'} onChange={(e) => setType(e.target.value)}
                  /> 
                  💬 Foro Normal
                </label>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" name="postType" value="blog" 
                    checked={type === 'blog'} onChange={(e) => setType(e.target.value)}
                  /> 
                  📢 Comunicado Oficial
                </label>
              </div>
            </div>
          )}

          {/* TÍTULO */}
          <div style={styles.group}>
            <label style={styles.label}>Título de tu tema</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: ¿Cuál es el mejor proveedor de lácteos en Santiago?"
              style={styles.inputLg}
              autoFocus
              disabled={loading}
            />
          </div>

          {/* CONTENIDO */}
          <div style={styles.group}>
            <label style={styles.label}>Contenido</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe tu consulta o tema en detalle..."
              style={styles.textarea}
              rows={10}
              disabled={loading}
            />
          </div>

          {/* FILA: CATEGORÍA, REGIÓN Y ETIQUETAS */}
          <div style={styles.row}>
            
            {/* Categoría */}
            <div style={{...styles.group, flex: 1}}>
              <label style={styles.label}>Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
                disabled={loading}
              >
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Región (NUEVO) */}
            <div style={{...styles.group, flex: 1}}>
              <label style={styles.label}>Región</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={styles.select}
                disabled={loading}
              >
                {REGIONES.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            {/* Etiquetas */}
            <div style={{...styles.group, flex: 1.5}}>
              <label style={styles.label}>Etiquetas (Opcional)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ej: urgente, dato, oferta"
                style={styles.input}
                disabled={loading}
              />
              <span style={styles.helper}>Separadas por comas</span>
            </div>
          </div>

          {/* FOOTER CON ACCIONES */}
          <div style={styles.footerActions}>
            <button 
              type="button" 
              onClick={() => navigate('/forum')} 
              style={styles.btnCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              style={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? 'Publicando...' : '🚀 Publicar Tema'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'var(--bg-body)',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  editorCard: {
    width: '100%',
    maxWidth: '800px',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    border: '1px solid var(--border)'
  },
  header: {
    marginBottom: '30px',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '20px'
  },
  title: {
    margin: '0 0 10px 0',
    color: 'var(--text-main)',
    fontSize: '1.8rem'
  },
  subtitle: {
    margin: 0,
    color: 'var(--text-muted)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  row: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  label: {
    fontWeight: '600',
    fontSize: '0.9rem',
    color: 'var(--text-main)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg-body)',
    color: 'var(--text-main)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  inputLg: {
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg-body)',
    color: 'var(--text-main)',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  textarea: {
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg-body)',
    color: 'var(--text-main)',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.6'
  },
  select: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg-body)',
    color: 'var(--text-main)',
    fontSize: '1rem',
    outline: 'none',
    cursor: 'pointer'
  },
  helper: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic'
  },
  
  adminSection: {
    background: 'rgba(52, 152, 219, 0.1)',
    padding: '15px',
    borderRadius: '8px',
    border: '1px dashed var(--accent)'
  },
  radioGroup: {
    display: 'flex',
    gap: '20px',
    marginTop: '5px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    color: 'var(--text-main)'
  },

  footerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '20px',
    borderTop: '1px solid var(--border)',
    paddingTop: '20px'
  },
  btnCancel: {
    padding: '12px 25px',
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  },
  btnSubmit: {
    padding: '12px 30px',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    transition: 'transform 0.1s'
  },
  errorAlert: {
    padding: '15px',
    background: 'rgba(231, 76, 60, 0.1)',
    color: '#e74c3c',
    borderRadius: '6px',
    border: '1px solid #e74c3c',
    marginBottom: '20px'
  }
};