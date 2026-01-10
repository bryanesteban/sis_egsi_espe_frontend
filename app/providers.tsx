'use client';

import { Provider } from 'react-redux';
import { store } from '@/app/store/store';
import { useEffect } from 'react';
import { restoreAuth } from '@/app/store/slices/authSlice';
import { ThemeProvider } from '@/app/context/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Restaurar autenticación desde localStorage al cargar la aplicación
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          store.dispatch(restoreAuth({ token, user }));
        } catch (error) {
          console.error('Error restoring auth:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </Provider>
  );
}
