import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';  // ✅ CORREGIDO
import styles from './LandingPage.module.css';  // ✅ IMPORTADO CSS Module

export function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: "💬",
      title: "Discusiones Activas",
      description: "Participa en conversaciones vibrantes sobre tus temas favoritos con una comunidad activa y amigable."
    },
    {
      icon: "👥",
      title: "Comunidad Unida",
      description: "Conecta con personas que comparten tus intereses y pasiones en un ambiente acogedor."
    },
    {
      icon: "🚀",
      title: "Crecimiento Personal",
      description: "Aprende, comparte conocimientos y crece junto a otros miembros de la comunidad."
    },
    {
      icon: "🔒",
      title: "Espacio Seguro",
      description: "Un ambiente respetuoso donde todos pueden expresarse libremente y sentirse cómodos."
    }
  ];

  const recentActivities = [
    {
      content: "¡Acabamos de alcanzar los 1000 miembros en nuestra comunidad! 🎉",
      author: "Admin",
      time: "Hace 2 horas"
    },
    {
      content: "Nuevo debate: ¿Cuáles son tus hobbies favoritos para el fin de semana?",
      author: "María",
      time: "Hace 5 horas"
    },
    {
      content: "Bienvenid@s a los nuevos miembros que se unieron esta semana 👋",
      author: "Moderador",
      time: "Hace 1 día"
    }
  ];

  return (
    <div className={styles.container}>
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroIcon}>🏪</div>
          <h1 className={styles.heroTitle}>
            Bienvenido a tu comunidad
          </h1>
          <p className={styles.heroSubtitle}>
            Un espacio cálido para compartir ideas, hacer amigos y crecer juntos. 
            Donde cada voz importa y cada miembro es valorado.
          </p>
          
          <div className={styles.ctaButtons}>
            {user ? (
              <Link to="/forum" className={styles.primaryButton}>
                🏠 Ir al Foro
              </Link>
            ) : (
              <>
                <Link to="/login" className={styles.primaryButton}>
                  🚀 Unirse a la Comunidad
                </Link>
                <Link to="/forum" className={styles.secondaryButton}>
                  👀 Explorar Como Invitado
                </Link>
              </>
            )}
          </div>

          {/* Community Stats */}
          <div className={styles.communityStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>1.2K+</span>
              <span className={styles.statLabel}>Miembros</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>458</span>
              <span className={styles.statLabel}>Discusiones</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>2.3K</span>
              <span className={styles.statLabel}>Mensajes</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>Activo</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>¿Por qué unirte a nuestra comunidad?</h2>
          <p className={styles.sectionSubtitle}>
            Descubre todo lo que hace especial a nuestro foro comunitario
          </p>
          
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className={styles.recentActivity}>
          <h3 className={styles.activityTitle}>Actividad Reciente</h3>
          <div className={styles.activityGrid}>
            {recentActivities.map((activity, index) => (
              <div key={index} className={styles.activityCard}>
                <p className={styles.activityContent}>{activity.content}</p>
                <div className={styles.activityMeta}>
                  <span>Por: {activity.author}</span>
                  <span>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '20px' }}>
            {user ? '¿Listo para participar?' : '¿Qué esperas para unirte?'}
          </h3>
          {user ? (
            <Link to="/forum/create" className={styles.primaryButton}>
              ✏️ Empezar una Discusión
            </Link>
          ) : (
            <Link to="/login" className={styles.primaryButton}>
              🎉 Unirme Ahora
            </Link>
          )}
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>© 2024 Club Almacen - Foro Comunitario. Hecho con ❤️ para la comunidad.</p>
        </footer>
      </main>
    </div>
  );
}

// ✅ ELIMINADO: Todo el objeto styles y los hovers del final