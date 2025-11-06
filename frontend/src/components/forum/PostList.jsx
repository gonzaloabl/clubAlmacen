import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Agregar useNavigate
import { useAuth } from '../../hooks/useAuth';
import { postAPI } from '../../services/api';
import { formatRelativeTime } from '../../utils/helpers';

export function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePost, setActivePost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showReportModal, setShowReportModal] = useState(null);
  const [reportReason, setReportReason] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate(); // Inicializar navigate

  const loadPosts = async () => {
    try {
      const data = await postAPI.getAll();
      setPosts(data.posts || []);
    } catch (err) {
      setError('Error al cargar publicaciones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Función para manejar clic en una publicación
  const handlePostClick = (postId) => {
    navigate(`/forum/post/${postId}`);
  };

  // Función para evitar que el clic en botones propague al contenedor
  const handleButtonClick = (e, action) => {
    e.stopPropagation(); // Esto evita que el clic se propague al contenedor de la publicación
    action();
  };

  const handleLike = async (postId) => {
    if (!user) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    try {
      await postAPI.like(postId);
      loadPosts();
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      await postAPI.addComment(postId, { content: commentText });
      setCommentText('');
      setActivePost(null);
      loadPosts();
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  };

  const handleReport = async (postId) => {
    if (!reportReason) return;

    try {
      await postAPI.report(postId, { reason: reportReason });
      setReportReason('');
      setShowReportModal(null);
      alert('✅ Publicación reportada correctamente');
    } catch (error) {
      console.error('Error al reportar:', error);
    }
  };


  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Cargando publicaciones...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🏪 Foro de la Comunidad</h1>
        <p>Discute, comparte y conecta con otros miembros</p>
        
        {user && (
          <Link to="/forum/create" style={styles.createButton}>
            📝 Crear Publicación
          </Link>
        )}
      </div>

      {error && (
        <div style={styles.error}>
          ❌ {error}
        </div>
      )}

      <div style={styles.postsContainer}>
        {posts.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>📭 No hay publicaciones aún</h3>
            <p>Sé el primero en crear una publicación y empezar la conversación</p>
            {user && (
              <Link to="/forum/create" style={styles.createButton}>
                Crear Primera Publicación
              </Link>
            )}
          </div>
        ) : (
          <div style={styles.postsList}>
            {posts.map(post => (
              // Contenedor principal clickeable
              <div 
                key={post._id} 
                style={styles.postCard}
                onClick={() => handlePostClick(post._id)}
              >
                {/* Header con información del autor y tiempo */}
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

                {/* Contenido del post - clickeable */}
                <h3 style={styles.postTitle}>{post.title}</h3>
                <p style={styles.postContent}>
                  {post.content.length > 200 
                    ? `${post.content.substring(0, 200)}...` 
                    : post.content
                  }
                </p>

                {/* Estadísticas */}
                <div style={styles.postStats}>
                  <span>❤️ {post.likes?.length || 0} likes</span>
                  <span>💬 {post.comments?.length || 0} comentarios</span>
                  <span>👁️ {post.viewCount || 0} vistas</span>
                </div>

                {/* Botones de interacción - NO clickeables para navegación */}
                <div style={styles.interactionButtons}>
                  <button 
                    onClick={(e) => handleButtonClick(e, () => handleLike(post._id))}
                    style={post.likes?.includes(user?._id) ? styles.likeButtonActive : styles.likeButton}
                  >
                    ❤️ {post.likes?.length || 0}
                  </button>
                  
                  <button 
                    onClick={(e) => handleButtonClick(e, () => setActivePost(activePost === post._id ? null : post._id))}
                    style={styles.commentButton}
                  >
                    💬 Comentar
                  </button>

                  <button 
                    onClick={(e) => handleButtonClick(e, () => setShowReportModal(post._id))}
                    style={styles.reportButton}
                  >
                    🚩 Reportar
                  </button>
                </div>

                {/* Sección de comentarios (expandible) */}
                {activePost === post._id && (
                  <div style={styles.commentsSection} onClick={(e) => e.stopPropagation()}>
                    <h4 style={styles.commentsTitle}>💬 Comentarios ({post.comments?.length || 0})</h4>
                    
                    {post.comments?.length > 0 ? (
                      post.comments.map(comment => (
                        <div key={comment._id || comment.createdAt} style={styles.comment}>
                          <div style={styles.commentHeader}>
                            <strong style={styles.commentAuthor}>
                              {comment.user?.name || 'Usuario'}:
                            </strong>
                            <span style={styles.commentTime}>
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p style={styles.commentContent}>{comment.content}</p>
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
                          onClick={(e) => handleButtonClick(e, () => handleAddComment(post._id))}
                          style={styles.submitCommentButton}
                          disabled={!commentText.trim()}
                        >
                          📤 Enviar
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Modal de reporte */}
                {showReportModal === post._id && (
                  <div style={styles.modalOverlay} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.modal}>
                      <h3>🚩 Reportar Publicación</h3>
                      <p>¿Por qué quieres reportar esta publicación?</p>
                      
                      <select 
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        style={styles.reportSelect}
                      >
                        <option value="">Selecciona un motivo</option>
                        <option value="spam">Spam o publicidad no deseada</option>
                        <option value="inappropriate">Contenido inapropiado</option>
                        <option value="harassment">Acoso o discurso de odio</option>
                        <option value="other">Otro motivo</option>
                      </select>
                      
                      <div style={styles.modalButtons}>
                        <button 
                          onClick={(e) => handleButtonClick(e, () => setShowReportModal(null))}
                          style={styles.cancelButton}
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={(e) => handleButtonClick(e, () => handleReport(post._id))}
                          style={styles.confirmReportButton}
                          disabled={!reportReason}
                        >
                          Reportar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: 'clamp(10px, 3vw, 20px)',
    background: '#1a1a1a',
    minHeight: '100vh',
    color: 'white',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: 'clamp(20px, 5vw, 40px)',
    padding: 'clamp(15px, 4vw, 30px)',
    background: '#292929',
    borderRadius: '12px',
  },
  createButton: {
    display: 'inline-block',
    padding: 'clamp(10px, 3vw, 12px) clamp(15px, 4vw, 25px)',
    background: '#8d8d8d',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    marginTop: '15px',
    transition: 'background 0.3s',
    fontSize: 'clamp(14px, 3vw, 16px)',
  },
  postsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(15px, 3vw, 20px)',
  },
  postCard: {
    background: '#292929',
    padding: 'clamp(15px, 4vw, 25px)',
    borderRadius: '12px',
    border: '1px solid #333',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
  },
  postTitle: {
    margin: '0 0 15px 0',
    color: '#fff',
    fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
    lineHeight: '1.3',
  },
  postContent: {
    color: '#e0e0e0',
    lineHeight: '1.6',
    marginBottom: '15px',
    fontSize: 'clamp(14px, 3vw, 16px)',
  },
  postStats: {
    display: 'flex',
    gap: 'clamp(10px, 3vw, 20px)',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    color: '#888',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  interactionButtons: {
    display: 'flex',
    gap: 'clamp(5px, 2vw, 10px)',
    borderTop: '1px solid #333',
    paddingTop: '15px',
    flexWrap: 'wrap',
  },
  likeButton: {
    padding: 'clamp(6px, 2vw, 8px) clamp(10px, 3vw, 15px)',
    background: 'transparent',
    border: '1px solid #555',
    borderRadius: '20px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
  },
  likeButtonActive: {
    padding: 'clamp(6px, 2vw, 8px) clamp(10px, 3vw, 15px)',
    background: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid #ff4444',
    borderRadius: '20px',
    color: '#ff4444',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
  },
  commentButton: {
    padding: 'clamp(6px, 2vw, 8px) clamp(10px, 3vw, 15px)',
    background: 'transparent',
    border: '1px solid #555',
    borderRadius: '20px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
  },
  reportButton: {
    padding: 'clamp(6px, 2vw, 8px) clamp(10px, 3vw, 15px)',
    background: 'transparent',
    border: '1px solid #555',
    borderRadius: '20px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    marginLeft: 'auto',
  },
  // ... resto de estilos
};

