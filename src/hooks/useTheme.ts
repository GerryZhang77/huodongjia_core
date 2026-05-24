import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.colorScheme = 'light';
    localStorage.setItem('theme', 'light');
    setTheme('light');
  }, []);

  const toggleTheme = () => {
    setTheme('light');
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };
}
