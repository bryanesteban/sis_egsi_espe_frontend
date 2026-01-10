'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/app/store/slices/authSlice';
import { authAPI } from '@/lib/api';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  
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
    <div className="min-h-screen flex">
      {/* Panel Izquierdo - Imagen de fondo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <span className="text-3xl font-bold">S</span>
            </div>
            <h1 className="text-4xl font-bold">SIEGSI</h1>
          </div>
          <p className="text-xl text-blue-100 text-center max-w-md">
            Sistema de Implementación de Gobierno de Seguridad de la Información
          </p>
          <div className="mt-12 flex gap-4">
            <div className="w-3 h-3 rounded-full bg-white/30"></div>
            <div className="w-3 h-3 rounded-full bg-white/50"></div>
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SIEGSI</h1>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Login</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Please select your account
              </p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Login
                  </>
                )}
              </button>
            </form>

            {/* Opciones adicionales */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Login to a different account
              </p>
            </div>

            {/* Info de prueba (solo desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Credenciales de prueba:
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Usuario: <span className="font-mono font-semibold">cDaroma</span>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
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
