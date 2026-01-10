'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/app/store/slices/authSlice';
import { authAPI } from '@/lib/api';
import { Shield, Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      dispatch(loginFailure('Por favor ingrese usuario y contraseña'));
      return;
    }

    dispatch(loginStart());

    try {
      const response = await authAPI.login(username, password);
      
      dispatch(loginSuccess({
        token: response.token,
        user: {
          username: response.username,
          rolename: response.rolename,
        },
      }));
      
      router.push('/home');
    } catch (error: any) {
      const errorMessage = error.response?.data?.mensaje || 
                          error.response?.data?.error || 
                          'Error al iniciar sesión. Verifica tus credenciales.';
      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl shadow-lg transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Card Central Horizontal */}
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Panel Izquierdo - Header con fondo verde */}
        <div className="lg:w-2/5 bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 p-8 lg:p-12 text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-center lg:text-left">SIEGSI</h1>
            <p className="text-sm text-green-50 leading-relaxed text-center lg:text-left">
              Sistema de Implementación de Gobierno de Seguridad de la Información
            </p>
            <div className="mt-8 space-y-3 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <p className="text-green-50 text-sm">Gestión centralizada</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <p className="text-green-50 text-sm">Control de acceso seguro</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Formulario */}
        <div className="lg:w-3/5 p-8 lg:p-12">
          <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inicia sesión</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Accede a tu cuenta
              </p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                  placeholder="Ingresa tu usuario"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>

            {/* Info de prueba (solo desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-2">
                  Credenciales de prueba:
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  Usuario: <span className="font-mono font-semibold">cDaroma</span>
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  Contraseña: <span className="font-mono font-semibold">password</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
