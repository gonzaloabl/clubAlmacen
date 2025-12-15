import { getKarmaRank } from '../../utils/karma'; // Asegúrate de tener utils/karma.js creado
import styles from './KarmaWidget.module.css';

export function KarmaWidget({ user }) {
  if (!user) return null;

  const rank = getKarmaRank(user.karma || 0);

  return (
    <div className={styles.widgetContainer} style={{ borderLeftColor: rank.color }}>
      <div className={styles.iconSide} style={{ backgroundColor: rank.color }}>
        <span className={styles.rankIcon}>{rank.icon}</span>
      </div>
      
      <div className={styles.infoSide}>
        <h4 className={styles.title}>Tu Reputación</h4>
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.value} style={{ color: rank.color }}>{user.karma || 0}</span>
            <span className={styles.label}>Puntos de Karma</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.rankName}>{rank.name}</span>
            <span className={styles.label}>Rango Actual</span>
          </div>
        </div>
      </div>
    </div>
  );
}