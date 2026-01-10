'use client';

import { useEffect } from 'react';

export function ThemeInitializer() {
  useEffect(() => {
    // Ejecutar inmediatamente al montar
    const theme = localStorage.getItem('theme') || 'light';
    
    // Guardar el tema por defecto si no existe
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'light');
    }
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return null;
}
