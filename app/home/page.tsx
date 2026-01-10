'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { logout } from '@/app/store/slices/authSlice';
import { Home as HomeIcon, LogOut, User, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

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
    return null; // O un loader mientras redirige
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">SIEGSI</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sistema EGSI ESPE</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Usuario */}
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">{user?.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {user?.rolename}
                  </p>
                </div>
              </div>

              {/* Botón Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-8">
          {/* Icono Home */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center">
              <HomeIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Mensaje de bienvenida */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Bienvenido al Sistema SIEGSI
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Sistema de Implementación de Gobierno de Seguridad de la Información
            </p>
          </div>

          {/* Cards de información */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Usuario Autenticado</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.username}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rol</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.rolename}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Estado</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sesión Activa</p>
            </div>
          </div>

          {/* Mensaje temporal */}
          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl max-w-2xl mx-auto">
            <p className="text-blue-900 dark:text-blue-200 font-medium">
              📌 Esta es la página Home. Próximamente se agregarán más funcionalidades.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
