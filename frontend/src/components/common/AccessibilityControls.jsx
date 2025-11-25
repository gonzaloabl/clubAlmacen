import { useTheme } from '../../context/ThemeContext';

export function AccessibilityControls() {
  const { theme, toggleTheme, setFontSize, fontSize } = useTheme();

  return (
    <div style={styles.container}>
      {/* Botón Tema */}
      <button 
        onClick={toggleTheme} 
        style={styles.iconBtn} 
        title={theme === 'light' ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div style={styles.divider}></div>

      {/* Botones Fuente */}
      <div style={styles.fontGroup}>
        <button 
          onClick={() => setFontSize('normal')} 
          style={{
            ...styles.fontBtn, 
            fontWeight: fontSize === 'normal' ? 'bold' : 'normal',
            opacity: fontSize === 'normal' ? 1 : 0.6
          }}
          title="Tamaño Normal"
        >
          A
        </button>
        <button 
          onClick={() => setFontSize('xl')} 
          style={{
            ...styles.fontBtn, 
            fontSize: '1.2rem',
            fontWeight: fontSize === 'xl' ? 'bold' : 'normal',
            opacity: fontSize === 'xl' ? 1 : 0.6
          }}
          title="Tamaño Grande"
        >
          A+
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginRight: '15px',
    padding: '5px 10px',
    background: 'rgba(255,255,255,0.1)', // Transparente sutil
    borderRadius: '20px',
    border: '1px solid var(--border)'
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    padding: '5px',
    display: 'flex',
    alignItems: 'center'
  },
  divider: {
    width: '1px',
    height: '20px',
    background: 'rgba(255,255,255,0.3)',
    margin: '0 5px'
  },
  fontGroup: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '5px'
  },
  fontBtn: {
    background: 'transparent',
    border: 'none',
    color: 'inherit', // Heredar color del texto actual
    cursor: 'pointer',
    padding: '0 5px'
  }
};