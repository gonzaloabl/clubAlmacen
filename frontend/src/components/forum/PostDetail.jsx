import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/api';

export function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const hasLoaded = useRef(false); // Ahora useRef está definido

  useEffect(() => {
    const loadPostData = async () => {
      // Evitar carga duplicada en desarrollo con React.StrictMode
      if (hasLoaded.current) return;
      hasLoaded.current = true;

      try {
        console.log(`🔍 Cargando post ${id}...`);
        
        // Registrar vista y cargar post en paralelo para mejor performance
        const [viewResponse, postData] = await Promise.all([
          postAPI.registerView(id),
          postAPI.getById(id)
        ]);
        
        console.log(`✅ Post cargado: ${postData.title}, Vistas: ${postData.viewCount}`);
        setPost(postData);
      } catch (err) {
        console.error('❌ Error cargando post:', err);
        setError('Error al cargar la publicación');
      } finally {
        setLoading(false);
      }
    };

    loadPostData();
  }, [id]);


  // Resto del código permanece igual...
  const handleLike = async () => {
    if (!user) {
      alert('Debes iniciar sesión para dar like');
      return;
    }
    try {
      await postAPI.like(post._id);
      loadPost();
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }
    
    try {
      await postAPI.addComment(post._id, { content: commentText });
      setCommentText('');
      loadPost(); // Recargar para ver el comentario nuevo
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta publicación?')) return;
    
    try {
      await postAPI.delete(post._id);
      navigate('/forum');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar la publicación');
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} d`;
    
    return date.toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Cargando publicación...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>❌ {error}</div>
        <button onClick={() => navigate('/forum')} style={styles.backButton}>
          ← Volver al foro
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>❌ Publicación no encontrada</div>
        <button onClick={() => navigate('/forum')} style={styles.backButton}>
          ← Volver al foro
        </button>
      </div>
    );
  }

  const isAuthor = user && user._id === post.author._id;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/forum')} style={styles.backButton}>
          ← Volver al foro
        </button>
        {isAuthor && (
          <div style={styles.authorActions}>
            <button 
              onClick={() => navigate(`/forum/edit/${post._id}`)}
              style={styles.editButton}
            >
              ✏️ Editar
            </button>
            <button 
              onClick={handleDelete}
              style={styles.deleteButton}
            >
              🗑️ Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div style={styles.postCard}>
        {/* Información del autor */}
        <div style={styles.postHeader}>
          <div style={styles.authorInfo}>
            <span style={styles.author}>👤 {post.author?.name || 'Usuario'}</span>
            <span style={styles.timestamp}>
              🕒 {formatRelativeTime(post.createdAt)}
            </span>
          </div>
          <span style={styles.category}>
            📁 {post.category?.name || 'General'}
          </span>
        </div>

        {/* Título y contenido */}
        <h1 style={styles.postTitle}>{post.title}</h1>
        <div style={styles.postContent}>
          {post.content}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={styles.tags}>
            {post.tags.map((tag, index) => (
              <span key={index} style={styles.tag}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Estadísticas */}
        <div style={styles.postStats}>
          <span>❤️ {post.likes?.length || 0} likes</span>
          <span>💬 {post.comments?.length || 0} comentarios</span>
          <span>👁️ {post.viewCount || 0} vistas</span>
        </div>

        {/* Botones de interacción */}
        <div style={styles.interactionButtons}>
          <button 
            onClick={handleLike}
            style={post.likes?.includes(user?._id) ? styles.likeButtonActive : styles.likeButton}
          >
            ❤️ {post.likes?.length || 0}
          </button>
          
          <button style={styles.commentButton}>
            💬 {post.comments?.length || 0}
          </button>
        </div>

        {/* Sección de comentarios */}
        <div style={styles.commentsSection}>
          <h3>💬 Comentarios</h3>
          
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment, index) => (
              <div key={index} style={styles.comment}>
                <div style={styles.commentHeader}>
                  <strong>{comment.user?.name || 'Usuario'}:</strong>
                  <span>{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <p style={styles.commentText}>{comment.content}</p>
              </div>
            ))
          ) : (
            <p style={styles.noComments}>Aún no hay comentarios. ¡Sé el primero en comentar!</p>
          )}

          {/* Formulario para nuevo comentario */}
          {user && (
            <div style={styles.commentForm}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe tu comentario..."
                style={styles.commentInput}
                rows="3"
              />
              <button 
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                style={styles.submitCommentButton}
              >
                📤 Enviar comentario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Estilos (mantén los que ya tienes, solo asegúrate de que estén completos)
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    background: '#1a1a1a',
    minHeight: '100vh',
    color: 'white',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  backButton: {
    padding: '10px 20px',
    background: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  authorActions: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    padding: '10px 15px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '10px 15px',
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#888',
  },
  error: {
    background: '#442222',
    color: '#ff6b6b',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '20px',
    border: '1px solid #ff6b6b',
  },
  postCard: {
    background: '#292929',
    padding: '30px',
    borderRadius: '12px',
    border: '1px solid #333',
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  author: {
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  timestamp: {
    fontSize: '14px',
    color: '#888',
  },
  category: {
    background: '#444',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#ccc',
  },
  postTitle: {
    fontSize: '28px',
    margin: '0 0 20px 0',
    color: '#fff',
    lineHeight: '1.3',
  },
  postContent: {
    color: '#e0e0e0',
    lineHeight: '1.6',
    fontSize: '16px',
    marginBottom: '20px',
    whiteSpace: 'pre-wrap',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
  },
  tag: {
    background: '#555',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#ccc',
  },
  postStats: {
    display: 'flex',
    gap: '20px',
    fontSize: '14px',
    color: '#888',
    marginBottom: '20px',
    padding: '15px 0',
    borderTop: '1px solid #333',
    borderBottom: '1px solid #333',
  },
  interactionButtons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
  },
  likeButton: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid #555',
    borderRadius: '20px',
    color: '#888',
    cursor: 'pointer',
  },
  likeButtonActive: {
    padding: '10px 20px',
    background: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid #ff4444',
    borderRadius: '20px',
    color: '#ff4444',
    cursor: 'pointer',
  },
  commentButton: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid #555',
    borderRadius: '20px',
    color: '#888',
    cursor: 'pointer',
  },
  commentsSection: {
    borderTop: '1px solid #333',
    paddingTop: '20px',
  },
  comment: {
    background: '#333',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
    fontSize: '14px',
  },
  commentText: {
    color: '#e0e0e0',
    margin: 0,
  },
  noComments: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px',
  },
  commentForm: {
    marginTop: '20px',
  },
  commentInput: {
    width: '100%',
    padding: '12px',
    background: '#1a1a1a',
    border: '1px solid #444',
    borderRadius: '6px',
    color: 'white',
    marginBottom: '10px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  submitCommentButton: {
    padding: '10px 20px',
    background: '#8d8d8d',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
  },
};