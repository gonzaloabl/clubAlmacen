import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/api';

export function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
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

    loadPosts();
  }, []);

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
              <div key={post._id} style={styles.postCard}>
                <h3 style={styles.postTitle}>{post.title}</h3>
                <div style={styles.postMeta}>
                  <span style={styles.author}>👤 {post.author?.name || 'Usuario'}</span>
                  <span style={styles.category}>
                    📁 {post.category?.name || 'General'}
                  </span>
                  <span style={styles.date}>
                    📅 {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={styles.postContent}>
                  {post.content.length > 150 
                    ? `${post.content.substring(0, 150)}...` 
                    : post.content
                  }
                </p>
                <div style={styles.postStats}>
                  <span>❤️ {post.likes?.length || 0} likes</span>
                  <span>💬 {post.comments?.length || 0} comentarios</span>
                  <span>👁️ {post.viewCount || 0} vistas</span>
                </div>
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
    padding: '20px',
    background: '#1a1a1a',
    minHeight: '100vh',
    color: 'white',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '20px',
    background: '#292929',
    borderRadius: '12px',
  },
  createButton: {
    display: 'inline-block',
    padding: '12px 25px',
    background: '#8d8d8d',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    marginTop: '15px',
    transition: 'background 0.3s',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    padding: '40px',
    color: '#888',
  },
  error: {
    background: '#442222',
    color: '#ff6b6b',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #ff6b6b',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#888',
  },
  postsContainer: {
    marginTop: '20px',
  },
  postsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  postCard: {
    background: '#292929',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #333',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  postTitle: {
    margin: '0 0 15px 0',
    color: '#fff',
    fontSize: '1.4rem',
  },
  postMeta: {
    display: 'flex',
    gap: '20px',
    marginBottom: '15px',
    fontSize: '14px',
    color: '#aaa',
    flexWrap: 'wrap',
  },
  postContent: {
    color: '#e0e0e0',
    lineHeight: '1.6',
    marginBottom: '15px',
  },
  postStats: {
    display: 'flex',
    gap: '20px',
    fontSize: '14px',
    color: '#888',
  },
};

// Efectos hover
styles.createButton[':hover'] = {
  background: '#575656',
};

styles.postCard[':hover'] = {
  transform: 'translateY(-2px)',
  borderColor: '#8d8d8d',
};