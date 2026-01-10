'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { logout } from '@/app/store/slices/authSlice';
import { Home, LogOut, User, Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">SIEGSI</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sistema EGSI ESPE</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{user?.rolename}</p>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-3xl flex items-center justify-center shadow-xl">
              <Home className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Welcome */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Bienvenido al Sistema SIEGSI
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Sistema de Implementación de Gobierno de Seguridad de la Información
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Usuario</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.username}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rol</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.rolename}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Home className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Estado</h3>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Sesión Activa</p>
            </div>
          </div>

          {/* Info */}
          <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-2xl max-w-2xl mx-auto">
            <p className="text-green-800 dark:text-green-200 font-medium">
              📌 Esta es la página Home. Próximamente se agregarán más funcionalidades.
            </p>
          </div>

          {/* Theme indicator */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Tema actual: <span className="font-semibold text-green-600 dark:text-green-400">
              {theme === 'dark' ? 'Oscuro' : 'Claro'}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
