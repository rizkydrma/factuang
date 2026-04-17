import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';

export const useTheme = () => {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme, setTheme };
};
