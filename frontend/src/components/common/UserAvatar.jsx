import { useState } from 'react';

export function UserAvatar({ user, size = '40px', fontSize = '1.2rem' }) {
  const [imgError, setImgError] = useState(false);

  const hasAvatar = user?.avatar && !imgError;

  const styles = {
    container: {
      width: size,
      height: size,
      borderRadius: '50%',
      background: hasAvatar ? 'transparent' : 'var(--accent)', // Color de fondo para la inicial
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: fontSize,
      overflow: 'hidden',
      flexShrink: 0, // Evita que se aplaste
      border: '1px solid rgba(0,0,0,0.1)'
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  };

  return (
    <div style={styles.container}>
      {hasAvatar ? (
        <img 
          src={user.avatar} 
          alt={user.name?.charAt(0)} 
          style={styles.img}
          onError={() => setImgError(true)} // Si falla, activa el error para mostrar la inicial
        />
      ) : (
        <span>{user?.name?.charAt(0).toUpperCase() || '?'}</span>
      )}
    </div>
  );
}