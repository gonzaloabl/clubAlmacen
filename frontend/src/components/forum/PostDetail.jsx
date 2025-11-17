import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
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

              <div style={styles.loginToComment}>
                <p>Debes <Link to="/login" style={styles.loginLink}>iniciar sesión</Link> para poder comentar.</p>
              </div>

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
    padding: 'clamp(10px, 3vw, 20px)',
    background: '#1a1a1a',
    minHeight: '100vh',
    color: 'white',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'clamp(20px, 4vw, 30px)',
    flexWrap: 'wrap',
    gap: '15px',
  },
  backButton: {
    padding: 'clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px)',
    background: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: 'clamp(14px, 3vw, 16px)',
  },
  authorActions: {
    display: 'flex',
    gap: 'clamp(5px, 2vw, 10px)',
    flexWrap: 'wrap',
  },
  editButton: {
    padding: 'clamp(8px, 2vw, 10px) clamp(12px, 2.5vw, 15px)',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
  },
  deleteButton: {
    padding: 'clamp(8px, 2vw, 10px) clamp(12px, 2.5vw, 15px)',
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
  },
  postContent: {
    background: '#292929',
    padding: 'clamp(20px, 4vw, 30px)',
    borderRadius: '12px',
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'clamp(15px, 3vw, 20px)',
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
    fontSize: 'clamp(14px, 3vw, 16px)',
  },
  timestamp: {
    color: '#888',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
  },
  category: {
    background: '#444',
    padding: 'clamp(4px, 1vw, 5px) clamp(8px, 2vw, 10px)',
    borderRadius: '6px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
  },
  postTitle: {
    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
    margin: '0 0 clamp(15px, 3vw, 20px) 0',
    color: '#fff',
    lineHeight: '1.3',
  },
  postBody: {
    fontSize: 'clamp(14px, 3vw, 16px)',
    lineHeight: '1.6',
    color: '#e0e0e0',
    marginBottom: 'clamp(15px, 3vw, 20px)',
    whiteSpace: 'pre-wrap',
  },
  stats: {
    display: 'flex',
    gap: 'clamp(15px, 3vw, 20px)',
    padding: 'clamp(10px, 2vw, 15px) 0',
    borderTop: '1px solid #333',
    borderBottom: '1px solid #333',
    marginBottom: 'clamp(15px, 3vw, 20px)',
    color: '#888',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    flexWrap: 'wrap',
  },
  actions: {
    display: 'flex',
    gap: 'clamp(8px, 2vw, 10px)',
    marginBottom: 'clamp(20px, 4vw, 30px)',
    flexWrap: 'wrap',
  },
  likeButton: {
    padding: 'clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px)',
    background: 'transparent',
    border: '1px solid #555',
    borderRadius: '20px',
    color: '#888',
    cursor: 'pointer',
    fontSize: 'clamp(14px, 3vw, 16px)',
  },
  likeButtonActive: {
    padding: 'clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px)',
    background: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid #ff4444',
    borderRadius: '20px',
    color: '#ff4444',
    cursor: 'pointer',
    fontSize: 'clamp(14px, 3vw, 16px)',
  },
  commentButton: {
    padding: 'clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px)',
    background: 'transparent',
    border: '1px solid #555',
    borderRadius: '20px',
    color: '#888',
    cursor: 'pointer',
    fontSize: 'clamp(14px, 3vw, 16px)',
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
  loginToComment: {
  textAlign: 'center',
  padding: '20px',
  background: '#333',
  borderRadius: '8px',
  margin: '20px 0',
},
loginLink: {
  color: '#8d8d8d', // (o tu color de acento)
  fontWeight: 'bold',
}
};