import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { postAPI } from '../../services/api';
import { formatRelativeTime } from '../../utils/helpers';
import { UserAvatar } from '../common/UserAvatar';
import { getKarmaRank } from '../../utils/karma';
import styles from './PostDetail.module.css';

export function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const hasLoaded = useRef(false);

  const loadPostData = async () => {
    try {
      // Registrar vista y obtener datos en paralelo
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

  // --- ACCIONES NUEVAS ---

  // 1. VOTAR EN EL POST PRINCIPAL (Up/Down)
  const handleVote = async (value) => {
    if (!user) return alert('Debes iniciar sesión para votar');
    try {
      // Optimismo UI: Podríamos actualizar el estado localmente antes, 
      // pero por seguridad esperamos la respuesta del backend que ya calcula la matemática.
      const response = await postAPI.vote(post._id, value);
      
      // Actualizamos solo los campos necesarios del post
      setPost(prev => ({ 
          ...prev, 
          score: response.score, 
          votes: response.votes 
      }));
    } catch (error) {
      console.error("Error al votar:", error);
    }
  };

  // 2. LIKE EN COMENTARIO
  const handleCommentLike = async (commentId) => {
    if (!user) return alert('Debes iniciar sesión');
    try {
      const updatedLikes = await postAPI.likeComment(post._id, commentId);
      
      // Actualizamos el comentario específico en el estado
      setPost(prev => ({
        ...prev,
        comments: prev.comments.map(c => 
          c._id === commentId ? { ...c, likes: updatedLikes } : c
        )
      }));
    } catch (error) {
      console.error("Error like comentario:", error);
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

  // --- COMPONENTE INTERNO (ACTUALIZADO) ---
  const ThreadMessage = ({ data, isOriginalPost }) => {
    const author = isOriginalPost ? data.author : data.user;

    // 🆕 Obtener Karma y Rango
    const authorKarma = author?.karma || 0;
    const rank = getKarmaRank(authorKarma);
    
    // Lógica para saber mi voto actual (si soy el post original)
    const myVote = isOriginalPost 
        ? data.votes?.find(v => v.user === user?._id)?.value 
        : 0;

    return (
      <div className={styles.messageCard}>
        
        {/* LADO IZQUIERDO: Votación (Solo Post) o Avatar */}
        <div className={styles.leftSide}>
            
            {/* Si es Post Original -> Votación Estilo Reddit */}
            {isOriginalPost ? (
                <div className={styles.voteContainer}>
                    <button 
                        className={`${styles.voteBtn} ${myVote === 1 ? styles.upActive : ''}`}
                        onClick={() => handleVote(1)}
                    >
                        ▲
                    </button>
                    <span className={`${styles.score} ${myVote === 1 ? styles.orange : (myVote === -1 ? styles.blue : '')}`}>
                        {data.score || 0}
                    </span>
                    <button 
                        className={`${styles.voteBtn} ${myVote === -1 ? styles.downActive : ''}`}
                        onClick={() => handleVote(-1)}
                    >
                        ▼
                    </button>
                </div>
            ) : (
                // Si es comentario -> Avatar normal
                <div style={{marginBottom: '10px'}}>
                   <UserAvatar user={author} size="50px" fontSize="1.2rem" />
                </div>
            )}

            {/* Avatar del autor del post (si es original, va debajo de los votos o al lado en mobile) */}
            {isOriginalPost && (
                <div className={styles.originalPosterAvatar}>
                    <UserAvatar user={author} size="60px" fontSize="1.5rem" />
                </div>
            )}
        </div>

        {/* LADO DERECHO: CONTENIDO */}
        <div className={styles.contentSide}>
          <div className={styles.messageMeta}>
            <span className={styles.authorName}>
                {author?.name || 'Usuario'} 
                {/* 🏆 Insignia de Rango al lado del nombre */}
                {rank && <span className={styles.karmaBadge} style={{backgroundColor: rank.color}}>
                    {rank.icon} {rank.name}
                </span>}

                {/* Badges de Role (se mantienen) */}
                {author?.role === 'admin' && <span className={styles.badgeAdmin}>ADMIN</span>}
                {author?.role === 'proveedor' && <span className={styles.badgeProv}>PROV</span>}
            </span>
            <span className={styles.date}>
                {formatRelativeTime(data.createdAt)}
            </span>
          </div>
          
          <div className={styles.messageBody}>
            {data.content}
          </div>

          {isOriginalPost && data.image && (
              <div className={styles.messageImageContainer}>
                  <img src={data.image} alt="Adjunto" className={styles.messageImage} onClick={() => window.open(data.image, '_blank')} />
              </div>
          )}
          
          <div className={styles.messageActions}>
            
            {/* Si es comentario -> Botón de Like */}
            {!isOriginalPost && (
                <button className={styles.actionBtn} onClick={() => handleCommentLike(data._id)}>
                    {data.likes?.includes(user?._id) ? '❤️' : '🤍'} {data.likes?.length || 0}
                </button>
            )}
            
            <button className={styles.actionBtn} onClick={() => isOriginalPost ? handleReport() : null}>
                🚩 Reportar
            </button>

            {isOriginalPost && canDelete(author._id) && (
               <button className={styles.actionBtn} style={{color:'var(--danger)'}} onClick={handleDelete}>
                    🗑️ Borrar
               </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Cargando...</div>;
  if (!post) return <div style={{padding:'50px', textAlign:'center'}}>No encontrado.</div>;

  return (
    <div className={styles.container}>
      {/* ... Header igual ... */}
      <div className={styles.threadHeader}>
        <div className={styles.headerContent}>
          <span className={styles.categoryLabel}>📁 {post.category?.name}</span>
          <h1 className={styles.threadTitle}>{post.title}</h1>
        </div>
      </div>

      <div className={styles.layoutGrid}>
        <div className={styles.threadColumn}>
          
          {/* Post Principal */}
          <ThreadMessage 
            data={post} 
            isOriginalPost={true} 
          />

          {/* Comentarios */}
          {post.comments?.map((comment) => (
            <ThreadMessage 
              key={comment._id}
              data={comment}
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
           {/* ... Igual que antes ... */}
           <div className={styles.widget} onClick={() => navigate('/forum')} style={{cursor:'pointer'}}>
             ← Volver al Foro
           </div>
        </aside>
      </div>
    </div>
  );
}