import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Estado del Tema (light/dark)
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'light');
  
  // Estado del Tamaño de Fuente (normal/large/xl)
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('app-font-size') || 'normal');

  // Aplicar Tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Aplicar Tamaño Fuente
  useEffect(() => {
    const sizes = {
      normal: '100%', // 16px
      large: '112.5%', // 18px
      xl: '125%'      // 20px
    };
    document.documentElement.style.setProperty('--base-font-size', sizes[fontSize]);
    localStorage.setItem('app-font-size', fontSize);
  }, [fontSize]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);