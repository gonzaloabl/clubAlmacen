import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { postAPI } from '../../services/api';
import { formatRelativeTime } from '../../utils/helpers';
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
        postAPI.registerView(id), // Registrar vista
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

  // --- 🟢 1. FUNCIONALIDAD: DAR LIKE ---
  const handleLike = async () => {
    if (!user) return alert('Debes iniciar sesión para dar like');
    try {
      await postAPI.like(post._id);
      // Recargar solo el post para actualizar contador visualmente
      const updated = await postAPI.getById(id);
      setPost(updated);
    } catch (error) {
      console.error("Error like:", error);
    }
  };

  // --- 🟢 2. FUNCIONALIDAD: REPORTAR ---
  const handleReport = async () => {
    if (!user) return alert('Debes iniciar sesión para reportar');
    
    const reason = prompt("¿Por qué reportas este contenido? (spam, inapropiado, ofensivo)");
    if (reason) {
      try {
        await postAPI.report(post._id, { reason: 'other', description: reason });
        alert('✅ Reporte enviado al equipo de moderación.');
      } catch (error) {
        alert('❌ Ya has reportado esta publicación o ocurrió un error.');
      }
    }
  };

  // --- 🟢 3. FUNCIONALIDAD: ELIMINAR (AUTOR + ADMINS) ---
  const handleDelete = async () => {
    if(!window.confirm("¿Estás seguro de borrar este tema permanentemente? No se puede deshacer.")) return;
    
    try {
      await postAPI.delete(post._id);
      alert('✅ Publicación eliminada.');
      navigate('/forum'); // Volver al listado
    } catch (error) {
      console.error(error);
      alert('❌ Error: No tienes permisos para borrar esto.');
    }
  };

  // Helper: ¿Puede este usuario borrar el post?
  const canDelete = (postAuthorId) => {
    if (!user) return false;
    
    // 1. Es el dueño del post
    if (user._id === postAuthorId) return true; 
    
    // 2. Es Administrador
    if (user.role === 'admin') {
        if (user.adminRole === 'superadmin') return true; // Dios borra todo
        if (user.adminRole === 'regional') return true;   // Regional (el backend validará si es SU región)
    }
    return false;
  };

  // Manejar Nuevo Comentario
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await postAPI.addComment(post._id, { content: commentText });
      setCommentText('');
      // Recargar para ver el comentario nuevo
      const updatedPost = await postAPI.getById(id);
      setPost(updatedPost);
    } catch (error) {
      console.error("Error enviando comentario:", error);
    }
  };

  // Componente interno para renderizar un "Mensaje"
  // Ahora recibe 'authorId' para validar permisos
  const ThreadMessage = ({ author, content, date, role, isOriginalPost, authorId }) => (
    <div className={styles.messageCard}>
      {/* Lado Izquierdo: Autor */}
      <div className={styles.authorSide}>
        <div className={styles.avatarLarge}>
          {author?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <span className={styles.authorName}>{author?.name || 'Usuario'}</span>
        <span className={styles.authorRole}>{role || 'Miembro'}</span>
      </div>

      {/* Lado Derecho: Contenido */}
      <div className={styles.contentSide}>
        <div className={styles.messageMeta}>
          <span>{formatRelativeTime(date)}</span>
          <span>#{isOriginalPost ? '1' : ''}</span>
        </div>
        <div className={styles.messageBody}>
          {content}
        </div>
        
        <div className={styles.messageActions}>
          {/* Like: Solo en post principal (opcional) */}
          {isOriginalPost && (
             <button className={styles.actionBtn} onClick={handleLike}>
               {post.likes?.includes(user?._id) ? '❤️' : '🤍'} {post.likes?.length || 0} Me gusta
             </button>
          )}
          
          {/* Reportar */}
          <button className={styles.actionBtn} onClick={handleReport}>
            🚩 Reportar
          </button>

          {/* Eliminar: Solo si tiene permisos */}
          {isOriginalPost && canDelete(authorId) && (
             <button 
               className={styles.actionBtn} 
               style={{color:'var(--danger)', fontWeight:'bold'}} 
               onClick={handleDelete}
             >
                🗑️ Borrar Tema
             </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Cargando conversación...</div>;
  if (!post) return <div style={{padding:'50px', textAlign:'center'}}>Publicación no encontrada.</div>;

  return (
    <div className={styles.container}>
      
      {/* HEADER DEL TEMA */}
      <div className={styles.threadHeader}>
        <div className={styles.headerContent}>
          <span className={styles.categoryLabel}>📁 {post.category?.name || 'General'}</span>
          <h1 className={styles.threadTitle}>{post.title}</h1>
        </div>
      </div>

      <div className={styles.layoutGrid}>
        
        {/* COLUMNA DEL HILO (Izquierda) */}
        <div className={styles.threadColumn}>
          
          {/* 1. EL POST ORIGINAL */}
          <ThreadMessage 
            author={post.author}
            role={post.author?.role === 'admin' ? `Admin ${post.author?.adminRole || ''}` : post.author?.role}
            content={post.content}
            date={post.createdAt}
            isOriginalPost={true}
            authorId={post.author?._id} // Pasamos ID para validar borrado
          />

          {/* 2. LOS COMENTARIOS */}
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

          {/* 3. CAJA DE RESPUESTA */}
          {user ? (
            <div className={styles.replySection}>
              <h3 className={styles.replyTitle}>Responder al tema</h3>
              <textarea 
                className={styles.replyInput}
                placeholder="Escribe tu respuesta aquí..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button className={styles.submitBtn} onClick={handleAddComment}>
                Publicar Respuesta
              </button>
            </div>
          ) : (
            <div className={styles.widget} style={{textAlign:'center'}}>
              <p>Debes iniciar sesión para responder.</p>
              <Link to="/login" style={{color:'var(--accent)', fontWeight:'bold'}}>Ir al Login</Link>
            </div>
          )}

        </div>

        {/* SIDEBAR (Derecha) */}
        <aside className={styles.sidebar}>
          <Link to="/forum" className={styles.backBtn}>← Volver a la lista</Link>
          
          <div className={styles.widget}>
            <strong>Estadísticas del Tema</strong>
            <ul style={{listStyle:'none', padding:0, marginTop:'15px', fontSize:'0.9rem', color:'var(--text-muted)'}}>
               <li style={{marginBottom:'5px'}}>👀 Vistas: {post.viewCount}</li>
               <li style={{marginBottom:'5px'}}>💬 Respuestas: {post.comments?.length || 0}</li>
               <li>📅 Creado: {new Date(post.createdAt).toLocaleDateString()}</li>
            </ul>
          </div>

          <div className={styles.widget}>
             <p style={{fontSize:'0.9rem', color:'var(--text-muted)', margin:0}}>
               Recuerda mantener el respeto en la comunidad. Si ves algo inapropiado, repórtalo.
             </p>
          </div>
        </aside>

      </div>
    </div>
  );
}