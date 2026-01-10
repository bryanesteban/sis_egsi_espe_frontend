'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Inicializar desde localStorage si está disponible
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (!savedTheme) {
        // Si no hay tema guardado, establecer 'light' por defecto
        localStorage.setItem('theme', 'light');
        return 'light';
      }
      return savedTheme;
    }
    return 'light';
  });

  useEffect(() => {
    // Aplicar el tema al cargar
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return { theme, toggleTheme };
}
