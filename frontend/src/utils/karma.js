export const getKarmaRank = (karma) => {
  if (karma < 0) return { name: 'Sancionado', color: 'var(--danger)', icon: '🚫' };
  if (karma < 10) return { name: 'Recién Llegado', color: 'var(--text-muted)', icon: '🐣' };
  if (karma < 50) return { name: 'Colaborador', color: '#3498db', icon: '👍' };
  if (karma < 250) return { name: 'Experto Local', color: '#2ecc71', icon: '⭐' };
  if (karma < 1000) return { name: 'Líder Comunitario', color: '#e67e22', icon: '🏆' };
  if (karma >= 1000) return { name: 'Leyenda', color: '#f1c40f', icon: '👑' };
  return { name: 'Invitado', color: 'var(--text-muted)', icon: '👤' };
};