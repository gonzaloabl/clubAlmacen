import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { postAPI } from '../../services/api';
import { formatRelativeTime } from '../../utils/helpers';
import { UserAvatar } from '../common/UserAvatar'; // 1. Importamos el componente
import styles from './PostDetail.module.css';

export function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const hasLoaded = useRef(false);

  // Cargar Datos
  const loadPostData = async () => {
    try {
      const [viewRes, postData] = await Promise.all([
        postAPI.registerView(id),
        postAPI.getById(id)
      ]);
      setPost(postData);
    } catch (err) {
      console.error("Error cargando post:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadPostData();
    }
  }, [id]);

  // --- ACCIONES ---
  const handleLike = async () => {
    if (!user) return alert('Debes iniciar sesión para dar like');
    try {
      await postAPI.like(post._id);
      const updated = await postAPI.getById(id);
      setPost(updated);
    } catch (error) {
      console.error("Error like:", error);
    }
  };

  const handleReport = async () => {
    if (!user) return alert('Debes iniciar sesión para reportar');
    const reason = prompt("¿Por qué reportas este contenido?");
    if (reason) {
      try {
        await postAPI.report(post._id, { reason: 'other', description: reason });
        alert('✅ Reporte enviado.');
      } catch (error) {
        alert('❌ Error al reportar.');
      }
    }
  };

  const handleDelete = async () => {
    if(!window.confirm("¿Borrar este tema permanentemente?")) return;
    try {
      await postAPI.delete(post._id);
      alert('✅ Eliminado.');
      navigate('/forum');
    } catch (error) {
      alert('❌ No tienes permisos.');
    }
  };

  const canDelete = (postAuthorId) => {
    if (!user) return false;
    if (user._id === postAuthorId) return true;
    if (user.role === 'admin') {
        if (user.adminRole === 'superadmin') return true;
        if (user.adminRole === 'regional') return true;
    }
    return false;
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await postAPI.addComment(post._id, { content: commentText });
      setCommentText('');
      const updatedPost = await postAPI.getById(id);
      setPost(updatedPost);
    } catch (error) {
      console.error("Error comentario:", error);
    }
  };

  // --- COMPONENTE INTERNO DE MENSAJE ---
  const ThreadMessage = ({ author, content, date, role, isOriginalPost, authorId }) => (
    <div className={styles.messageCard}>
      
      {/* LADO IZQUIERDO: AUTOR */}
      <div className={styles.authorSide}>
        
        {/* ✅ AQUÍ USAMOS EL COMPONENTE (Sin código duplicado) */}
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '10px'}}>
           <UserAvatar user={author} size="80px" fontSize="2rem" />
        </div>

        <span className={styles.authorName}>{author?.name || 'Usuario'}</span>
        <span className={styles.authorRole}>
            {author?.role === 'admin' ? `Admin ${author.adminRole || ''}` : (role || 'Miembro')}
        </span>
        
        {author?.region && (
            <div style={{fontSize:'0.75rem', marginTop:'5px', color:'var(--text-muted)'}}>
                📍 {author.region}
            </div>
        )}
      </div>

      {/* LADO DERECHO: CONTENIDO */}
      <div className={styles.contentSide}>
        <div className={styles.messageMeta}>
          <span>{formatRelativeTime(date)}</span>
          <span>#{isOriginalPost ? '1' : ''}</span>
        </div>
        
        <div className={styles.messageBody}>
          {content}
        </div>
        
        <div className={styles.messageActions}>
          {isOriginalPost && (
             <button className={styles.actionBtn} onClick={handleLike}>
               {post.likes?.includes(user?._id) ? '❤️' : '🤍'} {post.likes?.length || 0} Me gusta
             </button>
          )}
          
          <button className={styles.actionBtn} onClick={handleReport}>🚩 Reportar</button>

          {isOriginalPost && canDelete(authorId) && (
             <button className={styles.actionBtn} style={{color:'var(--danger)'}} onClick={handleDelete}>
                🗑️ Borrar
             </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Cargando...</div>;
  if (!post) return <div style={{padding:'50px', textAlign:'center'}}>No encontrado.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.threadHeader}>
        <div className={styles.headerContent}>
          <span className={styles.categoryLabel}>📁 {post.category?.name || 'General'}</span>
          <h1 className={styles.threadTitle}>{post.title}</h1>
          {post.region && post.region !== 'Nacional' && (
              <span style={{fontSize:'0.9rem', opacity: 0.8, display:'block', marginTop:'5px'}}>📍 Región: {post.region}</span>
          )}
        </div>
      </div>

      <div className={styles.layoutGrid}>
        <div className={styles.threadColumn}>
          {/* Post Principal */}
          <ThreadMessage 
            author={post.author}
            role={post.author?.role}
            content={post.content}
            date={post.createdAt}
            isOriginalPost={true}
            authorId={post.author?._id} 
          />

          {/* Comentarios */}
          {post.comments?.map((comment, index) => (
            <ThreadMessage 
              key={index}
              author={comment.user}
              role={comment.user?.role}
              content={comment.content}
              date={comment.createdAt}
              isOriginalPost={false}
            />
          ))}

          {/* Formulario Respuesta */}
          {user ? (
            <div className={styles.replySection}>
              <h3 className={styles.replyTitle}>Responder</h3>
              <textarea 
                className={styles.replyInput}
                placeholder="Escribe tu respuesta aquí..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button className={styles.submitBtn} onClick={handleAddComment}>Publicar Respuesta</button>
            </div>
          ) : (
            <div className={styles.widget} style={{textAlign:'center'}}>
              <p>Debes iniciar sesión para responder.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.widget} onClick={() => navigate('/forum')} style={{cursor:'pointer', fontWeight:'bold', color:'var(--accent)'}}>
             ← Volver al Foro
          </div>
          <div className={styles.widget}>
            <strong>Estadísticas</strong>
            <ul style={{listStyle:'none', padding:0, marginTop:'10px', fontSize:'0.9rem', color:'var(--text-muted)'}}>
               <li>👀 Vistas: {post.viewCount}</li>
               <li>💬 Respuestas: {post.comments?.length || 0}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}