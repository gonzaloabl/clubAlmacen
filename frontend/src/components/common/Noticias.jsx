import styles from './Noticias.module.css';

export function Noticias() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>📰 Últimas Noticias</h1>
        <p className={styles.subtitle}>
          Mantente informado sobre las últimas novedades de nuestra comunidad
        </p>
        
        <div className={styles.newsGrid}>
          <div className={styles.newsCard}>
            <div className={styles.newsDate}>Hoy</div>
            <h3 className={styles.newsTitle}>¡Nueva actualización del foro!</h3>
            <p className={styles.newsContent}>
              Hemos mejorado la experiencia de usuario con nuevas funciones 
              y un diseño más intuitivo.
            </p>
          </div>
          
          <div className={styles.newsCard}>
            <div className={styles.newsDate}>Ayer</div>
            <h3 className={styles.newsTitle}>Evento comunitario próximo</h3>
            <p className={styles.newsContent}>
              Próximamente organizaremos un evento virtual para todos 
              los miembros de la comunidad.
            </p>
          </div>
          
          <div className={styles.newsCard}>
            <div className={styles.newsDate}>15 Mar</div>
            <h3 className={styles.newsTitle}>Bienvenida a nuevos miembros</h3>
            <p className={styles.newsContent}>
              Esta semana hemos dado la bienvenida a más de 50 nuevos 
              miembros a nuestra comunidad.
            </p>
          </div>
        </div>
        
        <div className={styles.comingSoon}>
          <h3>🚧 Más noticias próximamente...</h3>
          <p>Estamos trabajando para traerte contenido fresco regularmente.</p>
        </div>
      </div>
    </div>
  );
}