import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postAPI, categoryAPI } from '../../services/api';

export function PostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryAPI.getAll();
        setCategories(data);
        if (data.length > 0) {
          setCategory(data[0]._id); // Establecer la primera categoría por defecto
        }
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

    // Validaciones básicas
    if (!title.trim() || !content.trim()) {
      setError('El título y contenido son obligatorios');
      setLoading(false);
      return;
    }

    // Convertir tags string a array
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      await postAPI.create({
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tagsArray
      });
      
      // Redirigir al listado de publicaciones después de crear
      navigate('/forum');
    } catch (err) {
      setError(err.message || 'Error al crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          ⚠️ Debes iniciar sesión para crear publicaciones
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>📝 Crear Nueva Publicación</h2>
        <p>Comparte tus ideas, preguntas o noticias con la comunidad</p>
      </div>

      {error && (
        <div style={styles.error}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="title" style={styles.label}>
            Título *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Escribe un título descriptivo..."
            required
            maxLength={200}
            style={styles.input}
            disabled={loading}
          />
          <div style={styles.charCount}>
            {title.length}/200 caracteres
          </div>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="content" style={styles.label}>
            Contenido *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe el contenido de tu publicación..."
            required
            rows={12}
            style={styles.textarea}
            disabled={loading}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="category" style={styles.label}>
            Categoría *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={styles.select}
            disabled={loading || categories.length === 0}
          >
            {categories.length === 0 ? (
              <option value="">Cargando categorías...</option>
            ) : (
              categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="tags" style={styles.label}>
            Etiquetas
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="ejemplo: tecnologia, programacion, ayuda (separadas por comas)"
            style={styles.input}
            disabled={loading}
          />
          <div style={styles.helpText}>
            Opcional. Separa las etiquetas con comas
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            type="button"
            onClick={() => navigate('/forum')}
            style={styles.cancelButton}
            disabled={loading}
          >
            ↩️ Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={loading ? { ...styles.submitButton, ...styles.submitButtonDisabled } : styles.submitButton}
          >
            {loading ? '⏳ Publicando...' : '🚀 Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '30px 20px',
    background: '#1a1a1a',
    minHeight: '100vh',
    color: 'white',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #333',
  },
  form: {
    background: '#292929',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  formGroup: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#e0e0e0',
    fontSize: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '8px',
    border: '2px solid #444',
    backgroundColor: '#1a1a1a',
    color: 'white',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid #444',
    backgroundColor: '#1a1a1a',
    color: 'white',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '200px',
    transition: 'border-color 0.3s',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '8px',
    border: '2px solid #444',
    backgroundColor: '#1a1a1a',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    outline: 'none',
  },
  charCount: {
    textAlign: 'right',
    fontSize: '14px',
    color: '#888',
    marginTop: '5px',
  },
  helpText: {
    fontSize: '14px',
    color: '#888',
    marginTop: '5px',
    fontStyle: 'italic',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end',
    marginTop: '30px',
  },
  cancelButton: {
    padding: '12px 25px',
    background: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  submitButton: {
    padding: '12px 30px',
    background: '#8d8d8d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    background: '#442222',
    color: '#ff6b6b',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #ff6b6b',
    textAlign: 'center',
  },
};

// Efectos para mejorar la UX
styles.input[':focus'] = styles.textarea[':focus'] = styles.select[':focus'] = {
  borderColor: '#8d8d8d',
};

styles.cancelButton[':hover'] = {
  background: '#666',
};

styles.submitButton[':hover'] = {
  background: '#575656',
};